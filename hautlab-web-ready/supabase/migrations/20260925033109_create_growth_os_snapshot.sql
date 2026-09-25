create or replace function public.growth_os_snapshot(p_days integer default 30)
returns jsonb
language sql
security invoker
set search_path = ''
as $function$
with bounds as (
  select
    greatest(1, least(coalesce(p_days, 30), 365))::integer as days,
    now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365))::integer) as since_at
),
conversation_metrics as (
  select
    count(*) filter (where c.created_at >= b.since_at) as leads,
    count(*) filter (where c.created_at >= b.since_at and c.last_team_message_at is not null) as responded,
    count(*) filter (where c.created_at >= b.since_at and c.appointment_requested_at is not null) as appointment_requested,
    count(*) filter (where c.created_at >= b.since_at and c.appointment_confirmed_at is not null) as appointment_confirmed,
    count(*) filter (where c.created_at >= b.since_at and c.first_attribution is not null) as attributed_leads,
    count(*) filter (where c.created_at >= b.since_at and c.bot_paused) as paused_leads
  from public.wa_conversations c
  cross join bounds b
),
touchpoint_metrics as (
  select
    count(*) as touchpoints,
    count(*) filter (where t.matched_conversation_id is not null) as matched_touchpoints
  from public.growth_attribution_touchpoints t
  cross join bounds b
  where t.created_at >= b.since_at
),
conversion_metrics as (
  select
    count(*) as conversion_events,
    count(*) filter (where e.export_status = 'pending') as pending_exports,
    count(*) filter (where e.export_status = 'exported') as exported_events,
    count(*) filter (where e.gclid is not null) as google_click_conversions,
    count(*) filter (where e.fbclid is not null) as meta_click_conversions
  from public.growth_conversion_events e
  cross join bounds b
  where e.occurred_at >= b.since_at
),
cash_revenue as (
  select
    coalesce(sum(p.amount), 0)::numeric as recorded,
    coalesce(sum(p.amount) filter (where p.conversation_id is not null), 0)::numeric as conversation_attributed,
    coalesce(sum(p.amount) filter (
      where p.conversation_id is not null
        and c.first_attribution is not null
    ), 0)::numeric as marketing_attributed
  from public.hlstaff_cash_payments p
  cross join bounds b
  left join public.wa_conversations c on c.id = p.conversation_id
  where p.paid_at >= b.since_at
),
mp_revenue as (
  select
    coalesce(sum(greatest(p.transaction_amount - coalesce(p.refunded_amount, 0), 0)), 0)::numeric as recorded
  from public.mp_finance_payments p
  cross join bounds b
  where p.status = 'approved'
    and coalesce(p.date_approved, p.date_created) >= b.since_at
),
mp_attributed_revenue as (
  select
    coalesce(sum(greatest(p.transaction_amount - coalesce(p.refunded_amount, 0), 0)), 0)::numeric as conversation_attributed,
    coalesce(sum(greatest(p.transaction_amount - coalesce(p.refunded_amount, 0), 0)) filter (
      where c.first_attribution is not null
    ), 0)::numeric as marketing_attributed
  from public.mp_finance_payments p
  join public.hlstaff_payment_attribution a
    on a.provider = 'mercado_pago'
   and a.provider_payment_id = p.payment_id
  join public.wa_conversations c on c.id = a.conversation_id
  cross join bounds b
  where p.status = 'approved'
    and coalesce(p.date_approved, p.date_created) >= b.since_at
),
campaign_rows as (
  select
    coalesce(nullif(c.first_attribution ->> 'campaign', ''), '(sin campaña)') as campaign,
    count(*) as leads,
    count(*) filter (where c.appointment_confirmed_at is not null) as confirmed
  from public.wa_conversations c
  cross join bounds b
  where c.created_at >= b.since_at
    and c.first_attribution is not null
  group by 1
  order by count(*) desc, 1
  limit 10
),
campaigns as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'campaign', campaign,
        'leads', leads,
        'confirmed', confirmed
      )
      order by leads desc, campaign
    ),
    '[]'::jsonb
  ) as data
  from campaign_rows
)
select jsonb_build_object(
  'days', b.days,
  'generatedAt', now(),
  'adSpendConnected', false,
  'adSpendMxn', null,
  'roas', null,
  'touchpoints', t.touchpoints,
  'matchedTouchpoints', t.matched_touchpoints,
  'leads', c.leads,
  'responded', c.responded,
  'appointmentRequested', c.appointment_requested,
  'appointmentConfirmed', c.appointment_confirmed,
  'attributedLeads', c.attributed_leads,
  'pausedLeads', c.paused_leads,
  'conversionEvents', e.conversion_events,
  'pendingExports', e.pending_exports,
  'exportedEvents', e.exported_events,
  'googleClickConversions', e.google_click_conversions,
  'metaClickConversions', e.meta_click_conversions,
  'recordedRevenueMxn', cash.recorded + mp.recorded,
  'conversationAttributedRevenueMxn', cash.conversation_attributed + mpa.conversation_attributed,
  'marketingAttributedRevenueMxn', cash.marketing_attributed + mpa.marketing_attributed,
  'campaigns', campaigns.data
)
from bounds b
cross join conversation_metrics c
cross join touchpoint_metrics t
cross join conversion_metrics e
cross join cash_revenue cash
cross join mp_revenue mp
cross join mp_attributed_revenue mpa
cross join campaigns;
$function$;

revoke all on function public.growth_os_snapshot(integer) from public, anon, authenticated;
grant execute on function public.growth_os_snapshot(integer) to service_role;
