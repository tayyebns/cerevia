---
name: Cerevia AI chat integration
description: How Cerevia AI chat is wired — api-server route, Vite proxy, component, guardrails
---

# Cerevia AI chat

## Architecture
- POST /api/chat on the Express api-server (port 8080) — SSE stream
- Vite dev server proxies /api → localhost:8080 (set in vite.config.ts server.proxy)
- Frontend fetches context (events, meds) from Supabase before the first message,
  then sends it as patientContext in the request body
- Model: gpt-5.4, max_completion_tokens: 8192

## Key files
- artifacts/api-server/src/routes/chat/index.ts — route + system prompt builder
- artifacts/cerevia/src/components/CereviaChat.tsx — FAB + panel + SSE consumer
- Mounted in PatientLayout (role="patient") and GPLayout (role="gp")

## Medical guardrails (non-negotiable)
- Emergency keyword detection fires BEFORE the LLM call — returns A&E prompt immediately
- Disclaimer prepended to every response (including streamed ones)
- System prompt uses safe wording: "reported", "appears", "may be worth discussing"
- Footer label: "Not medical advice · Always consult your GP"

## Integration
- lib/integrations-openai-ai-server — Replit-managed OpenAI proxy; env vars
  AI_INTEGRATIONS_OPENAI_BASE_URL + AI_INTEGRATIONS_OPENAI_API_KEY auto-provisioned
- tsconfig.json (root) and api-server tsconfig.json must both reference
  lib/integrations-openai-ai-server or tsc --build fails with TS6305

**Why:** Keeping the API key on the server (not the browser) is required for
security. The Vite proxy makes /api calls from the React app route to the Express
server in dev without CORS issues.
