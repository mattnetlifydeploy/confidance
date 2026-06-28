-- Epic 2: Multi-page admin shell
-- Adds attendance (per-class roster check-in) and walk_ins (door capture for kids not in the system).

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  class_type text NOT NULL,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  checked_in_by uuid REFERENCES public.profiles(id),
  CONSTRAINT attendance_unique_per_session UNIQUE (child_id, session_date, class_type)
);

CREATE INDEX IF NOT EXISTS idx_attendance_session
  ON public.attendance (class_type, session_date);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.walk_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  parent_phone text,
  parent_email text,
  child_name text NOT NULL,
  child_age int,
  class_type text NOT NULL,
  session_date date NOT NULL,
  amount_paid_pence int,
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_walk_ins_session
  ON public.walk_ins (class_type, session_date);

ALTER TABLE public.walk_ins ENABLE ROW LEVEL SECURITY;
