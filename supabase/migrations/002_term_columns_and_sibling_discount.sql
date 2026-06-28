-- Add term and sibling-discount columns to bookings.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS term_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS term_year int;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS sibling_discount_pct int;

CREATE INDEX IF NOT EXISTS idx_bookings_parent_term
  ON public.bookings (parent_id, term_name, term_year);
