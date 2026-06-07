import { Router, type IRouter, type Request, type Response } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import type { MigraineEvent, MedicationLog } from "./types.js";

const router: IRouter = Router();

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 2_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const DISCLAIMER =
  "⚕️ *Cerevia AI provides insights based on your logged history. Please consult your GP for all medical decisions.*\n\n";

const EMERGENCY_KEYWORDS = [
  "worst headache",
  "worst pain",
  "thunderclap",
  "can't see",
  "vision loss",
  "can't speak",
  "can't walk",
  "collapse",
  "unconscious",
  "emergency",
  "ambulance",
];

// ── In-memory rate limiter (per authenticated user ID) ─────────────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/** Clears stale rate-limit entries every 5 minutes to prevent memory growth. */
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return false;

  entry.count++;
  return true;
}

// ── Supabase JWT verification ──────────────────────────────────────────────────

/**
 * Verifies a Supabase access token by calling the Supabase Auth API.
 * Returns the authenticated user ID, or null if the token is invalid.
 */
async function verifySupabaseToken(
  bearerToken: string,
): Promise<string | null> {
  const supabaseUrl =
    process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const supabaseAnonKey =
    process.env["SUPABASE_ANON_KEY"] ?? process.env["VITE_SUPABASE_ANON_KEY"];

  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        apikey: supabaseAnonKey,
      },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string };
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function isEmergency(message: string): boolean {
  const lower = message.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

function buildSystemPrompt(
  role: "patient" | "gp",
  patientContext?: {
    patientName?: string;
    linkedPatientName?: string;
    events?: MigraineEvent[];
    medicationLogs?: MedicationLog[];
  },
  language?: string,
): string {
  const languageInstruction =
    language && language.toLowerCase() !== "english"
      ? `\nLANGUAGE: You MUST respond entirely in ${language}. The user may write to you in any language — understand them and always reply in ${language}. Do not switch languages mid-response.\n`
      : "";
  const safeWording =
    "Use safe clinical wording: 'reported', 'appears', 'may be worth discussing', " +
    "'patient-reported', 'possible pattern', 'suggested consultation focus'. " +
    "Never diagnose, prescribe, or recommend medication changes. " +
    "Never replace clinical judgement. " +
    "Always include a brief safety reminder at the end of substantive responses.";

  if (role === "gp") {
    const name =
      patientContext?.linkedPatientName ??
      patientContext?.patientName ??
      "the patient";
    const events = patientContext?.events ?? [];
    const logs = patientContext?.medicationLogs ?? [];

    const eventSummary =
      events.length > 0
        ? events
            .slice(0, 20)
            .map(
              (e) =>
                `- ${e.date}: severity ${e.severity}/10` +
                (e.duration ? `, duration ${e.duration}h` : "") +
                (e.aura ? `, aura present` : "") +
                (e.triggers?.length
                  ? `, triggers: ${e.triggers.join(", ")}`
                  : "") +
                (e.notes ? `, note: "${e.notes}"` : ""),
            )
            .join("\n")
        : "No migraine events logged yet.";

    const medSummary =
      logs.length > 0
        ? Object.entries(
            logs.reduce(
              (acc, l) => {
                if (!acc[l.medication_name])
                  acc[l.medication_name] = { taken: 0, skipped: 0 };
                if (l.taken) acc[l.medication_name].taken++;
                else acc[l.medication_name].skipped++;
                return acc;
              },
              {} as Record<string, { taken: number; skipped: number }>,
            ),
          )
            .map(
              ([med, { taken, skipped }]) =>
                `- ${med}: ${taken} taken, ${skipped} skipped (${Math.round((taken / (taken + skipped)) * 100)}% adherence)`,
            )
            .join("\n")
        : "No medication logs yet.";

    return `You are Cerevia AI, a clinical consultation-intelligence assistant integrated into the Cerevia platform.
You are analysing patient data for a GP consultation. Be objective, summarise patterns clearly, and highlight anomalies in frequency, medication response, or triggers.
${languageInstruction}
PATIENT: ${name}
MIGRAINE EVENTS (most recent first):
${eventSummary}

MEDICATION ADHERENCE:
${medSummary}

CLINICAL GUIDANCE:
${safeWording}

Your responses help GPs prepare for consultations. Reference the patient's Migraine Twin and specific trends where relevant (e.g. correlations between triggers and severity). Keep responses concise and structured.`;
  }

  // Patient role
  const name = patientContext?.patientName ?? "the patient";
  const events = patientContext?.events ?? [];

  const recentSummary =
    events.length > 0
      ? `Their last ${Math.min(events.length, 10)} logged episodes show an average severity of ${(events.slice(0, 10).reduce((s, e) => s + e.severity, 0) / Math.min(events.length, 10)).toFixed(1)}/10.`
      : "They haven't logged any migraine episodes yet.";

  return `You are Cerevia AI, a helpful health-data assistant integrated into the Cerevia migraine management platform.
You are speaking with a patient named ${name}. ${recentSummary}
${languageInstruction}
Help them understand their logged migraine patterns, triggers, and medication data. Encourage them to log episodes and share data with their GP.

CLINICAL GUIDANCE:
${safeWording}

Keep responses warm, supportive, and brief. Reference their specific logged data where possible.`;
}

// ── Route ──────────────────────────────────────────────────────────────────────

router.post("/chat", async (req: Request, res: Response) => {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const authHeader = req.headers["authorization"] ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!bearerToken) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  const userId = await verifySupabaseToken(bearerToken);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  // ── 2. Rate limit ──────────────────────────────────────────────────────────
  if (!checkRateLimit(userId)) {
    res
      .status(429)
      .json({ error: "Too many requests — please wait a moment and try again" });
    return;
  }

  // ── 3. Input validation ────────────────────────────────────────────────────
  const { message, role, patientContext, language } = req.body as {
    message: string;
    role: "patient" | "gp";
    language?: string;
    patientContext?: {
      patientName?: string;
      linkedPatientName?: string;
      events?: MigraineEvent[];
      medicationLogs?: MedicationLog[];
    };
  };

  if (!message || !role) {
    res.status(400).json({ error: "message and role are required" });
    return;
  }

  if (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH) {
    res
      .status(400)
      .json({ error: `message must be under ${MAX_MESSAGE_LENGTH} characters` });
    return;
  }

  if (role !== "patient" && role !== "gp") {
    res.status(400).json({ error: "role must be 'patient' or 'gp'" });
    return;
  }

  // ── 4. Emergency detection — bypass LLM entirely ──────────────────────────
  if (isEmergency(message)) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const emergencyText =
      DISCLAIMER +
      "🚨 **This sounds like it may require immediate medical attention.**\n\n" +
      "If you are experiencing a sudden, severe headache unlike any before, vision changes, weakness, difficulty speaking, or any other neurological symptoms — **call emergency services (999 / 112 / 911) or go to your nearest A&E immediately.**\n\n" +
      "Cerevia AI cannot assess acute medical situations. Please seek emergency care now.";
    res.write(`data: ${JSON.stringify({ content: emergencyText })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  // ── 5. LLM streaming ──────────────────────────────────────────────────────
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write(`data: ${JSON.stringify({ content: DISCLAIMER })}\n\n`);

  try {
    const systemPrompt = buildSystemPrompt(role, patientContext, language);

    const stream = await openai.chat.completions.create(
      {
        model: "gpt-5.4",
        max_completion_tokens: 1_024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
      },
      { timeout: 30_000 },
    );

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

export default router;
