-- HAUTLAB Reliability OS: notify the paired clinic owner of sustained incidents.
-- Runs separately from telemetry; a notification issue cannot stop heartbeats.
-- No patient names, phones, message content, medical details or secrets.
-- Uses the existing authenticated Telegram operator job dispatcher and retries.

create unique index if not exists telegram_jobs_reliability_dedup_idx
  on public.telegram_jobs (created_by)
  where created_by like 'reliability:%';

create or replace function public.hautlab_enqueue_reliability_alerts()
returns integer
language plpgsql
security invoker
set search_path = ''
as $reliability_alerts$
declare
  v_queued integer := 0;
begin
  insert into public.telegram_jobs (
    operator_key, chat_id, kind, message, next_run_at, created_by
  )
  select
    'doctor',
    link.telegram_chat_id,
    'message',
    'HAUTLAB | ALERTA OPERATIVA' || E'\n' ||
    case incident.code
      when 'watchdog_automatic_conversation_overdue' then
        'Una conversación automática continúa sin respuesta.'
      when 'watchdog_outbound_failures' then
        'Se registraron fallos repetidos de envío por WhatsApp.'
      when 'watchdog_operator_alert_failures' then
        'Están fallando notificaciones dirigidas al equipo.'
      when 'watchdog_nimbo_availability_unverified' then
        'La disponibilidad de Nimbo no está verificada o está desactualizada.'
      else
        'Se detectó una incidencia técnica.'
    end || E'\n' ||
    'Persistió durante dos verificaciones del monitor.' || E'\n' ||
    'Detectado: ' ||
      to_char(incident.first_seen_at at time zone 'America/Merida', 'DD/MM/YYYY HH24:MI') ||
      ' (Mérida).' || E'\n' ||
    'Revisa el estado actual en HAUTLAB Command Center. No se han modificado citas ni conversaciones.',
    now(),
    'reliability:' || incident.code || ':' ||
      floor(extract(epoch from incident.first_seen_at))::bigint::text
  from public.hautlab_reliability_incidents incident
  join public.telegram_operator_links link
    on link.operator_key = 'doctor'
   and link.active = true
   and link.telegram_chat_id is not null
  join public.wa_operators op
    on op.operator_key = 'doctor'
   and op.active = true
   and op.alert_enabled = true
  where incident.status = 'open'
    and incident.occurrences >= 2
    and incident.code in (
      'watchdog_automatic_conversation_overdue',
      'watchdog_outbound_failures',
      'watchdog_operator_alert_failures',
      'watchdog_nimbo_availability_unverified'
    )
    -- Limit repeated episodes of the same incident to one alert in two hours.
    and not exists (
      select 1
      from public.telegram_jobs existing
      where existing.created_by like 'reliability:' || incident.code || ':%'
        and existing.created_at > now() - interval '2 hours'
    )
  on conflict do nothing;

  get diagnostics v_queued = row_count;
  return v_queued;
end;
$reliability_alerts$;

revoke all on function public.hautlab_enqueue_reliability_alerts()
  from public, anon, authenticated;

select cron.schedule(
  'hautlab-reliability-owner-alerts-v1',
  '2-57/5 * * * *',
  $$ select public.hautlab_enqueue_reliability_alerts(); $$
);
