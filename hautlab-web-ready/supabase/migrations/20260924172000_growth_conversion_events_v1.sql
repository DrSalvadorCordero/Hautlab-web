create table if not exists public.growth_conversion_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in ('appointment_confirmed')),
  conversation_id uuid not null references public.wa_conversations(id) on delete cascade,
  occurred_at timestamptz not null,
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  gclid text,
  fbclid text,
  msclkid text,
  appointment_source text,
  nimbo_schedule_id bigint,
  export_status text not null default 'pending'
    check (export_status in ('pending','exported','failed','not_applicable')),
  exported_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_name, conversation_id)
);

create index if not exists growth_conversion_events_occurred_at_idx
  on public.growth_conversion_events(occurred_at desc);

create index if not exists growth_conversion_events_export_status_idx
  on public.growth_conversion_events(export_status, occurred_at desc);

create index if not exists growth_conversion_events_gclid_idx
  on public.growth_conversion_events(gclid)
  where gclid is not null;

alter table public.growth_conversion_events enable row level security;

revoke all on table public.growth_conversion_events from anon, authenticated;
grant select, insert, update on table public.growth_conversion_events to service_role;

comment on table public.growth_conversion_events is
  'Non-clinical, server-only conversion events for paid-media attribution. Stores campaign/click identifiers but no patient name, phone, DOB, email, or clinical reason.';
