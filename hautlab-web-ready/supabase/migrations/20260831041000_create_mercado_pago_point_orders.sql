create table if not exists public.mp_point_provider_config (
  provider text primary key default 'mercado_pago_point'
    check (provider = 'mercado_pago_point'),
  application_id text not null unique,
  active_mode text not null default 'test'
    check (active_mode in ('test', 'production')),
  enabled boolean not null default false,
  terminal_id text,
  store_id text,
  pos_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.mp_point_provider_config (
  provider,
  application_id,
  active_mode,
  enabled
)
values (
  'mercado_pago_point',
  '8283735828387207',
  'test',
  false
)
on conflict (provider) do update
set application_id = excluded.application_id,
    updated_at = now();

create table if not exists public.mp_point_orders (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercado_pago_point'
    check (provider = 'mercado_pago_point'),
  external_reference text not null unique
    check (
      char_length(external_reference) between 1 and 64
      and external_reference ~ '^[A-Za-z0-9_-]+$'
    ),
  mp_order_id text unique,
  terminal_id text not null,
  description text not null
    check (char_length(description) between 1 and 150),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'MXN' check (currency = 'MXN'),
  status text not null default 'created' check (
    status in (
      'created',
      'at_terminal',
      'processed',
      'action_required',
      'failed',
      'canceled',
      'refunded',
      'expired'
    )
  ),
  status_detail text,
  transaction_id text,
  payment_reference_id text,
  payment_method_type text,
  payment_method_id text,
  installments integer check (installments is null or installments > 0),
  live_mode boolean,
  test_mode boolean not null,
  last_webhook_event_id uuid,
  last_webhook_at timestamptz,
  paid_at timestamptz,
  refunded_at timestamptz,
  provider_created_at timestamptz,
  provider_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mp_point_orders_created_at_idx
  on public.mp_point_orders (created_at desc);

create index if not exists mp_point_orders_status_created_at_idx
  on public.mp_point_orders (status, created_at desc);

create index if not exists mp_point_orders_terminal_created_at_idx
  on public.mp_point_orders (terminal_id, created_at desc);

create table if not exists public.mp_point_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercado_pago_point'
    check (provider = 'mercado_pago_point'),
  deduplication_key text not null unique,
  provider_event_id text,
  request_id text,
  action text,
  resource_id text not null,
  live_mode boolean,
  signature_valid boolean not null default false,
  processing_status text not null default 'received' check (
    processing_status in ('received', 'processed', 'ignored', 'failed')
  ),
  error_code text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists mp_point_webhook_events_received_at_idx
  on public.mp_point_webhook_events (received_at desc);

alter table public.mp_point_provider_config enable row level security;
alter table public.mp_point_orders enable row level security;
alter table public.mp_point_webhook_events enable row level security;

revoke all on table public.mp_point_provider_config from anon, authenticated;
revoke all on table public.mp_point_orders from anon, authenticated;
revoke all on table public.mp_point_webhook_events from anon, authenticated;

grant select, insert, update, delete on table public.mp_point_provider_config to service_role;
grant select, insert, update, delete on table public.mp_point_orders to service_role;
grant select, insert, update, delete on table public.mp_point_webhook_events to service_role;

drop trigger if exists mp_point_provider_config_set_updated_at on public.mp_point_provider_config;
create trigger mp_point_provider_config_set_updated_at
before update on public.mp_point_provider_config
for each row execute function private.hautlab_set_updated_at();

drop trigger if exists mp_point_orders_set_updated_at on public.mp_point_orders;
create trigger mp_point_orders_set_updated_at
before update on public.mp_point_orders
for each row execute function private.hautlab_set_updated_at();

create or replace function public.hautlab_point_secret(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  if p_name not in (
    'mp_point_access_token_test',
    'mp_point_access_token_production',
    'mp_point_webhook_secret_test',
    'mp_point_webhook_secret_production'
  ) then
    raise exception 'point_secret_not_allowed' using errcode = 'P0001';
  end if;

  select decrypted_secret
    into v_secret
    from vault.decrypted_secrets
   where name = 'hautlab_' || p_name
   limit 1;

  if v_secret is null or btrim(v_secret) = '' then
    raise exception 'point_secret_not_configured' using errcode = 'P0001';
  end if;

  return v_secret;
end;
$$;

revoke all on function public.hautlab_point_secret(text) from public, anon, authenticated;
grant execute on function public.hautlab_point_secret(text) to service_role;
