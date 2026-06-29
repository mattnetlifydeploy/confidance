-- Item #11: Per-family admin notes
-- Allows admins to add/edit notes on family profiles for internal reference

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_notes text;
