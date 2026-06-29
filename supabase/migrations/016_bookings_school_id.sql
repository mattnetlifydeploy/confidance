-- 016: link bookings to a school (venue).
-- Nullable FK + backfill to Grove. Kept nullable so the live insert path keeps
-- working until the booking flow passes school_id; the booking API defaults to
-- the parent's selected school (Grove fallback) going forward.

alter table public.bookings
  add column if not exists school_id uuid references public.schools (id);

-- Backfill every existing booking to the seeded Grove venue.
update public.bookings
set school_id = (
  select id from public.schools where slug = 'grove-neighbourhood-centre' limit 1
)
where school_id is null;

create index if not exists idx_bookings_school_id on public.bookings (school_id);
