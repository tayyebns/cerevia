# Debug: Trigger Function Error

The SQL ran, but the trigger is still failing. Let's find out why.

## Step 1: Check if Trigger Exists

1. Go to Supabase → **SQL Editor** → **New Query**
2. Paste this and run:

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

**Expected result:** One row with `on_auth_user_created`

If you see nothing, the trigger wasn't created. Go to Step 3.

---

## Step 2: Check Function Definition

1. **SQL Editor** → **New Query**
2. Paste this:

```sql
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';
```

**Expected:** Shows the function code

**If empty:** Function doesn't exist. Go to Step 3.

---

## Step 3: Check Supabase Logs

1. Go to Supabase Dashboard
2. Click **Logs** (left sidebar, near bottom)
3. Look for **Auth** or **Database** logs
4. Filter for your signup attempt
5. **Copy the full error message**

This will tell you exactly what's failing.

---

## Step 4: Manual Test - Does the Function Work?

Run this query in SQL Editor:

```sql
-- Test if the function works
SELECT public.handle_new_user(
  'test-uuid-12345'::uuid,
  'test@example.com'::text,
  'Test User'::text,
  'patient'::text
);
```

**Expected:** Returns the user row or completes without error

**If error:** The function itself is broken. See Step 5.

---

## Step 5: Likely Problem - RLS Policies Blocking Insert

The trigger function tries to INSERT into `profiles`, but RLS policies might be blocking it.

**Fix:** Make the function bypass RLS:

1. **SQL Editor** → **New Query**
2. Drop and recreate the function:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.user_metadata->>'full_name', 'User'),
    COALESCE(new.user_metadata->>'role', 'patient')
  );

  -- Auto-create patient or gp_profiles based on role
  IF new.user_metadata->>'role' = 'patient' THEN
    INSERT INTO public.patients (profile_id, primary_language, diagnosis)
    VALUES (new.id, 'en', 'Chronic migraine');
  ELSIF new.user_metadata->>'role' = 'gp' THEN
    INSERT INTO public.gp_profiles (profile_id, role_title)
    VALUES (new.id, 'GP');
  END IF;

  RETURN new;
EXCEPTION WHEN others THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

3. Click **Run**
4. Try signing up again

---

## Step 6: Check RLS Policies

The issue might be RLS is TOO restrictive:

1. Go to **Tables** → **profiles**
2. Click **RLS** tab
3. Look at the policies

**The problem:** RLS policies prevent inserting during auth signup!

**The fix:** Temporarily DISABLE RLS on profiles:

1. **Tables** → **profiles**
2. Click **RLS** tab
3. Toggle **Enable RLS** to OFF (temporarily)
4. Try signing up
5. ✅ If it works, RLS was the issue

**If that fixes it, we need to fix the RLS policies to allow the trigger.**

---

## Step 7: If RLS is the Problem

Replace RLS policies with ones that allow the trigger:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "users_can_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;

-- Create new policies that allow trigger
CREATE POLICY "trigger_can_insert_profiles" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_can_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

Then try signing up again.

---

## Quick Checklist

- [ ] Run the trigger existence check query
- [ ] Run the function existence check query
- [ ] Check Supabase Logs for error message
- [ ] If RLS is ON, try disabling it temporarily
- [ ] If disabling RLS fixes it, use the corrected RLS policies above
- [ ] Try signing up again
