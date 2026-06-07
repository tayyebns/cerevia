---
name: Cerevia Supabase RLS design
description: How GP/patient cross-table access control avoids RLS recursion
---

# Cerevia Supabase RLS

## The rule
Any RLS policy that needs to check a *different* table (e.g. `patients` policy
checking `gp_access`, or `gp_access` policy checking `patients`) MUST go through a
`SECURITY DEFINER` helper function — never an inline cross-table subquery.

Helpers: `current_patient_id()`, `current_gp_id()`, `gp_can_view_patient(uuid)`.

**Why:** `patients` and `gp_access` reference each other for the GP-linking
feature. Inline subqueries made each table's policy invoke the other's policy,
producing Postgres `42P17 infinite recursion detected in policy`. SECURITY
DEFINER functions bypass RLS, breaking the cycle.

**How to apply:** When adding a table a GP can read for linked patients, add a
`for select using (public.gp_can_view_patient(patient_id))` policy and a
patient-owner policy `using (patient_id = public.current_patient_id())`. Do NOT
write `exists (select 1 from gp_access ...)` directly inside a policy.

## Other notes
- `supabase/schema.sql` is the single source of truth; it is idempotent
  (`create ... if not exists`, `create or replace`, `drop policy if exists`).
  Re-run the whole file in the Supabase SQL Editor to apply changes.
- GP↔patient link is a one-time access-code claim done via the
  `link_patient_by_code` RPC (also SECURITY DEFINER) so GPs never need broad
  SELECT on `gp_access`.
- No generated Supabase types: `db.ts` casts the client `as any` and asserts
  local row types. Always add new queries in `db.ts`, never `supabase.from()`
  in components.
- `DATABASE_URL` in this repl points to Replit's built-in Postgres (`helium`),
  NOT Supabase — DDL cannot be applied from the repl; the user runs it in the
  Supabase SQL Editor.
