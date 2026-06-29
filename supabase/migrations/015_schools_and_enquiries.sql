-- 015: schools-as-venues + school enquiries
-- Schools are pure VENUE records. Jessica lends their space to run clubs.
-- No school billing, no school admin logins, no franchise/white-label.
-- Classes stay hardcoded + uniform across every school (same curriculum).

create extension if not exists "pgcrypto";

-- ─── schools (venues) ───
create table if not exists public.schools (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  address       text,
  postcode      text,
  area          text,
  contact_name  text,
  contact_email text,
  contact_phone text,
  school_type   text,
  active        boolean not null default false,
  notes         text,
  logo_url      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_schools_active on public.schools (active);
create index if not exists idx_schools_slug   on public.schools (slug);

-- ─── school_enquiries (For Schools lead inbox) ───
create table if not exists public.school_enquiries (
  id                 uuid primary key default gen_random_uuid(),
  school_name        text not null,
  school_type        text,
  contact_name       text not null,
  contact_email      text not null,
  contact_phone      text,
  estimated_students integer,
  preferred_days_times text,
  notes              text,
  status             text not null default 'new',  -- new|contacted|interested|signed|rejected
  admin_notes        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_school_enquiries_status  on public.school_enquiries (status);
create index if not exists idx_school_enquiries_created on public.school_enquiries (created_at desc);

-- ─── Seed the existing live venue as the first ACTIVE school ───
insert into public.schools (name, slug, address, postcode, area, active, school_type)
values (
  'Grove Neighbourhood Centre',
  'grove-neighbourhood-centre',
  '7 Bradmore Park Road, Hammersmith',
  'W6 0DT',
  'Hammersmith',
  true,
  'community-centre'
)
on conflict (slug) do nothing;

-- ─── RLS ───
alter table public.schools          enable row level security;
alter table public.school_enquiries enable row level security;

-- Public may read ACTIVE schools only (for /schools + booking venue picker).
drop policy if exists "public read active schools" on public.schools;
create policy "public read active schools" on public.schools
  for select using (active = true);

-- Enquiries: no public read/insert policy. All writes go through the server
-- API route using the service-role key, which bypasses RLS.
