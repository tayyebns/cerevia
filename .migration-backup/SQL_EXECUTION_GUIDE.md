# Step-by-Step: Execute SQL in Supabase

## The Error You See
```
Database error saving new user
```

This means the database trigger that auto-creates profiles is failing because **the tables don't exist yet**.

---

## Visual Guide

### Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com/project/dxrihtgbsyqvcuxbbzzm
2. On the **left sidebar**, find **SQL Editor**
3. Click **SQL Editor**
4. You'll see a query window with sample text

### Step 2: Create New Query

1. Click the **"New Query"** button (top of SQL Editor)
2. You'll see a blank query window

### Step 3: Copy the SQL

1. Open file: `c:\Users\marmu\Downloads\hackthon\cerevia\supabase\migrations\001_init.sql`
2. **Select All** (Ctrl+A)
3. **Copy** (Ctrl+C)

**What you're copying:**
```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique,
  role text check (role in ('patient', 'gp', 'carer')) not null,
  created_at timestamptz default now()
);

create table patients (
  ...
)

[and 4 more table definitions + RLS policies + trigger]
```

### Step 4: Paste into Supabase

1. Click in the **Supabase SQL query window**
2. **Paste** (Ctrl+V)
3. You should see the full SQL code in the editor

### Step 5: Execute

1. Click the **▶️ RUN** button (top-right of the query window)
2. Or press **Ctrl+Enter**
3. Wait for the query to complete (should be instant)

### Step 6: Check Results

You should see:
```
✓ Success
6 rows affected
```

If you see errors, scroll down in the results panel to see what went wrong.

### Step 7: Verify Tables

1. Click **Tables** (left sidebar)
2. You should now see:
   - profiles
   - patients
   - gp_profiles
   - medications
   - migraine_events
   - gp_access

If all 6 tables are there, ✅ **SQL executed successfully!**

---

## What This SQL Does

When you run this SQL, Supabase creates:

1. **6 Database Tables** with columns, constraints, indexes
2. **Row Level Security (RLS)** policies to protect data
3. **PostgreSQL Function** called `handle_new_user()`
4. **PostgreSQL Trigger** called `on_auth_user_created`

The trigger is the key part - it automatically runs when someone signs up:
- Creates a row in `profiles` table
- If role = 'patient', also creates a `patients` row
- If role = 'gp', also creates a `gp_profiles` row

---

## If You Get an Error

### "Syntax error near..."
→ You didn't copy the entire file. Make sure you copy ALL text from 001_init.sql

### "relation already exists"
→ Tables already exist (maybe from a previous run). This is OK!
→ Just try signing up again - the trigger should work now.

### "permission denied on schema public"
→ You might not have the right project selected
→ Double-check the URL: https://app.supabase.com/project/**dxrihtgbsyqvcuxbbzzm**

### "unexpected error"
→ Click the error message to expand it and see more details
→ Copy the full error and share it

---

## After SQL is Executed

1. ✅ **Disable Email Confirmations:**
   - Project Settings → Auth → Email Confirmations → Disable
   
2. ✅ **Test Sign Up:**
   - Visit http://localhost:3000
   - Click "Continue as Patient"
   - Fill in form and submit
   - Should redirect to `/patient` dashboard

3. ✅ **Done!**
   - Your live Cerevia demo is working

---

## I Still Get "Database error saving new user"

This means the trigger is still failing. Most common causes:

1. **SQL wasn't fully copied** → Re-run the ENTIRE 001_init.sql
2. **Email confirmations not disabled** → Go to Auth settings and disable
3. **Trigger function has a bug** → Run this query to see the error:

```sql
-- Check if the function exists
SELECT routine_definition FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

4. **Still stuck?** → Clean and restart:

```sql
-- Drop everything
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS gp_access CASCADE;
DROP TABLE IF EXISTS migraine_events CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS gp_profiles CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

Then run the entire 001_init.sql again from scratch.
