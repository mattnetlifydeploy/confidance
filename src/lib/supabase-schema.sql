-- Confidance Booking System — Supabase Schema
-- Run this in Supabase SQL Editor when ready to go live

create table if not exists public.locations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  address text,
  created_at timestamptz default now()
);

create table if not exists public.class_sessions (
  id uuid default gen_random_uuid() primary key,
  location_id uuid references public.locations(id) on delete cascade,
  class_type text not null check (class_type in ('baby-boogie', 'confidance')),
  day_of_week text not null,
  start_time time not null,
  end_time time not null,
  max_capacity int not null default 12,
  term_start date,
  term_end date,
  term_price decimal(10,2),
  trial_price decimal(10,2),
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.class_sessions(id) on delete cascade,
  booking_type text not null check (booking_type in ('term', 'trial')),
  parent_name text not null,
  parent_email text not null,
  parent_phone text not null,
  emergency_contact text not null,
  emergency_phone text not null,
  child_name text not null,
  child_age int not null check (child_age between 2 and 6),
  medical_info text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  stripe_payment_id text,
  created_at timestamptz default now()
);

-- Seed locations
insert into public.locations (name, slug, address) values
  ('Sunshine Community Hall', 'sunshine-hall', 'Address to be confirmed'),
  ('Oakwood Village Hall', 'oakwood-hall', 'Address to be confirmed');

-- RLS policies
alter table public.bookings enable row level security;
alter table public.locations enable row level security;
alter table public.class_sessions enable row level security;

-- Public read for locations and sessions
create policy "Locations are publicly readable"
  on public.locations for select using (true);

create policy "Sessions are publicly readable"
  on public.class_sessions for select using (true);

-- Bookings: insert only (no read for anon, admin reads via service key)
create policy "Anyone can create a booking"
  on public.bookings for insert with check (true);
