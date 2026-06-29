-- Item #16: Add deleted_at column for soft deletes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
