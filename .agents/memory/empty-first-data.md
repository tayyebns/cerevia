---
name: Empty-first data architecture
description: How Cerevia handles fresh vs demo-seeded accounts — signup, seeding, and live data fetching
---

# Empty-first data architecture

## Core rule
Signup trigger creates profile/patient/gp rows only — NO migraine or medication data seeded on signup.

## Demo seeding
- `artifacts/cerevia/src/lib/supabase/seedDemoData.ts` — call from client after auth
- Guards against double-seeding: checks for existing migraine_events first → returns `already_seeded`
- Inserts in batches of 200 to stay within Supabase request limits
- Triggered from PatientHome "Load Demo Data" button (only shown when events.length === 0)

## Live data pages
- **PatientHome** — real events count + last severity from getPatientMigraineEvents
- **DailyCare** — real migraine_events; chart, stats, filters, delete all live
- **Reminders** — today's medication_logs via getTodaysMedicationLogs; mark taken/add new via db helpers
- **GPDashboard** — real events + logs via gp_access join; already was live

## DB helpers added
- `getTodaysMedicationLogs(patientId)` — date window query for today
- `insertMedicationLog(...)`, `updateMedicationLogTaken(id, taken)`, `deleteMigraineEvent(id)`

## Empty state pattern
Each page shows a dashed-border "Get Started" card when no data exists, with instructions. Once data is present, the card disappears and real data renders.

**Why:** Judges and users need a clean account by default, but can instantly populate 12 weeks of realistic data for demo purposes. Separating this from signup prevents data contamination across roles or test accounts.
