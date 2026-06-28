-- Epic 7: Track booking revenue in pence
-- Adds amount_paid_pence to bookings so /admin/reports can sum revenue without
-- round-tripping Stripe. NOT NULL DEFAULT 0 so existing rows backfill to zero.
-- Stripe historical backfill is a separate manual task post-merge.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS amount_paid_pence integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bookings_term_classtype_status
  ON public.bookings (term_name, term_year, class_type, status);
