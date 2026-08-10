create table if not exists public.payment_provider_config (
  provider text primary key,
  application_id text not null unique,
  active_mode text not null default 'test' check (active_mode in ('test', 'production')),
  production_owner_id bigint,
  test_owner_id bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.payment_provider_config (provider, application_id, active_mode)
values ('mercado_pago', '5395737521382943', 'test')
on conflict (provider) do update
set application_id = excluded.application_id,
    updated_at = now();

create table if not exists public.payment_orders (
  id uuid primary key,
  provider text not null default 'mercado_pago' check (provider = 'mercado_pago'),
  product_code text not null check (product_code = 'medical_assessment'),
  product_label text not null check (char_length(product_label) between 3 and 120),
  amount numeric(12, 2) not null check (amount = 1300.00),
  currency text not null default 'MXN' check (currency = 'MXN'),
  payer_email text not null check (char_length(payer_email) between 5 and 254),
  payer_first_name text not null check (char_length(payer_first_name) between 1 and 80),
  payer_last_name text not null check (char_length(payer_last_name) between 1 and 120),
  request_fingerprint text not null check (char_length(request_fingerprint) = 64),
  external_reference text not null unique,
  preference_id text unique,
  mp_payment_id text unique,
  status text not null default 'created' check (
    status in (
      'created',
      'preference_created',
      'pending',
      'approved',
      'authorized',
      'in_process',
      'in_mediation',
      'rejected',
      'cancelled',
      'refunded',
      'charged_back',
      'expired',
      'error'
    )
  ),
  status_detail text,
  live_mode boolean,
  test_mode boolean not null,
  payment_method_id text,
  payment_type_id text,
  issuer_id text,
  last_webhook_event_id text,
  last_webhook_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_orders_external_reference_matches_id
    check (external_reference = id::text)
);

create index if not exists payment_orders_created_at_idx
  on public.payment_orders (created_at desc);

create index if not exists payment_orders_status_created_at_idx
  on public.payment_orders (status, created_at desc);

create index if not exists payment_orders_fingerprint_created_at_idx
  on public.payment_orders (request_fingerprint, created_at desc);

create index if not exists payment_orders_email_created_at_idx
  on public.payment_orders (lower(payer_email), created_at desc);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercado_pago' check (provider = 'mercado_pago'),
  deduplication_key text not null unique,
  provider_event_id text,
  request_id text,
  topic text not null,
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

create index if not exists payment_webhook_events_received_at_idx
  on public.payment_webhook_events (received_at desc);

alter table public.payment_provider_config enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payment_webhook_events enable row level security;

revoke all on table public.payment_provider_config from anon, authenticated;
revoke all on table public.payment_orders from anon, authenticated;
revoke all on table public.payment_webhook_events from anon, authenticated;

grant select, insert, update, delete on table public.payment_provider_config to service_role;
grant select, insert, update, delete on table public.payment_orders to service_role;
grant select, insert, update, delete on table public.payment_webhook_events to service_role;

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.hautlab_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payment_provider_config_set_updated_at on public.payment_provider_config;
create trigger payment_provider_config_set_updated_at
before update on public.payment_provider_config
for each row execute function private.hautlab_set_updated_at();

drop trigger if exists payment_orders_set_updated_at on public.payment_orders;
create trigger payment_orders_set_updated_at
before update on public.payment_orders
for each row execute function private.hautlab_set_updated_at();

create or replace function public.hautlab_payment_secret(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  if p_name not in (
    'mp_access_token_test',
    'mp_access_token_production',
    'mp_webhook_secret_test',
    'mp_webhook_secret_production',
    'payment_rate_limit_secret'
  ) then
    raise exception 'payment_secret_not_allowed' using errcode = 'P0001';
  end if;

  select decrypted_secret
    into v_secret
    from vault.decrypted_secrets
   where name = 'hautlab_' || p_name
   limit 1;

  if v_secret is null or btrim(v_secret) = '' then
    raise exception 'payment_secret_not_configured' using errcode = 'P0001';
  end if;

  return v_secret;
end;
$$;

revoke all on function public.hautlab_payment_secret(text) from public, anon, authenticated;
grant execute on function public.hautlab_payment_secret(text) to service_role;

create or replace function public.hautlab_payment_create_order(
  p_id uuid,
  p_product_code text,
  p_product_label text,
  p_amount numeric,
  p_currency text,
  p_payer_email text,
  p_payer_first_name text,
  p_payer_last_name text,
  p_request_fingerprint text,
  p_test_mode boolean
)
returns setof public.payment_orders
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_product_code <> 'medical_assessment'
     or p_amount <> 1300.00
     or p_currency <> 'MXN' then
    raise exception 'payment_product_not_allowed' using errcode = 'P0001';
  end if;

  if (
    select count(*)
      from public.payment_orders
     where request_fingerprint = p_request_fingerprint
       and created_at >= now() - interval '15 minutes'
  ) >= 5 then
    raise exception 'payment_rate_limit' using errcode = 'P0001';
  end if;

  if (
    select count(*)
      from public.payment_orders
     where lower(payer_email) = lower(p_payer_email)
       and created_at >= now() - interval '24 hours'
  ) >= 12 then
    raise exception 'payment_rate_limit' using errcode = 'P0001';
  end if;

  return query
  insert into public.payment_orders (
    id,
    product_code,
    product_label,
    amount,
    currency,
    payer_email,
    payer_first_name,
    payer_last_name,
    request_fingerprint,
    external_reference,
    test_mode
  ) values (
    p_id,
    p_product_code,
    p_product_label,
    p_amount,
    p_currency,
    lower(btrim(p_payer_email)),
    btrim(p_payer_first_name),
    btrim(p_payer_last_name),
    p_request_fingerprint,
    p_id::text,
    p_test_mode
  )
  returning *;
end;
$$;

revoke all on function public.hautlab_payment_create_order(
  uuid, text, text, numeric, text, text, text, text, text, boolean
) from public, anon, authenticated;
grant execute on function public.hautlab_payment_create_order(
  uuid, text, text, numeric, text, text, text, text, text, boolean
) to service_role;

create or replace function public.hautlab_payment_apply_status(
  p_order_id uuid,
  p_mp_payment_id text,
  p_status text,
  p_status_detail text,
  p_live_mode boolean,
  p_payment_method_id text,
  p_payment_type_id text,
  p_issuer_id text,
  p_paid_at timestamptz,
  p_webhook_event_id text
)
returns setof public.payment_orders
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in (
    'pending',
    'approved',
    'authorized',
    'in_process',
    'in_mediation',
    'rejected',
    'cancelled',
    'refunded',
    'charged_back'
  ) then
    raise exception 'payment_status_not_allowed' using errcode = 'P0001';
  end if;

  return query
  update public.payment_orders
     set mp_payment_id = p_mp_payment_id,
         status = case
           when payment_orders.status in ('refunded', 'charged_back')
             and p_status not in ('refunded', 'charged_back')
             then payment_orders.status
           when payment_orders.status = 'approved'
             and p_status in ('pending', 'authorized', 'in_process', 'in_mediation', 'rejected')
             then payment_orders.status
           else p_status
         end,
         status_detail = p_status_detail,
         live_mode = p_live_mode,
         payment_method_id = p_payment_method_id,
         payment_type_id = p_payment_type_id,
         issuer_id = p_issuer_id,
         last_webhook_event_id = coalesce(p_webhook_event_id, payment_orders.last_webhook_event_id),
         last_webhook_at = case
           when p_webhook_event_id is not null then now()
           else payment_orders.last_webhook_at
         end,
         paid_at = case
           when p_status = 'approved' then coalesce(payment_orders.paid_at, p_paid_at, now())
           else payment_orders.paid_at
         end
   where id = p_order_id
     and test_mode = not p_live_mode
  returning *;

  if not found then
    raise exception 'payment_order_not_found_or_mode_mismatch' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function public.hautlab_payment_apply_status(
  uuid, text, text, text, boolean, text, text, text, timestamptz, text
) from public, anon, authenticated;
grant execute on function public.hautlab_payment_apply_status(
  uuid, text, text, text, boolean, text, text, text, timestamptz, text
) to service_role;
