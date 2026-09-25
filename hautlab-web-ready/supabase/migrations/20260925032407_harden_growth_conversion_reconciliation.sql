create unique index if not exists growth_conversion_events_event_schedule_uidx
  on public.growth_conversion_events(event_name, nimbo_schedule_id)
  where nimbo_schedule_id is not null;

create index if not exists growth_conversion_events_conversation_id_idx
  on public.growth_conversion_events(conversation_id);

create or replace function public.reconcile_growth_conversion_events()
returns integer
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  inserted_count integer := 0;
begin
  insert into public.growth_conversion_events (
    event_name,
    conversation_id,
    occurred_at,
    source,
    medium,
    campaign,
    content,
    term,
    gclid,
    fbclid,
    msclkid,
    appointment_source,
    nimbo_schedule_id,
    export_status
  )
  select
    'appointment_confirmed',
    c.id,
    c.appointment_confirmed_at,
    nullif(c.first_attribution ->> 'source', ''),
    nullif(c.first_attribution ->> 'medium', ''),
    nullif(c.first_attribution ->> 'campaign', ''),
    nullif(c.first_attribution ->> 'content', ''),
    nullif(c.first_attribution ->> 'term', ''),
    nullif(c.first_attribution ->> 'gclid', ''),
    nullif(c.first_attribution ->> 'fbclid', ''),
    nullif(c.first_attribution ->> 'msclkid', ''),
    coalesce(nullif(c.appointment_source, ''), 'nimbo_whatsapp'),
    c.nimbo_schedule_id,
    case
      when nullif(c.first_attribution ->> 'gclid', '') is not null then 'pending'
      else 'not_applicable'
    end
  from public.wa_conversations c
  where c.appointment_confirmed_at is not null
    and c.nimbo_schedule_id is not null
    and not exists (
      select 1
      from public.growth_conversion_events e
      where e.event_name = 'appointment_confirmed'
        and e.nimbo_schedule_id = c.nimbo_schedule_id
    )
  on conflict do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$function$;

revoke all on function public.reconcile_growth_conversion_events() from public, anon, authenticated;
grant execute on function public.reconcile_growth_conversion_events() to service_role;

revoke execute on function public.capture_wa_response_correction() from public, anon, authenticated;
revoke execute on function public.dispatch_failed_wa_notification() from public, anon, authenticated;
revoke execute on function public.refresh_wa_style_metrics() from public, anon, authenticated;
revoke execute on function public.refresh_wa_style_metrics_on_review() from public, anon, authenticated;
revoke execute on function public.verify_wa_relay_signature(text, text) from public, anon, authenticated;
revoke execute on function public.wa_dispatch_operator_notification() from public, anon, authenticated;

grant execute on function public.capture_wa_response_correction() to service_role;
grant execute on function public.dispatch_failed_wa_notification() to service_role;
grant execute on function public.refresh_wa_style_metrics() to service_role;
grant execute on function public.refresh_wa_style_metrics_on_review() to service_role;
grant execute on function public.verify_wa_relay_signature(text, text) to service_role;
grant execute on function public.wa_dispatch_operator_notification() to service_role;

select public.reconcile_growth_conversion_events();

select cron.schedule(
  'hautlab-growth-conversion-reconcile',
  '*/5 * * * *',
  'select public.reconcile_growth_conversion_events();'
)
where not exists (
  select 1 from cron.job where jobname = 'hautlab-growth-conversion-reconcile'
);
