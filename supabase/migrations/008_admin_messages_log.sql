create table admin_messages_log (
  id uuid primary key default gen_random_uuid(),
  sent_at timestamptz not null default now(),
  sent_by uuid references profiles(id),
  channel text not null check (channel in ('email', 'banner')),
  audience jsonb,
  subject text,
  body text,
  recipient_count int,
  resend_id text,
  delivery_status jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_messages_log_resend_id_idx on admin_messages_log(resend_id);
create index admin_messages_log_sent_at_idx on admin_messages_log(sent_at);
