create table if not exists public.growth_attribution_touchpoints (
  code text primary key,
  created_at timestamptz not null default now(),
  landing_url text not null,
  current_url text not null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  fbclid text,
  msclkid text,
  language text not null default 'es' check (language in ('es', 'en')),
  matched_conversation_id uuid references public.wa_conversations(id) on delete set null,
  matched_at timestamptz,
  constraint growth_attribution_code_format check (code ~ '^HL-[A-Z0-9]{12}$')
);

create index if not exists growth_attribution_touchpoints_created_at_idx
  on public.growth_attribution_touchpoints(created_at desc);

create index if not exists growth_attribution_touchpoints_conversation_idx
  on public.growth_attribution_touchpoints(matched_conversation_id, matched_at desc);

alter table public.growth_attribution_touchpoints enable row level security;

revoke all on table public.growth_attribution_touchpoints from anon, authenticated;
grant select, insert, update on table public.growth_attribution_touchpoints to service_role;

alter table public.wa_conversations
  add column if not exists first_attribution jsonb,
  add column if not exists last_attribution jsonb,
  add column if not exists first_attributed_at timestamptz,
  add column if not exists last_attributed_at timestamptz;

comment on table public.growth_attribution_touchpoints is
  'Consent-gated first-party acquisition touchpoints used to connect website WhatsApp clicks to HAUTLAB conversations.';

comment on column public.wa_conversations.first_attribution is
  'First matched website acquisition snapshot for this WhatsApp conversation.';

comment on column public.wa_conversations.last_attribution is
  'Most recent matched website acquisition snapshot for this WhatsApp conversation.';
