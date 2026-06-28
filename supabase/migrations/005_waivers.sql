-- Epic 5: Waivers
-- Active waiver = latest waiver row where published_at <= now().
-- waiver_signatures records each parent's typed-name acknowledgement of a specific waiver.

CREATE TABLE IF NOT EXISTS public.waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body_md text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waivers_published_at
  ON public.waivers (published_at DESC);

ALTER TABLE public.waivers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.waiver_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  waiver_id uuid NOT NULL REFERENCES public.waivers(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.children(id) ON DELETE SET NULL,
  signature_text text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waiver_signatures_lookup
  ON public.waiver_signatures (waiver_id, parent_id);

ALTER TABLE public.waiver_signatures ENABLE ROW LEVEL SECURITY;
