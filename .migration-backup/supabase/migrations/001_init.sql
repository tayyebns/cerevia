-- Create profiles table
create table profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique,
  role text check (role in ('patient', 'gp', 'carer')) not null,
  created_at timestamptz default now()
);

-- Create patients table
create table patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles(id) on delete cascade,
  date_of_birth date,
  primary_language text default 'en',
  diagnosis text default 'Chronic migraine',
  created_at timestamptz default now()
);

-- Create gp_profiles table
create table gp_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles(id) on delete cascade,
  practice_name text,
  role_title text default 'GP',
  created_at timestamptz default now()
);

-- Create medications table
create table medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  name text not null,
  dosage text,
  usage_type text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Create migraine_events table
create table migraine_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  event_type text not null,
  started_at timestamptz,
  ended_at timestamptz,
  severity int check (severity between 1 and 10),
  duration_minutes int,
  primary_pain_region text,
  title text not null,
  description text,
  impact_score int check (impact_score between 1 and 10),
  source text default 'patient_app',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Create gp_access table
create table gp_access (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  gp_id uuid references gp_profiles(id) on delete cascade,
  access_status text check (access_status in ('active', 'revoked', 'expired')) default 'active',
  access_code text,
  starts_at timestamptz default now(),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Create indexes for common queries
create index idx_profiles_email on profiles(email);
create index idx_patients_profile_id on patients(profile_id);
create index idx_gp_profiles_profile_id on gp_profiles(profile_id);
create index idx_medications_patient_id on medications(patient_id);
create index idx_migraine_events_patient_id on migraine_events(patient_id);
create index idx_gp_access_patient_id on gp_access(patient_id);
create index idx_gp_access_gp_id on gp_access(gp_id);

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table patients enable row level security;
alter table gp_profiles enable row level security;
alter table medications enable row level security;
alter table migraine_events enable row level security;
alter table gp_access enable row level security;

-- RLS Policies: profiles table
-- Users can only read/update their own profile
create policy "users_can_read_own_profile" on profiles
  for select using (auth.uid() = id);

create policy "users_can_update_own_profile" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS Policies: patients table
-- Patients can read their own record, GPs with access can read patient records
create policy "patients_can_read_own_record" on patients
  for select using (
    profile_id = auth.uid() or
    exists (
      select 1 from gp_access
      where gp_access.patient_id = patients.id
      and gp_access.gp_id in (
        select id from gp_profiles where profile_id = auth.uid()
      )
      and gp_access.access_status = 'active'
    )
  );

create policy "patients_can_insert_own_record" on patients
  for insert with check (profile_id = auth.uid());

create policy "patients_can_update_own_record" on patients
  for update using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- RLS Policies: gp_profiles table
-- GPs can only read/update their own profile
create policy "gps_can_read_own_profile" on gp_profiles
  for select using (profile_id = auth.uid());

create policy "gps_can_update_own_profile" on gp_profiles
  for update using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "gps_can_insert_own_profile" on gp_profiles
  for insert with check (profile_id = auth.uid());

-- RLS Policies: medications table
-- Users can only read/write medications for their own patient record
create policy "users_can_read_own_medications" on medications
  for select using (
    patient_id in (
      select id from patients where profile_id = auth.uid()
    ) or
    patient_id in (
      select patients.id from patients
      join gp_access on gp_access.patient_id = patients.id
      where gp_access.gp_id in (
        select id from gp_profiles where profile_id = auth.uid()
      )
      and gp_access.access_status = 'active'
    )
  );

create policy "users_can_insert_own_medications" on medications
  for insert with check (
    patient_id in (select id from patients where profile_id = auth.uid())
  );

create policy "users_can_update_own_medications" on medications
  for update using (
    patient_id in (select id from patients where profile_id = auth.uid())
  )
  with check (
    patient_id in (select id from patients where profile_id = auth.uid())
  );

-- RLS Policies: migraine_events table
-- Users can only read/write events for their own patient record
create policy "users_can_read_own_migraine_events" on migraine_events
  for select using (
    patient_id in (
      select id from patients where profile_id = auth.uid()
    ) or
    patient_id in (
      select patients.id from patients
      join gp_access on gp_access.patient_id = patients.id
      where gp_access.gp_id in (
        select id from gp_profiles where profile_id = auth.uid()
      )
      and gp_access.access_status = 'active'
    )
  );

create policy "users_can_insert_own_migraine_events" on migraine_events
  for insert with check (
    patient_id in (select id from patients where profile_id = auth.uid())
  );

create policy "users_can_update_own_migraine_events" on migraine_events
  for update using (
    patient_id in (select id from patients where profile_id = auth.uid())
  )
  with check (
    patient_id in (select id from patients where profile_id = auth.uid())
  );

-- RLS Policies: gp_access table
-- Patients can read access records they own, GPs can read records granting them access
create policy "patients_can_read_own_gp_access" on gp_access
  for select using (
    patient_id in (select id from patients where profile_id = auth.uid()) or
    gp_id in (select id from gp_profiles where profile_id = auth.uid())
  );

create policy "patients_can_insert_own_gp_access" on gp_access
  for insert with check (
    patient_id in (select id from patients where profile_id = auth.uid())
  );

-- Function to automatically create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.user_metadata->>'full_name', 'User'),
    coalesce(new.user_metadata->>'role', 'patient')
  );

  -- Auto-create patient or gp_profiles based on role
  if new.user_metadata->>'role' = 'patient' then
    insert into public.patients (profile_id, primary_language, diagnosis)
    values (new.id, 'en', 'Chronic migraine');
  elsif new.user_metadata->>'role' = 'gp' then
    insert into public.gp_profiles (profile_id, role_title)
    values (new.id, 'GP');
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger to call the function on new auth user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
