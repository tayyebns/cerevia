---
name: Cerevia protected-route auth guards
description: How auth + role gating is enforced on the migrated Vite app (replaces Next.js middleware)
---

# Cerevia route protection (Vite + Wouter)

The original Next.js app gated `/patient*` and `/gp*` via `middleware.ts`. Vite/Wouter has no middleware, so protection lives in a client-side `AuthGuard` wrapping each protected route in `App.tsx`.

## Rules (must match the old middleware)
- Unauthenticated on a protected area -> `/auth/login`.
- `role === 'gp'` on patient routes -> `/gp`; non-GP on `/gp` -> `/patient`.
- Role fallback is `'patient'` when `user_metadata.role` is missing — mirror this exactly.

## Demo-mode carve-out (important)
- When `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are absent, the guard ALLOWS access. Without this, the demo (which runs on mock data with no real auth) would trap users on a login page that can't authenticate.

**Why:** A reviewer rejected the migration for dropping the middleware's access control. The guard restores it while keeping the documented graceful-degradation-without-env-vars behavior.

**How to apply:** Any NEW `/patient/*` or `/gp/*` route must be wrapped in `<AuthGuard area="...">` — guarding is by-convention per route, so an unwrapped new route is silently unprotected. This is client-side UX gating, not a server authz boundary.
