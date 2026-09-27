-- HAUTLAB Telegram Command Center v1
-- Server-only operator channel. No patient-facing Telegram workflow is created here.

create table if not exists public.telegram_operator_links (
  operator_key text primary key
    references public.wa_operators(operator_key) on delete restrict,
  telegram_user_id bigint not null unique,
  telegram_chat_id bigint not null,
  telegram_username text,
  telegram_display_name text,
  active boolean not null default true,
  paired_at timestamptz not null default now(),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.telegram_jobs (
  id uuid primary key default gen_random_uuid(),
  operator_key text not null
    references public.wa_operators(operator_key) on delete restrict,
  chat_id bigint not null,
  kind text not null default 'message'
    check (kind in ('message', 'daily_digest')),
  message text,
  next_run_at timestamptz not null,
  repeat_minutes integer
    check (repeat_minutes is null or (repeat_minutes >= 5 and repeat_minutes <= 525600)),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'processing', 'sent', 'cancelled', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  last_sent_at timestamptz,
  created_by text not null default 'telegram',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (kind = 'daily_digest')
    or (kind = 'message' and message is not null and length(btrim(message)) between 1 and 4096)
  )
);

create index if not exists telegram_jobs_due_idx
  on public.telegram_jobs (status, next_run_at)
  where status = 'scheduled';

create index if not exists telegram_jobs_operator_idx
  on public.telegram_jobs (operator_key, created_at desc);

create table if not exists public.telegram_audit_events (
  id uuid primary key default gen_random_uuid(),
  update_id bigint unique,
  telegram_message_id bigint,
  telegram_user_id bigint,
  telegram_chat_id bigint,
  operator_key text
    references public.wa_operators(operator_key) on delete set null,
  action text not null,
  status text not null default 'received'
    check (status in ('received', 'processed', 'rejected', 'failed', 'duplicate')),
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists telegram_audit_operator_created_idx
  on public.telegram_audit_events (operator_key, created_at desc);

alter table public.telegram_operator_links enable row level security;
alter table public.telegram_jobs enable row level security;
alter table public.telegram_audit_events enable row level security;

revoke all on table public.telegram_operator_links from anon, authenticated;
revoke all on table public.telegram_jobs from anon, authenticated;
revoke all on table public.telegram_audit_events from anon, authenticated;

grant select, insert, update, delete on table public.telegram_operator_links to service_role;
grant select, insert, update, delete on table public.telegram_jobs to service_role;
grant select, insert, update, delete on table public.telegram_audit_events to service_role;

comment on table public.telegram_operator_links is
  'Private Telegram-to-HAUTLAB operator bindings. Server-only; no public RLS policies.';
comment on table public.telegram_jobs is
  'Scheduled Telegram operator messages and recurring command-center digests.';
comment on table public.telegram_audit_events is
  'Audit trail for Telegram webhook and MCP operator actions.';
