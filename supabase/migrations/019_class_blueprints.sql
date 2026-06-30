-- 019: class blueprints (reusable templates) + per-venue class scoping
-- Created: 2026-06-30
-- Adds a reusable "class blueprint" library (admin-internal templates). Stamping a
-- blueprint onto a venue COPIES its fields into a fresh, fully-editable class row
-- (SNAPSHOT model: later blueprint edits do NOT cascade to existing classes).
-- classes.blueprint_id is informational provenance only. Class slug-uniqueness is
-- scoped per venue so the same blueprint can be stamped onto multiple venues.

create extension if not exists "pgcrypto";

-- ─── class_blueprints (admin-internal templates) ───
-- slug is the stable key (matches a ClassType for the seeded library).
-- default_* are the values copied onto a new class when the blueprint is stamped.
create table if not exists public.class_blueprints (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  name                  text not null,
  ages                  text not null,
  age_max               integer not null,
  default_day           text,
  default_time          text,
  default_duration_mins integer not null default 30,
  sort_order            integer not null default 0,
  active                boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_class_blueprints_active on public.class_blueprints (active);
create index if not exists idx_class_blueprints_sort   on public.class_blueprints (sort_order);

-- Seed a starting library from constants.ts CLASSES (byte-identical to migration 018 seed).
insert into public.class_blueprints (slug, name, ages, age_max, default_day, default_time, default_duration_mins, sort_order, active)
values
  ('baby-boogie',     'Baby Boogie',     '2 to 4', 4, 'Thursday', '3:45pm to 4:15pm', 30, 0, true),
  ('confidance-kids', 'Confidance Kids', '3 to 6', 6, 'Thursday', '4:20pm to 4:50pm', 30, 1, true)
on conflict (slug) do nothing;

-- ─── RLS: admin-internal only ───
-- No policies => only the service-role key (admin API) can read/write.
-- Blueprints are internal templates, never exposed to the public booking layer.
alter table public.class_blueprints enable row level security;

-- ─── classes.blueprint_id (informational provenance) ───
alter table public.classes
  add column if not exists blueprint_id uuid references public.class_blueprints(id) on delete set null;

create index if not exists idx_classes_blueprint on public.classes (blueprint_id);

-- ─── Per-venue slug uniqueness ───
-- Was: global UNIQUE(slug). A blueprint can now be stamped onto many venues, so the
-- same slug may recur across venues but must stay unique within a single venue.
alter table public.classes drop constraint if exists classes_slug_key;
alter table public.classes
  add constraint classes_venue_slug_key unique (venue_school_id, slug);

-- ─── Restore the 2 Grove classes from the blueprint library (idempotent) ───
-- The live classes table is empty; restore the day-one Grove classes so the admin
-- venue view and the public site agree. Snapshot copy with blueprint_id provenance.
-- Byte-identical to constants / migration 018.
insert into public.classes (slug, name, ages, age_max, day, time, duration_mins, sort_order, active, venue_school_id, blueprint_id)
select bp.slug, bp.name, bp.ages, bp.age_max, bp.default_day, bp.default_time, bp.default_duration_mins, bp.sort_order, true, s.id, bp.id
from public.class_blueprints bp
cross join (select id from public.schools where slug = 'grove-neighbourhood-centre') s
where bp.slug in ('baby-boogie', 'confidance-kids')
on conflict (venue_school_id, slug) do nothing;

-- ROLLBACK:
-- alter table public.classes drop constraint if exists classes_venue_slug_key;
-- alter table public.classes add constraint classes_slug_key unique (slug);
-- drop index if exists idx_classes_blueprint;
-- alter table public.classes drop column if exists blueprint_id;
-- drop table if exists public.class_blueprints;
