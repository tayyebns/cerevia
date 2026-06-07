-- ============================================================
-- Cerevia — Supabase schema (clean rebuild)
-- Run this ENTIRE script in the Supabase SQL Editor.
-- It drops and recreates all tables — safe because the tables
-- are empty and we need a clean schema slate.
-- ============================================================

-- ── Teardown ─────────────────────────────────────────────────
-- Drop in dependency order (children first); CASCADE handles FK refs.

drop trigger  if exists on_auth_user_created on auth.users;

drop function if exists public.get_linked_patients()         cascade;
drop function if exists public.link_patient_by_code(text)    cascade;
drop function if exists public.handle_new_user()             cascade;
drop function if exists public.gp_can_view_patient(uuid)     cascade;
drop function if exists public.current_gp_id()               cascade;
drop function if exists public.current_patient_id()          cascade;

drop table if exists public.medication_logs  cascade;
drop table if exists public.migraine_events  cascade;
drop table if exists public.gp_access        cascade;
drop table if exists public.gp_profiles      cascade;
drop table if exists public.patients         cascade;
drop table if exists public.profiles         cascade;
-- also remove the old guide's "medications" table if it exists
drop table if exists public.medications      cascade;

-- ── Tables ───────────────────────────────────────────────────

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'patient' check (role in ('patient', 'gp')),
  full_name  text,
  created_at timestamptz default now()
);

create table public.patients (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table public.gp_profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique not null references auth.users(id) on delete cascade,
  practice   text,
  created_at timestamptz default now()
);

create table public.migraine_events (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  date       date not null default current_date,
  severity   int  not null check (severity between 1 and 10),
  duration   int,
  triggers   text[],
  aura       boolean default false,
  notes      text,
  created_at timestamptz default now()
);

create table public.medication_logs (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid not null references public.patients(id) on delete cascade,
  medication_name  text not null,
  taken            boolean not null default true,
  scheduled_at     timestamptz not null default now(),
  created_at       timestamptz default now()
);

create table public.gp_access (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references public.patients(id) on delete cascade,
  gp_id         uuid references public.gp_profiles(id) on delete set null,
  access_code   text unique not null,
  access_status text not null default 'active'
                  check (access_status in ('active', 'revoked', 'expired')),
  expires_at    timestamptz not null,
  created_at    timestamptz default now()
);

-- ── SECURITY DEFINER helpers ──────────────────────────────────
-- These run with the definer's privileges and bypass RLS.
-- Using them inside policies is the canonical way to avoid the
-- "infinite recursion detected in policy" (42P17) error that occurs
-- when policy A subqueries table B whose policy subqueries table A.

create function public.current_patient_id()
returns uuid
language sql stable
security definer set search_path = public
as $$
  select id from public.patients where user_id = auth.uid();
$$;

create function public.current_gp_id()
returns uuid
language sql stable
security definer set search_path = public
as $$
  select id from public.gp_profiles where user_id = auth.uid();
$$;

create function public.gp_can_view_patient(p_patient_id uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.gp_access ga
    join public.gp_profiles gp on gp.id = ga.gp_id
    where ga.patient_id    = p_patient_id
      and ga.access_status = 'active'
      and ga.expires_at    > now()
      and gp.user_id       = auth.uid()
  );
$$;

-- ── Auto-provision profile + role record on signup ────────────

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'patient'),
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;

  if new.raw_user_meta_data->>'role' = 'gp' then
    insert into public.gp_profiles (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  else
    insert into public.patients (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── RPC: link a patient by access code (called by GP) ────────
-- SECURITY DEFINER: GP doesn't need broad SELECT on gp_access.

create function public.link_patient_by_code(p_code text)
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

-- ── RPC: get linked patients for current GP ───────────────────

create function public.get_linked_patients()
returns table (
  patient_id  uuid,
  full_name   text,
  linked_at   timestamptz,
  access_id   uuid
)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  select
    p.id          as patient_id,
    pr.full_name,
    ga.created_at as linked_at,
    ga.id         as access_id
  from public.gp_access    ga
  join public.patients     p  on p.id  = ga.patient_id
  join public.profiles     pr on pr.id = p.user_id
  join public.gp_profiles  gp on gp.id = ga.gp_id
  where gp.user_id       = auth.uid()
    and ga.access_status = 'active'
    and ga.expires_at    > now()
  order by ga.created_at desc;
end;
$$;

-- ── Row Level Security ────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.patients        enable row level security;
alter table public.gp_profiles     enable row level security;
alter table public.migraine_events enable row level security;
alter table public.medication_logs enable row level security;
alter table public.gp_access       enable row level security;

-- profiles: own row only
-- (GPs read linked patient names through the get_linked_patients RPC)
create policy "own profile" on public.profiles
  for all
  using     (auth.uid() = id)
  with check (auth.uid() = id);

-- patients: own row; GP reads via helper (no recursion)
create policy "patient owns row" on public.patients
  for all
  using     (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "gp views linked patient" on public.patients
  for select
  using (public.gp_can_view_patient(id));

-- gp_profiles: own row
create policy "gp owns row" on public.gp_profiles
  for all
  using     (user_id = auth.uid())
  with check (user_id = auth.uid());

-- migraine_events: patient owns; GP reads via helper
create policy "patient owns events" on public.migraine_events
  for all
  using     (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());

create policy "gp views linked events" on public.migraine_events
  for select
  using (public.gp_can_view_patient(patient_id));

-- medication_logs: patient owns; GP reads via helper
create policy "patient owns logs" on public.medication_logs
  for all
  using     (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());

create policy "gp views linked logs" on public.medication_logs
  for select
  using (public.gp_can_view_patient(patient_id));

-- gp_access: patient controls their own codes; GP sees own links
-- (helpers are SECURITY DEFINER, so no recursion into patients/gp_profiles)
create policy "patient manages codes" on public.gp_access
  for all
  using     (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());

create policy "gp sees own links" on public.gp_access
  for select
  using (gp_id = public.current_gp_id());
