create table waitlists (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles(id),
  child_id uuid not null references children(id),
  class_type text not null,
  term_name text,
  term_year int,
  session_date date,
  position int not null,
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  expires_at timestamptz
);

create index on waitlists (class_type, term_name, term_year, session_date, position);
