-- 018: classes as DB-backed reference data (+ optional venue link)
-- Created: 2026-06-30
-- Migration 015 deliberately kept classes hardcoded in constants.ts. This moves
-- them into the DB so Jessica can edit names / ages / times and add classes
-- without a deploy. constants.ts CLASSES stays as the seed source AND the
-- runtime fallback (see src/lib/classes.ts) so behaviour is identical day one.

create extension if not exists "pgcrypto";

-- ─── classes ───
-- slug is the stable key matching ClassType in constants.ts (never recycled).
-- ages / time are human display labels (e.g. '2 to 4', '3:45pm to 4:15pm').
create table if not exists public.classes (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  ages            text not null,
  age_max         integer not null,
  day             text not null,
  time            text not null,
  duration_mins   integer not null default 30,
  venue_school_id uuid references public.schools(id) on delete set null,
  sort_order      integer not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_classes_active on public.classes (active);
create index if not exists idx_classes_slug   on public.classes (slug);
create index if not exists idx_classes_sort   on public.classes (sort_order);

-- ─── Seed from constants.ts CLASSES (identical day one) ───
-- Default venue = the seeded Grove Neighbourhood Centre school (migration 015).
insert into public.classes (slug, name, ages, age_max, day, time, duration_mins, sort_order, active, venue_school_id)
values
  ('baby-boogie',     'Baby Boogie',     '2 to 4', 4, 'Thursday', '3:45pm to 4:15pm', 30, 0, true,
     (select id from public.schools where slug = 'grove-neighbourhood-centre')),
  ('confidance-kids', 'Confidance Kids', '3 to 6', 6, 'Thursday', '4:20pm to 4:50pm', 30, 1, true,
     (select id from public.schools where slug = 'grove-neighbourhood-centre'))
on conflict (slug) do nothing;

-- ─── RLS (mirror schools) ───
-- Public may read ACTIVE classes only (for the booking / display API).
-- All writes go through the admin API using the service-role key (bypasses RLS).
alter table public.classes enable row level security;

drop policy if exists "public read active classes" on public.classes;
create policy "public read active classes" on public.classes
  for select using (active = true);

-- ROLLBACK:
-- drop policy if exists "public read active classes" on public.classes;
-- drop table if exists public.classes;
