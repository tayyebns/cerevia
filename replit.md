# Cerevia

Cerevia is a migraine management hackathon demo with two roles: patient (symptom/medication tracking) and GP (AI-assisted dashboard).

## Run & Operate

- `pnpm --filter @workspace/cerevia run dev` — run the Cerevia frontend (port from $PORT env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env (for auth): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind v4, Wouter (routing), Framer Motion, Recharts
- Auth: Supabase (client-side only — no Express backend needed)
- Build: Vite

## Where things live

- `artifacts/cerevia/` — the Cerevia react-vite artifact
- `artifacts/cerevia/src/lib/data.ts` — all demo/mock data (migraine events, medication, trends)
- `artifacts/cerevia/src/lib/auth/client.ts` — Supabase client singleton
- `artifacts/cerevia/src/index.css` — Tailwind v4 + Cerevia CSS token system (--bg, --surface, etc.)
- `artifacts/cerevia/src/App.tsx` — routing (wouter Switch/Route)
- `artifacts/cerevia/src/pages/` — Landing, auth (Login/Signup/Callback), patient (Home/DailyCare/Capture/Reminders), gp (Dashboard)
- `artifacts/cerevia/src/components/` — ThemeProvider, ThemeToggle, SplashScreen, ModelViewer, BottomNav, auth forms

## Architecture decisions

- Pure frontend app — Supabase handles all auth, no Express API routes needed
- Wouter replaces Next.js routing; `<a>` tags used for external navigation, `<Link>` for internal
- ModelViewer replaces the 3D model-viewer web component with a static SVG illustration (WebGL not available in sandbox)
- SplashScreen runs once per browser session (sessionStorage flag), skipped on repeat visits
- All demo data is in `src/lib/data.ts` — no DB needed for the hackathon demo

## Product

- **Landing page** — hero with patient/GP role selection
- **Patient app** — mobile-style layout with bottom nav: Home (summary), Daily Care (symptom log + chart), Capture (appointment recording), Reminders (medication schedule)
- **GP dashboard** — patient overview, frequency/severity/trigger charts, medication effectiveness, migraine event timeline, AI consultation copilot with pre-loaded summary

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Supabase env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) must be set for auth to work; without them the app still renders all UI using demo data
- Tailwind v4 — no `tailwind.config.js`; all tokens live in `@theme inline {}` inside `index.css`
- Google Fonts `@import` must be the **first** line in `index.css` (before any `@import "tailwindcss"`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
