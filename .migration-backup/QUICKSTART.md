# Cerevia Supabase - Live Setup Instructions

Your `.env.local` is now configured with your Supabase project. Follow these steps to complete setup:

## Step 1: Execute Database Schema

1. Go to your Supabase dashboard: https://app.supabase.com/project/dxrihtgbsyqvcuxbbzzm
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire content of `/supabase/migrations/001_init.sql`
5. Paste into the Supabase SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message

**Expected:** All queries execute without errors. Check **Tables** section to verify tables exist.

## Step 2: Disable Email Confirmations (for testing)

1. Go to **Project Settings** → **Auth** (left sidebar)
2. Scroll to **Email Confirmations**
3. Toggle **Disable** (green toggle)
4. **Save**

This allows users to sign up and login immediately without email verification.

## Step 3: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 4: Test the Full Flow

### Test Patient Signup
1. Click "Continue as Patient"
2. Fill signup form:
   - Full Name: `Alice Johnson`
   - Email: `alice@example.com`
   - Password: `Test123!@`
   - Role: Select "Patient"
3. Click "Sign Up"
4. ✅ Should redirect to `/patient` dashboard

### Test GP Signup
1. Go back to http://localhost:3000
2. Click "Continue as GP"
3. Fill signup form:
   - Full Name: `Dr. Sarah Chen`
   - Email: `sarah@example.com`
   - Password: `Test123!@`
   - Role: Select "GP"
4. Click "Sign Up"
5. ✅ Should redirect to `/gp` dashboard with your name in top-right

### Test Logout
1. Click the logout button (red icon, top-right)
2. ✅ Should redirect to `/auth/login`

### Test Role-Based Routing
1. While logged in as Patient, manually visit `http://localhost:3000/gp`
2. ✅ Middleware should redirect back to `/patient`

## ✅ You're Ready!

Your Cerevia hackathon demo is now live with:
- ✅ Full authentication (Email/Password)
- ✅ Role-based signup (Patient/GP)
- ✅ Secure database with RLS
- ✅ Protected routes with middleware
- ✅ Professional Cerevia branding

The judges can now:
1. Visit http://localhost:3000 (or your deployed URL)
2. Sign up with their own email
3. Select Patient or GP role
4. Access their dashboard
5. See their role and data is protected

## Troubleshooting

**SQL execution fails:**
- Copy the entire `/supabase/migrations/001_init.sql` file
- Make sure you're in the correct Supabase project
- Check for syntax errors in SQL output

**"Auth not available":**
- Wait 2 minutes after project creation
- Try refreshing the page

**Still can't sign up:**
- Check that email confirmations are disabled
- Check browser console for errors (F12 → Console)
- Try a different email address

**Build fails:**
- Make sure `.env.local` has both env vars
- Run: `npm install` to ensure dependencies are installed
- Delete `.next` folder: `rm -rf .next && npm run build`
