-- HAUTLAB billing / CFDI 4.0 bridge
-- Provider authority: Facturama API Web. Payments remain external (Mercado Pago, cash, transfer, etc.).
-- Production issuance stays disabled until Facturama production credentials are present in Vault.

create table if not exists public.billing_provider_config (
  provider text primary key default 'facturama' check (provider = 'facturama'),
  active_mode text not null default 'test' check (active_mode in ('test', 'production')),
  enabled boolean not null default false,
  issuer_rfc text not null,
  issuer_name text not null,
  issuer_fiscal_regime text not null,
  expedition_zip text not null,
  default_series text not null default 'HL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.billing_provider_config (
  provider,
  active_mode,
  enabled,
  issuer_rfc,
  issuer_name,
  issuer_fiscal_regime,
  expedition_zip,
  default_series
)
values (
  'facturama',
  'test',
  false,
  'CORS921130FAA',
  'SALVADOR CORDERO ROMERO',
  '612',
  '97128',
  'HL'
)
on conflict (provider) do update
set issuer_rfc = excluded.issuer_rfc,
    issuer_name = excluded.issuer_name,
    issuer_fiscal_regime = excluded.issuer_fiscal_regime,
    expedition_zip = excluded.expedition_zip,
    updated_at = now();

create table if not exists public.billing_service_catalog (
  code text primary key,
  label text not null check (char_length(label) between 3 and 180),
  sat_product_code text not null check (sat_product_code ~ '^[0-9]{8}$'),
  unit_code text not null,
  unit_label text not null,
  tax_object text not null check (tax_object in ('01', '02', '03', '04')),
  tax_name text,
  tax_rate numeric(8,6),
  tax_exempt boolean not null default false,
  enabled boolean not null default true,
  fiscal_reviewed_at timestamptz,
  fiscal_reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_service_tax_consistency check (
    (tax_object = '02' and tax_name is not null and tax_rate is not null)
    or (tax_object <> '02')
  )
);

-- Only the already-used dermatology consultation mapping is preloaded.
-- Do not infer tax treatment for aesthetic procedures: add each service only after fiscal review.
insert into public.billing_service_catalog (
  code,
  label,
  sat_product_code,
  unit_code,
  unit_label,
  tax_object,
  tax_name,
  tax_rate,
  tax_exempt,
  fiscal_reviewed_at,
  fiscal_reviewed_by
)
values (
  'medical_assessment',
  'Consulta médica dermatológica',
  '85121611',
  'E48',
  'Unidad de servicio',
  '02',
  'IVA Exento',
  0,
  true,
  now(),
  'existing_issued_cfdi_reference'
)
on conflict (code) do nothing;

create table if not exists public.billing_invoice_requests (
  id uuid primary key default gen_random_uuid(),
  source_provider text not null check (
    source_provider in ('mercado_pago', 'mercado_pago_point', 'cash', 'bank_transfer', 'manual')
  ),
  source_reference text not null,
  source_payment_id text,
  source_order_id text,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'MXN' check (currency = 'MXN'),
  service_code text references public.billing_service_catalog(code),
  status text not null default 'pending_fiscal_data' check (
    status in (
      'pending_fiscal_data',
      'ready',
      'issuing',
      'issued',
      'failed',
      'cancel_requested',
      'cancelled'
    )
  ),
  receiver_rfc text,
  receiver_name text,
  receiver_fiscal_regime text,
  receiver_tax_zip_code text,
  cfdi_use text,
  payment_form text,
  payment_method text not null default 'PUE' check (payment_method in ('PUE', 'PPD')),
  facturama_id text unique,
  fiscal_uuid uuid unique,
  provider_status text,
  error_code text,
  error_message text,
  xml_storage_path text,
  pdf_storage_path text,
  xml_sha256 text,
  pdf_sha256 text,
  issued_at timestamptz,
  cancelled_at timestamptz,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_provider, source_reference)
);

create index if not exists billing_invoice_requests_status_requested_idx
  on public.billing_invoice_requests (status, requested_at desc);
create index if not exists billing_invoice_requests_receiver_rfc_idx
  on public.billing_invoice_requests (receiver_rfc, requested_at desc);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  invoice_request_id uuid not null references public.billing_invoice_requests(id) on delete cascade,
  event_type text not null,
  provider_event_id text,
  deduplication_key text unique,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists billing_events_invoice_created_idx
  on public.billing_events (invoice_request_id, created_at desc);

alter table public.billing_provider_config enable row level security;
alter table public.billing_service_catalog enable row level security;
alter table public.billing_invoice_requests enable row level security;
alter table public.billing_events enable row level security;

revoke all on table public.billing_provider_config from anon, authenticated;
revoke all on table public.billing_service_catalog from anon, authenticated;
revoke all on table public.billing_invoice_requests from anon, authenticated;
revoke all on table public.billing_events from anon, authenticated;

grant select, insert, update, delete on table public.billing_provider_config to service_role;
grant select, insert, update, delete on table public.billing_service_catalog to service_role;
grant select, insert, update, delete on table public.billing_invoice_requests to service_role;
grant select, insert, update, delete on table public.billing_events to service_role;

drop trigger if exists billing_provider_config_set_updated_at on public.billing_provider_config;
create trigger billing_provider_config_set_updated_at
before update on public.billing_provider_config
for each row execute function private.hautlab_set_updated_at();

drop trigger if exists billing_service_catalog_set_updated_at on public.billing_service_catalog;
create trigger billing_service_catalog_set_updated_at
before update on public.billing_service_catalog
for each row execute function private.hautlab_set_updated_at();

