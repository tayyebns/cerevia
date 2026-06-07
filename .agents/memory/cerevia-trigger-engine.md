---
name: Cerevia trigger-management engine
description: Mock-first patient trigger platform — demo store is source of truth, and what the rule-based "confidence" metric actually means.
---

# Cerevia trigger-management engine

The patient experience (Home, Triggers, Log, Insights, Care) is **mock-first**: it
reads/writes an in-memory demo store (`src/lib/demo/store.ts`, `useSyncExternalStore`)
seeded deterministically with "Sarah Ahmed" (`seed.ts`). It does NOT require Supabase
to be usable — Supabase only gates the route via AuthGuard. The rule-based engine lives
in `src/lib/demo/insights.ts`.

## Trigger "confidence" is a co-occurrence metric, not comparative risk
`generateTriggerProfile` defines a trigger's confidence as **% of migraine days on which
that trigger was active** (hits / total migraines). It does NOT compare against
non-migraine days, so it is co-occurrence, not relative risk.

**Why:** the seed is hand-calibrated so the demo hits target numbers (Sleep ~87%,
Stress ~74%, Skipped meals ~61%, Caffeine ~27%). Re-defining confidence as comparative
risk (rate when active vs inactive) would invalidate those targets and the whole seed
calibration.

**How to apply:** if you ever switch to a comparative-risk metric, you MUST re-tune
`seed.ts` and the acceptance targets together. Keep narrative text honestly framed as
co-occurrence ("more frequently reported around X days", "appears associated"), never
causal, and never claim "severe" unless the code actually filters by severity.

## Simulated Apple Watch / wearable stream
The wearable signal (sleep, resting/avg HR, steps, active minutes) is **derived from
the check-ins**, not an independent dataset — `deriveWearableDay` in `seed.ts`. Its
jitter is seeded from the date string (deterministic per date), and the store rebuilds
the whole stream via `buildWearable` on every `addCheckin`/`addMigraine`.

**Why:** the summary (`getWearableSummary`) shows "this week" averages; if wearable were
seeded once and never rebuilt, logging a new check-in would leave it stale and
inconsistent with the rest of the app. Per-date determinism means rebuilding only
changes the touched day — existing history doesn't flicker.

**How to apply:** any change to wearable generation must stay per-date deterministic and
must keep being rebuilt on mutation. Keep it framed as "simulated" and pattern-only (no
diagnosis), consistent with the trigger engine's language.

## Visual identity: teal, not purple
The 766-line product spec describes the UI as purple/lilac. That is wrong for this
codebase — preserve the existing TEAL identity (#68B8AF / #4A9990). Ignore the spec's
color language.
