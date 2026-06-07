# ⚠️ Database Error - Trigger Issue

## Problem
When you try to sign up, you get: **"Database error saving new user"**

This happens because the PostgreSQL trigger that creates profiles is failing.

## Root Cause
The SQL schema in `/supabase/migrations/001_init.sql` hasn't been executed yet.

## Solution

### 1. Check If Tables Exist
Go to your Supabase Dashboard → **Tables** section

You should see these 6 tables:
- [ ] profiles
- [ ] patients
- [ ] gp_profiles
- [ ] medications
- [ ] migraine_events
- [ ] gp_access

**If you DON'T see these tables**, proceed to Step 2.

### 2. Execute the SQL Schema

1. Open: https://app.supabase.com/project/dxrihtgbsyqvcuxbbzzm
2. Go to: **SQL Editor** (left sidebar)
3. Click: **New Query**
4. **Copy the entire content** from `/supabase/migrations/001_init.sql`
   ```bash
   # On Windows (Git Bash or PowerShell):
   Get-Content "C:\Users\marmu\Downloads\hackthon\cerevia\supabase\migrations\001_init.sql" | Set-Clipboard
   ```
5. **Paste into** Supabase SQL Editor
6. Click **Run** (or Ctrl+Enter)
7. Wait for completion

**Expected output:**
```
Query executed successfully
6 rows affected
```

### 3. Verify Tables Were Created

1. Go to **Tables** in Supabase
2. You should see all 6 tables listed
3. Click on **profiles** table
4. You should see columns: id, full_name, email, role, created_at
5. Check **RLS** tab → Should see enabled policies

### 4. Verify Trigger Was Created

1. Go to **SQL Editor**
2. Click **New Query**
3. Paste this and run:
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'pg_catalog' OR event_object_schema = 'public';
```
4. You should see: `on_auth_user_created`

### 5. Test Sign Up Again

1. Refresh http://localhost:3000
2. Try signing up
3. ✅ Should work now!

---

## If SQL Still Fails

**Error: "relation already exists"**
→ Good! Tables are already there. Run this to drop and recreate:

```sql
-- DROP EVERYTHING
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS gp_access CASCADE;
DROP TABLE IF EXISTS migraine_events CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS gp_profiles CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

Then copy the entire 001_init.sql and run it fresh.

**Error: "permission denied"**
→ Make sure you're using the **dxrihtgbsyqvcuxbbzzm** project

---

## Quick Checklist

- [ ] Opened Supabase dashboard
- [ ] Went to SQL Editor
- [ ] Pasted entire 001_init.sql
- [ ] Clicked Run
- [ ] Saw "6 rows affected" or similar
- [ ] Tables now visible in Tables section
- [ ] Email confirmations DISABLED (Project Settings → Auth)
- [ ] Tried signing up again
