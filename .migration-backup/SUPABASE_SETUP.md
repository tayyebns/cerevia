# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project (choose your preferred region)
4. Wait for the project to initialize (usually ~2 minutes)

## 2. Get Your Credentials

1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy your **Project URL** and **Anon Key**
3. Create `.env.local` in the project root with:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Execute Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `/supabase/migrations/001_init.sql` in your editor
4. Copy the entire SQL code
5. Paste it into the Supabase SQL Editor
6. Click **Run**
7. Verify all tables were created (check **Tables** section)

## 4. Test the Application

```bash
npm run dev
```

Open http://localhost:3000 and:
1. Click "Continue as Patient" → Sign up with your email and password, select "Patient"
2. You should be redirected to `/patient` dashboard
3. Sign up again with a different email, select "GP"
4. You should be redirected to `/gp` dashboard

## 5. Verify Row-Level Security

RLS policies are automatically enabled in the migration. To verify:
1. Go to **Tables** in Supabase
2. Select any table (e.g., `profiles`)
3. Go to **RLS** tab
4. You should see enabled policies

## Troubleshooting

**Error: "Project not initialized"**
- Wait 5 minutes after creating the project before running the migration

**Error: "Auth is not configured"**
- Supabase Auth is enabled by default. No additional setup needed.

**Auth forms not working**
- Check `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`

**Signup redirects to login**
- Check Supabase email confirmation settings:
  - Go to **Project Settings** → **Auth**
  - Find **Email Confirmations** → set to **Disable** for development (or configure email SMTP)
