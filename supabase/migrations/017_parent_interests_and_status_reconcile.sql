-- 017: parent interest inbox + enquiry status vocabulary reconcile
-- Parents register interest pre-launch (before we have a partner school near
-- them). Pure lead capture: no parent billing, no logins, no child PII beyond
-- an optional school year. Mirrors the school_enquiries lead inbox.

create extension if not exists "pgcrypto";

-- ─── parent_interests (Parents "register interest" inbox) ───
create table if not exists public.parent_interests (
  id               uuid primary key default gen_random_uuid(),
  parent_name      text not null,
  parent_email     text not null,
  parent_phone     text,
  child_year_group text,            -- optional, free text (no rigid age bands)
  preferred_school text,            -- "the school you'd love us at" (demand signal)
  postcode         text,            -- coarse area demand mapping
  message          text,
  status           text not null default 'new',
  admin_notes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on column public.parent_interests.status is 'new|contacted|interested|signed|lost';

create index if not exists idx_parent_interests_status  on public.parent_interests (status);
create index if not exists idx_parent_interests_created on public.parent_interests (created_at desc);

-- ─── RLS ───
-- No public read/insert policy. All writes go through the server API route using
-- the service-role key, which bypasses RLS. Matches school_enquiries.
alter table public.parent_interests enable row level security;

-- ─── Reconcile school_enquiries status vocabulary ───
-- Align the closed-lost state with parent_interests: 'rejected' -> 'lost'.
-- status is a plain text column (no DB enum constraint), so a data update +
-- column comment is the full reconcile; app-level enums updated in code.
update public.school_enquiries set status = 'lost' where status = 'rejected';
comment on column public.school_enquiries.status is 'new|contacted|interested|signed|lost';
