# Cerevia Supabase Backend Implementation - Complete ✅

## What Was Implemented

Your Cerevia hackathon demo now has a fully functional Supabase authentication and database backend with Row-Level Security (RLS). Judges can sign up with their own emails, select a role (Patient/GP), and access the appropriate dashboard.

---

## 📦 Architecture Overview

### Authentication Flow
1. **Landing page** (`/`) → User clicks "Continue as Patient/GP"
2. **Signup page** (`/auth/signup`) → User enters email, password, full name, and selects role
3. **Backend trigger** → Supabase automatically creates `profiles`, `patients`, or `gp_profiles` row
4. **Redirect** → User redirected to `/patient` or `/gp` based on role
5. **Middleware protection** → Unauthenticated users redirected to `/auth/login`; users accessing wrong role dashboard redirected to their dashboard

### Database Schema
- **profiles** — Core user data (email, role, full_name, created_at)
- **patients** — Patient-specific data (profile_id, DOB, language, diagnosis)
- **gp_profiles** — GP-specific data (profile_id, practice_name, role_title)
- **medications** — Patient medications (patient_id, name, dosage, active)
- **migraine_events** — Migraine logs (patient_id, severity, duration, description)
- **gp_access** — GP access control (patient_id, gp_id, access_status, expires_at)

**All tables have RLS enabled** — users can only read/write their own data or data they have explicit access to.

---

## 📁 Files Created

### Auth Utilities (`/lib/auth/`)
- **`client.ts`** — Browser-side Supabase client
- **`server.ts`** — Server-side Supabase client for API routes
- **`middleware.ts`** — Middleware client for session management
- **`types.ts`** — TypeScript types (User, Session, Profile, PatientProfile, GPProfile)

### Auth UI Components (`/components/auth/`)
- **`SignupForm.tsx`** — Signup form with role selector (Patient/GP radio buttons)
  - Cerevia brand styling: dark mode default, teal buttons, pill-shaped buttons
  - Error handling and loading states
- **`LoginForm.tsx`** — Login form with email/password
  - Role-based redirect after login
- **`AuthLayout.tsx`** — Reusable layout with Cerevia branding, header, theme toggle

### Auth Routes (`/app/auth/`)
- **`/auth/signup/page.tsx`** — Signup page (public, force-dynamic)
- **`/auth/login/page.tsx`** — Login page (public, force-dynamic)
- **`/app/auth/callback/route.ts`** — OAuth callback handler (for future OAuth integration)

### Route Protection
- **`/middleware.ts`** — Root middleware for session validation and role-based routing
  - Redirects unauthenticated users to `/auth/login`
  - Redirects GPs trying to access `/patient/*` to `/gp`
  - Redirects patients trying to access `/gp` to `/patient`

### Database Migrations
- **`/supabase/migrations/001_init.sql`** — Complete schema + RLS policies + PostgreSQL trigger
  - 6 tables with cascading deletes and foreign keys
  - RLS policies for all tables (patients ↔ GPs, access control)
  - PostgreSQL function to auto-create profiles on auth signup
  - Trigger on `auth.users` insert

### Configuration
- **`.env.example`** — Template for environment variables
- **`SUPABASE_SETUP.md`** — Step-by-step Supabase project creation and migration guide

### Files Modified
- **`/app/page.tsx`** — Landing page CTA links now go to `/auth/signup`; added login link to header
- **`/app/patient/layout.tsx`** — Added logout button; fetches user name from Supabase session
- **`/app/gp/layout.tsx`** — Added logout button; fetches GP name from Supabase session
- **`/app/patient/page.tsx`** — Added `export const dynamic = 'force-dynamic'` to skip prerendering
- **`/app/patient/*/page.tsx`** — All patient subpages (daily-care, reminders, capture) marked dynamic
- **`/app/gp/page.tsx`** — Marked dynamic to skip prerendering
- **`package.json`** — Added `@supabase/ssr` and `@supabase/supabase-js` dependencies

---

## 🚀 Getting Started

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New project"
4. Choose a region (e.g., US East) and set a password
5. Wait for initialization (~2 minutes)

### 2. Add Environment Variables
1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy your **Project URL** and **Anon Key**
3. Create `.env.local` in your project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

### 3. Execute Database Schema
1. In Supabase dashboard, go to **SQL Editor** → **New Query**
2. Open `/supabase/migrations/001_init.sql` from your project
3. Copy the entire SQL code
4. Paste into the Supabase query editor
5. Click **Run**
6. Verify tables appear in **Tables** section

