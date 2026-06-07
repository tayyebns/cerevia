-- ============================================================
-- Migration: fix GP profile auto-provisioning
-- Run this in the Supabase SQL Editor if you have existing GP
-- accounts that show "Your account is not registered as a GP".
--
-- What it does:
--  1. Backfills gp_profiles rows for any auth user whose profiles.role
--     is 'gp' but has no gp_profiles row (accounts created before
--     the handle_new_user trigger was installed).
--  2. Replaces link_patient_by_code so it self-heals on first call:
--     if the gp_profiles row is still missing it is created on the
--     spot, rather than returning the "not_a_gp" error.
-- ============================================================

-- Step 1: backfill aany GP accounts that are missing a gp_profiles row
insert into public.gp_profiles (user_id)
select p.id
from   public.profiles p
where  p.role = 'gp'
  and  not exists (
    select 1 from public.gp_profiles gp where gp.user_id = p.id
  );

-- Step 2: replace link_patient_by_code with the self-healing version
create or replace function public.link_patient_by_code(p_code text)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_gp_profile_id uuid;
  v_access_id     uuid;
  v_patient_id    uuid;
begin
  -- Auto-provision gp_profiles row if the caller has role='gp' in profiles
  -- (handles accounts created before the trigger was installed)
  insert into public.gp_profiles (user_id)
  select auth.uid()
  where exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'gp'
  )
  on conflict (user_id) do nothing;

  select id into v_gp_profile_id
  from public.gp_profiles where user_id = auth.uid();

  if v_gp_profile_id is null then
    return jsonb_build_object('error', 'not_a_gp');
  end if;

  update public.gp_access
  set gp_id = v_gp_profile_id
  where access_code   = upper(p_code)
    and access_status = 'active'
    and expires_at    > now()
    and gp_id         is null
  returning id, patient_id into v_access_id, v_patient_id;

  if v_access_id is null then
    return jsonb_build_object('error', 'code_not_found');
  end if;

  return jsonb_build_object('access_id', v_access_id, 'patient_id', v_patient_id);
end;
$$;