drop trigger if exists billing_invoice_requests_set_updated_at on public.billing_invoice_requests;
create trigger billing_invoice_requests_set_updated_at
before update on public.billing_invoice_requests
for each row execute function private.hautlab_set_updated_at();

create or replace function public.hautlab_billing_secret(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  if p_name not in (
    'facturama_username_test',
    'facturama_password_test',
    'facturama_username_production',
    'facturama_password_production'
  ) then
    raise exception 'billing_secret_not_allowed' using errcode = 'P0001';
  end if;

  select decrypted_secret
    into v_secret
    from vault.decrypted_secrets
   where name = 'hautlab_' || p_name
   limit 1;

  if v_secret is null or btrim(v_secret) = '' then
    raise exception 'billing_secret_not_configured' using errcode = 'P0001';
  end if;

  return v_secret;
end;
$$;

revoke all on function public.hautlab_billing_secret(text) from public, anon, authenticated;
grant execute on function public.hautlab_billing_secret(text) to service_role;

create or replace function private.hautlab_queue_checkout_invoice()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'approved' and (old.status is distinct from new.status) then
    insert into public.billing_invoice_requests (
      source_provider,
      source_reference,
      source_payment_id,
      amount,
      currency,
      service_code,
      payment_form
    ) values (
      'mercado_pago',
      new.external_reference,
      new.mp_payment_id,
      new.amount,
      new.currency,
      new.product_code,
      case
        when new.payment_type_id = 'credit_card' then '04'
        when new.payment_type_id = 'debit_card' then '28'
        else null
      end
    )
    on conflict (source_provider, source_reference) do update
    set source_payment_id = excluded.source_payment_id,
        amount = excluded.amount,
        payment_form = coalesce(excluded.payment_form, public.billing_invoice_requests.payment_form),
        updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists payment_orders_queue_billing on public.payment_orders;
create trigger payment_orders_queue_billing
after update on public.payment_orders
for each row execute function private.hautlab_queue_checkout_invoice();

create or replace function private.hautlab_queue_point_invoice()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'processed' and (old.status is distinct from new.status) then
    insert into public.billing_invoice_requests (
      source_provider,
      source_reference,
      source_payment_id,
      source_order_id,
      amount,
      currency,
      payment_form
    ) values (
      'mercado_pago_point',
      new.external_reference,
      coalesce(new.payment_reference_id, new.transaction_id),
      new.mp_order_id,
      new.amount,
      new.currency,
      case
        when new.payment_method_type = 'credit_card' then '04'
        when new.payment_method_type = 'debit_card' then '28'
        else null
      end
    )
    on conflict (source_provider, source_reference) do update
    set source_payment_id = excluded.source_payment_id,
        source_order_id = excluded.source_order_id,
        amount = excluded.amount,
        payment_form = coalesce(excluded.payment_form, public.billing_invoice_requests.payment_form),
        updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists mp_point_orders_queue_billing on public.mp_point_orders;
create trigger mp_point_orders_queue_billing
after update on public.mp_point_orders
for each row execute function private.hautlab_queue_point_invoice();

create or replace function public.hautlab_billing_set_receiver(
  p_invoice_request_id uuid,
  p_receiver_rfc text,
  p_receiver_name text,
  p_receiver_fiscal_regime text,
  p_receiver_tax_zip_code text,
  p_cfdi_use text,
  p_payment_form text default null
)
returns setof public.billing_invoice_requests
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_receiver_rfc is null or btrim(p_receiver_rfc) !~ '^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$' then
    raise exception 'invalid_receiver_rfc' using errcode = 'P0001';
  end if;
  if p_receiver_name is null or char_length(btrim(p_receiver_name)) < 3 then
    raise exception 'invalid_receiver_name' using errcode = 'P0001';
  end if;
  if p_receiver_fiscal_regime is null or p_receiver_fiscal_regime !~ '^[0-9]{3}$' then
    raise exception 'invalid_receiver_fiscal_regime' using errcode = 'P0001';
  end if;
  if p_receiver_tax_zip_code is null or p_receiver_tax_zip_code !~ '^[0-9]{5}$' then
    raise exception 'invalid_receiver_tax_zip_code' using errcode = 'P0001';
  end if;
  if p_cfdi_use is null or p_cfdi_use !~ '^[A-Z0-9]{3}$' then
    raise exception 'invalid_cfdi_use' using errcode = 'P0001';
  end if;
  if p_payment_form is not null and p_payment_form !~ '^[0-9]{2}$' then
    raise exception 'invalid_payment_form' using errcode = 'P0001';
  end if;

  return query
  update public.billing_invoice_requests
     set receiver_rfc = upper(btrim(p_receiver_rfc)),
         receiver_name = upper(btrim(p_receiver_name)),
         receiver_fiscal_regime = p_receiver_fiscal_regime,
         receiver_tax_zip_code = p_receiver_tax_zip_code,
         cfdi_use = upper(p_cfdi_use),
         payment_form = coalesce(p_payment_form, payment_form),
         status = case
           when service_code is not null
            and coalesce(p_payment_form, payment_form) is not null
             then 'ready'
           else 'pending_fiscal_data'
         end,
         error_code = null,
         error_message = null,
         updated_at = now()
   where id = p_invoice_request_id
     and status in ('pending_fiscal_data', 'ready', 'failed')
  returning *;
end;
$$;

revoke all on function public.hautlab_billing_set_receiver(uuid,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.hautlab_billing_set_receiver(uuid,text,text,text,text,text,text) to service_role;