### 4. Disable Email Confirmations (for development)
1. Go to **Project Settings** → **Auth** → **Email Confirmations**
2. Toggle **Disable** (for hackathon testing; re-enable in production)

### 5. Test Locally
```bash
npm run dev
# Visit http://localhost:3000
```

**Test flow:**
1. Click "Continue as Patient"
2. Sign up: email `judge1@example.com`, password `Test123!`, role "Patient"
3. Redirected to `/patient` dashboard
4. Click logout (top-right)
5. Click "Continue as GP"
6. Sign up: email `judge2@example.com`, password `Test123!`, role "GP"
7. Redirected to `/gp` dashboard
8. Try accessing `/patient` → middleware redirects to `/gp`

---

## 🔐 Security Features

### Row-Level Security (RLS)
- **Patients** can only read/update their own profile and patient record
- **GPs** can only read/update their own GP profile
- **Medications & Migraine Events** — only accessible by patient owner OR GPs with active access
- **GP Access control** — patients manage which GPs can see their data

### Session Management
- Cookies are httpOnly, secure, and sameSite
- Session refreshed on every middleware call
- Unauthenticated requests redirected to login

### Input Validation
- Email format validated
- Passwords required (enforced by Supabase)
- Role must be one of: 'patient', 'gp', 'carer'

---

## 🎨 UI/UX Integration

### Brand Adherence
- **Dark mode default** (#1C2625) in all auth forms
- **Teal primary buttons** (#68B8AF) for CTAs
- **Pill-shaped buttons** (radius-pill CSS variable)
- **Small rounded inputs** (radius-s CSS variable)
- Cerevia logo in header, theme toggle available

### Responsive Design
- Auth pages work on mobile (max-width adaptable)
- Patient dashboard: mobile-first (max-width: lg)
- GP dashboard: desktop-optimized (max-width: 7xl)

---

## 📊 What's Next (For Judges)

### To Test Live
1. Clone the repo
2. Follow the "Getting Started" steps above
3. Sign up and use the dashboards

### To Connect Real Data (Future)
The mock data from `/lib/data.ts` is currently used in patient/GP dashboards. To connect real Supabase data:
1. Add `useEffect` hooks in dashboards to fetch from Supabase
2. Query `medications` table for patient medications
3. Query `migraine_events` for patient events
4. Query `gp_access` for GP access records

### To Add More Features
- **GP grants access**: GPs send access codes to patients
- **Patient revokes access**: Patients can mark GP access as 'revoked'
- **Export reports**: GPs export patient migraine summaries
- **OAuth integrations**: Add Google/GitHub signup

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Missing Supabase env vars"** | Did you create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`? Restart dev server. |
| **"Auth is not available yet"** | Wait 2 minutes after creating Supabase project. Auth is enabled by default. |
| **Signup fails with "User already exists"** | Each email can only sign up once. Use different emails for testing. |
| **Logged in but redirected to login** | Middleware might be checking auth in the browser before session is ready. Refresh page. |
| **"Permission denied" on RLS queries** | RLS policies are restrictive by design. Users can only access their own data. To debug: check Supabase logs. |

---

## 📝 Key Implementation Details

### Trigger Auto-Creation
When a user signs up via Supabase Auth with role metadata:
```sql
-- User calls: supabase.auth.signUp({ email, password, data: { role: 'patient' } })
-- Trigger executes: creates profiles row + patients row automatically
```

### Middleware Role Checking
```typescript
// /middleware.ts extracts user role from user_metadata.role
if (gp_user tries to access /patient) → redirect to /gp
if (patient tries to access /gp) → redirect to /patient
```

### Dynamic Page Exports
All patient/GP pages marked `export const dynamic = 'force-dynamic'` to skip prerendering during build (since Supabase env vars may not be set during build time).

---

## 📞 Support Files

- **SUPABASE_SETUP.md** — Full setup walkthrough with screenshots
- **AGENTS.md** — Project context for AI agents
- **.env.example** — Environment variables template

---

## ✅ Checklist Before Demo

- [ ] Supabase project created at supabase.com
- [ ] `.env.local` file created with credentials
- [ ] SQL schema executed in Supabase SQL Editor
- [ ] Email confirmations disabled (or SMTP configured)
- [ ] `npm run dev` runs without errors
- [ ] Landing page loads at http://localhost:3000
- [ ] Can sign up as Patient → redirected to `/patient`
- [ ] Can sign up as GP → redirected to `/gp`
- [ ] Can log out → redirected to `/auth/login`
- [ ] Role-based routing works (GP trying `/patient` → redirected to `/gp`)

**Judges will be impressed by:** Full auth flow, role-based dashboards, professional UI, and secure database access. 🎉
