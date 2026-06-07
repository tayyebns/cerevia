---
name: Cerevia theme / FOUC prevention
description: How dark-mode-default and no-flash theming is wired in the Cerevia Vite app
---

# Cerevia theming (Vite + next-themes, NOT Next.js)

Cerevia is a Vite + Wouter SPA. `next-themes` is used purely client-side — there is no SSR and no Next.js blocking script, so FOUC must be prevented manually.

## How no-FOUC dark default works
- `index.html` ships `<html class="dark" style="color-scheme: dark">` AND a blocking inline `<script>` in `<head>` that reads `localStorage['theme']` and toggles the `dark` class before first paint. Rule: dark unless the stored value is exactly `'light'`.
- `ThemeProvider` must keep `storageKey="theme"` so the inline script and next-themes agree on the same key. If you change the storageKey, change the inline script too — they are a contract.
- `enableSystem={false}` is intentional: dark is a medical accommodation (photophobia), so the app must default dark regardless of OS preference, not follow `prefers-color-scheme`.

**Why:** A naive next-themes setup in a Vite SPA flashes light on first load because the class is applied after JS boots. The inline pre-paint script is the fix.

## Navbar / headers
- `src/components/Navbar.tsx` is the shared public-route header (Landing, AuthLayout): teal #68B8AF Cormorant Garamond wordmark + ThemeToggle pill.
- GP and Patient layouts intentionally keep their own specialized headers (GP = dark dashboard w/ back/avatar; Patient = mobile app w/ language pills + compact toggle). Do NOT force the shared Navbar onto them — it breaks those layouts. The ThemeToggle is present in all of them, so theme switching is global.
