create or replace function public.hlstaff_try_auto_attribute_mp()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_conv uuid;
  v_assigned text;
  v_rate numeric(6,5):=0;
  v_type text:='none';
  v_owner text;
  v_ref text;
begin
  v_ref := coalesce(new.external_reference,'');

  -- First priority: a WhatsApp conversation UUID means attribution follows
  -- the operator assigned to that conversation.
  begin
    if v_ref ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
       and exists(select 1 from public.wa_conversations where id=v_ref::uuid) then
      v_conv := v_ref::uuid;
    elsif v_ref ~* '(conversation|conv|wa)[:=_-][0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}' then
      v_conv := substring(v_ref from '([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})')::uuid;
    end if;
  exception when others then
    v_conv := null;
  end;

  if v_conv is not null then
    select assigned_to into v_assigned from public.wa_conversations where id=v_conv;
    v_owner := case when v_assigned in ('karen','doctor') then v_assigned else 'organic' end;
    if v_owner='karen' then
      select standard_commission_rate into v_rate
      from public.hlstaff_compensation_rules where operator_key='karen' and active=true;
      v_type := 'standard';
    end if;
  -- Public Checkout Pro uses payment_orders.id as external_reference.
  elsif v_ref ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        and exists(select 1 from public.payment_orders where id=v_ref::uuid) then
    v_owner := 'organic';
    v_rate := 0;
    v_type := 'none';
  else
    return new;
  end if;

  insert into public.hlstaff_payment_attribution(
    provider,provider_payment_id,conversation_id,revenue_owner,
    commission_type,commission_rate,attribution_source
  ) values (
    'mercado_pago',new.payment_id,v_conv,v_owner,v_type,coalesce(v_rate,0),'automatic'
  )
  on conflict(provider,provider_payment_id) do update
  set conversation_id=excluded.conversation_id,
      revenue_owner=excluded.revenue_owner,
      commission_type=excluded.commission_type,
      commission_rate=excluded.commission_rate,
      attribution_source='automatic';

  return new;
end;
$$;

revoke execute on function public.hlstaff_try_auto_attribute_mp() from public,anon,authenticated;

-- Backfill any already-synced payments that can be unambiguously classified.
insert into public.hlstaff_payment_attribution(
  provider,provider_payment_id,conversation_id,revenue_owner,
  commission_type,commission_rate,attribution_source
)
select
  'mercado_pago',p.payment_id,null,'organic','none',0,'imported'
from public.mp_finance_payments p
join public.payment_orders o on o.id::text=p.external_reference
where not exists(
  select 1 from public.hlstaff_payment_attribution a
  where a.provider='mercado_pago' and a.provider_payment_id=p.payment_id
)
on conflict(provider,provider_payment_id) do nothing;
