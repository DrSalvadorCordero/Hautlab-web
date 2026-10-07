create table public.hautlab_plans (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique check (public_code ~ '^HLP-[A-Z0-9]{8}$'),
  access_token_hash text not null unique check (access_token_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'draft' check (status in ('draft','shared','engaged','scheduled','completed','archived')),
  language text not null default 'es' check (language in ('es','en')),
  goals jsonb not null default '[]'::jsonb,
  priorities jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  estimated_range_min integer check (estimated_range_min is null or estimated_range_min >= 0),
  estimated_range_max integer check (estimated_range_max is null or estimated_range_max >= 0),
  currency text not null default 'MXN' check (currency = 'MXN'),
  attribution_code text references public.growth_attribution_touchpoints(code) on delete set null,
  conversation_id uuid references public.wa_conversations(id) on delete set null,
  source_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_opened_at timestamptz
);

comment on table public.hautlab_plans is
  'Server-only non-clinical HAUTLAB planning state. No patient name, phone, email, DOB, photos, diagnoses, or clinical notes.';

create index hautlab_plans_created_at_idx on public.hautlab_plans(created_at desc);
create index hautlab_plans_attribution_code_idx on public.hautlab_plans(attribution_code);
create index hautlab_plans_conversation_id_idx on public.hautlab_plans(conversation_id);

alter table public.hautlab_plans enable row level security;
revoke all on table public.hautlab_plans from public, anon, authenticated;
grant select, insert, update, delete on table public.hautlab_plans to service_role;

alter table public.wa_conversations
  add column if not exists hautlab_plan_id uuid references public.hautlab_plans(id) on delete set null;

create index if not exists wa_conversations_hautlab_plan_id_idx
  on public.wa_conversations(hautlab_plan_id);

create trigger hautlab_plans_set_updated_at
before update on public.hautlab_plans
for each row execute function private.hautlab_set_updated_at();
