-- Epic 3: Admin Comms
-- In-portal banner published to parent dashboard. Audience strings:
--   'all'                              every parent
--   'class:baby-boogie'                parents with confirmed bookings in that class
--   'class:confidance-kids'
--   'term:<term_name>-<term_year>'     parents booked on a specific term

CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body text NOT NULL,
  audience text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_active
  ON public.banners (published_at, expires_at);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
