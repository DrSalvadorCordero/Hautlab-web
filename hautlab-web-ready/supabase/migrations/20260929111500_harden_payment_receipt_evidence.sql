-- P2.1 payment evidence hardening.
-- Financial truth stays with Mercado Pago. Receipts are projections and must
-- never exist without a verified provider payment identifier.

do $$
begin
  if exists (
    select 1
    from public.payment_receipts
    where source_payment_id is null
       or btrim(source_payment_id) = ''
  ) then
    raise exception 'payment_receipt_without_verified_source_payment';
  end if;
end;
$$;

alter table public.payment_receipts
  drop constraint if exists payment_receipts_source_payment_id_required;

alter table public.payment_receipts
  add constraint payment_receipts_source_payment_id_required
  check (source_payment_id is not null and btrim(source_payment_id) <> '');

create or replace function private.hautlab_sync_checkout_receipt()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_receipt_id uuid;
  v_receipt_status text;
  v_existing_payment_id text;
begin
  if new.status not in ('approved', 'refunded', 'charged_back') then
    return new;
  end if;

  if new.mp_payment_id is null or btrim(new.mp_payment_id) = '' then
    return new;
  end if;

  select source_payment_id
    into v_existing_payment_id
    from public.payment_receipts
   where source_provider = 'mercado_pago'
     and source_reference = new.external_reference;

  if v_existing_payment_id is not null
     and v_existing_payment_id <> new.mp_payment_id then
    raise exception 'checkout_receipt_payment_identity_conflict' using errcode = 'P0001';
  end if;

  v_receipt_status := case
    when new.status = 'refunded' then 'refunded'
    when new.status = 'charged_back' then 'charged_back'
    else 'issued'
  end;

  insert into public.payment_receipts (
    source_provider,
    source_reference,
    source_payment_id,
    source_order_id,
    payment_status,
    receipt_status,
    amount,
    currency,
    paid_at,
    payment_method_id,
    payment_type_id,
    live_mode,
    test_mode
  ) values (
    'mercado_pago',
    new.external_reference,
    new.mp_payment_id,
    new.preference_id,
    new.status,
    v_receipt_status,
    new.amount,
    new.currency,
    new.paid_at,
    new.payment_method_id,
    new.payment_type_id,
    new.live_mode,
    new.test_mode
  )
  on conflict (source_provider, source_reference) do update
    set source_order_id = coalesce(excluded.source_order_id, public.payment_receipts.source_order_id),
        payment_status = excluded.payment_status,
        receipt_status = excluded.receipt_status,
        paid_at = coalesce(public.payment_receipts.paid_at, excluded.paid_at),
        payment_method_id = coalesce(excluded.payment_method_id, public.payment_receipts.payment_method_id),
        payment_type_id = coalesce(excluded.payment_type_id, public.payment_receipts.payment_type_id),
        live_mode = coalesce(excluded.live_mode, public.payment_receipts.live_mode),
        updated_at = now()
  returning id into v_receipt_id;

  insert into public.payment_receipt_items (
    receipt_id,
    line_no,
    item_code,
    label,
    quantity,
    unit_price,
    discount_amount,
    line_total
  ) values (
    v_receipt_id,
    1,
    new.product_code,
    new.product_label,
    1,
    new.amount,
    0,
    new.amount
  )
  on conflict (receipt_id, line_no) do update
    set item_code = excluded.item_code,
        label = excluded.label,
        unit_price = excluded.unit_price,
        line_total = excluded.line_total,
        updated_at = now();

  return new;
end;
$$;

create or replace function private.hautlab_sync_point_receipt()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_receipt_id uuid;
  v_receipt_status text;
  v_source_payment_id text;
  v_existing_payment_id text;
begin
  if new.status not in ('processed', 'refunded') then
    return new;
  end if;

  v_source_payment_id := nullif(
    btrim(coalesce(new.payment_reference_id, new.transaction_id, '')),
    ''
  );

  if v_source_payment_id is null
     or new.mp_order_id is null
     or btrim(new.mp_order_id) = ''
     or new.live_mode is null then
    return new;
  end if;

  select source_payment_id
    into v_existing_payment_id
    from public.payment_receipts
   where source_provider = 'mercado_pago_point'
     and source_reference = new.external_reference;

  if v_existing_payment_id is not null
     and v_existing_payment_id <> v_source_payment_id then
    raise exception 'point_receipt_payment_identity_conflict' using errcode = 'P0001';
  end if;

  v_receipt_status := case
    when new.status = 'refunded' then 'refunded'
    else 'issued'
  end;

  insert into public.payment_receipts (
    source_provider,
    source_reference,
    source_payment_id,
    source_order_id,
    payment_status,
    receipt_status,
    amount,
    currency,
    paid_at,
    payment_method_id,
    payment_type_id,
    installments,
    live_mode,
    test_mode
  ) values (
    'mercado_pago_point',
    new.external_reference,
    v_source_payment_id,
    new.mp_order_id,
    new.status,
    v_receipt_status,
    new.amount,
    new.currency,
    new.paid_at,
    new.payment_method_id,
    new.payment_method_type,
    new.installments,
    new.live_mode,
    new.test_mode
  )
  on conflict (source_provider, source_reference) do update
    set source_order_id = coalesce(excluded.source_order_id, public.payment_receipts.source_order_id),
        payment_status = excluded.payment_status,
        receipt_status = excluded.receipt_status,
        paid_at = coalesce(public.payment_receipts.paid_at, excluded.paid_at),
        payment_method_id = coalesce(excluded.payment_method_id, public.payment_receipts.payment_method_id),
        payment_type_id = coalesce(excluded.payment_type_id, public.payment_receipts.payment_type_id),
        installments = coalesce(excluded.installments, public.payment_receipts.installments),
        live_mode = coalesce(excluded.live_mode, public.payment_receipts.live_mode),
        updated_at = now()
  returning id into v_receipt_id;

  insert into public.payment_receipt_items (
    receipt_id,
    line_no,
    item_code,
    label,
    quantity,
    unit_price,
    discount_amount,
    line_total
  ) values (
    v_receipt_id,
    1,
    null,
    new.description,
    1,
    new.amount,
    0,
    new.amount
  )
  on conflict (receipt_id, line_no) do update
    set label = excluded.label,
        unit_price = excluded.unit_price,
        line_total = excluded.line_total,
        updated_at = now();

  return new;
end;
$$;

-- Safe catch-up only from terminal rows that already carry provider identity.
-- Re-use the trigger projection rather than duplicating receipt/item creation
-- here, so catch-up and live updates share exactly the same invariants.
update public.payment_orders
   set updated_at = updated_at
 where status in ('approved', 'refunded', 'charged_back')
   and mp_payment_id is not null
   and btrim(mp_payment_id) <> '';

update public.mp_point_orders
   set updated_at = updated_at
 where status in ('processed', 'refunded')
   and coalesce(payment_reference_id, transaction_id) is not null
   and btrim(coalesce(payment_reference_id, transaction_id)) <> ''
   and mp_order_id is not null
   and btrim(mp_order_id) <> ''
   and live_mode is not null;
