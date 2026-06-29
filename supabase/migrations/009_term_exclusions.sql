-- Item #8: Admin-managed holiday/exclusion dates
-- Allows admins to exclude specific dates from term schedules (e.g. school holidays, venue unavailability)
-- exclusion_date is a date column, reason is optional text describing why the class is excluded

CREATE TABLE IF NOT EXISTS public.term_exclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_name text NOT NULL,
  term_year integer NOT NULL,
  exclusion_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_term_exclusions_term
  ON public.term_exclusions (term_name, term_year, exclusion_date);

CREATE INDEX IF NOT EXISTS idx_term_exclusions_created
  ON public.term_exclusions (created_at DESC);

ALTER TABLE public.term_exclusions ENABLE ROW LEVEL SECURITY;
