-- Independent five-minute HAUTLAB reliability heartbeat.
-- Aggregates status only: no names, phones, patient notes, or message bodies.
-- No automated outbound messages, bookings, or credential changes.

create table if not exists public.hautlab_reliability_samples (
  id bigint generated always as identity primary key,
  checked_at timestamptz not null default now(),
  overall_status text not null check (overall_status in ('healthy', 'degraded')),
  whatsapp_mode text not null,
  whatsapp_emergency_stop boolean not null,
  unattended_automatic_conversations integer not null check (unattended_automatic_conversations >= 0),
  failed_outbound_1h integer not null check (failed_outbound_1h >= 0),
  failed_operator_alerts_1h integer not null check (failed_operator_alerts_1h >= 0),
  nimbo_snapshot_status text,
  nimbo_snapshot_age_minutes integer
);
create index if not exists hautlab_reliability_samples_checked_at_idx
  on public.hautlab_reliability_samples (checked_at desc);
alter table public.hautlab_reliability_samples enable row level security;
revoke all on public.hautlab_reliability_samples from public, anon, authenticated;
grant select on public.hautlab_reliability_samples to service_role;

create table if not exists public.hautlab_reliability_incidents (
  code text primary key,
  severity text not null check (severity in ('warning','high')),
  status text not null check (status in ('open','resolved')),
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  occurrences integer not null default 1 check (occurrences >= 1),
  resolved_at timestamptz
);
alter table public.hautlab_reliability_incidents enable row level security;
revoke all on public.hautlab_reliability_incidents from public, anon, authenticated;
grant select on public.hautlab_reliability_incidents to service_role;

create or replace function public.hautlab_capture_reliability_sample()
returns void
language plpgsql
security definer
set search_path = ''
as $watchdog$
declare
  v_now timestamptz := now();
  v_mode text;
  v_stop boolean;
  v_overdue integer;
  v_failed_outbound integer;
  v_failed_alerts integer;
  v_nimbo_status text;
  v_nimbo_at timestamptz;
  v_nimbo_age integer;
  v_nimbo_unverified boolean;
  v_state text;
  v_active text[];
begin
  select s.global_mode, s.emergency_stop
    into v_mode, v_stop
    from public.wa_settings s
    where s.id = 'global';
  if not found then
    raise exception 'reliability_settings_unavailable';
  end if;

  select count(*)::integer into v_overdue
    from public.wa_conversations c
    where c.bot_paused = false
      and c.ai_mode in ('inherit', 'automatic')
      and coalesce(c.handoff_status, 'none') = 'none'
      and c.clinical_risk = false
      and c.closed_at is null
      and c.last_patient_message_at >= v_now - interval '24 hours'
      and c.last_patient_message_at < v_now - interval '15 minutes'
      and c.last_patient_message_at > coalesce(c.last_team_message_at, '-infinity'::timestamptz);

  select count(*)::integer into v_failed_outbound
    from public.wa_messages m
    where m.direction = 'outbound'
      and m.status = 'failed'
      and m.created_at >= v_now - interval '1 hour';

  select count(*)::integer into v_failed_alerts
    from public.wa_notifications n
    where n.status = 'failed'
      and n.created_at >= v_now - interval '1 hour';

  select snapshot.status, snapshot.checked_at
    into v_nimbo_status, v_nimbo_at
    from public.nimbo_availability_snapshot snapshot
    order by snapshot.checked_at desc
    limit 1;

  if v_nimbo_at is not null then
    v_nimbo_age := floor(extract(epoch from (v_now - v_nimbo_at)) / 60)::integer;
  end if;
  v_nimbo_unverified := v_nimbo_status is distinct from 'ok'
    or v_nimbo_at is null
    or v_nimbo_at > v_now + interval '1 minute'
    or v_nimbo_at < v_now - interval '90 minutes';

  v_active := array_remove(array[
    case when coalesce(v_stop, true) then 'watchdog_whatsapp_emergency_stop'::text end,
    case when v_mode <> 'automatic' then 'watchdog_whatsapp_manual_mode'::text end,
    case when v_overdue > 0 then 'watchdog_automatic_conversation_overdue'::text end,
    case when v_failed_outbound >= 2 then 'watchdog_outbound_failures'::text end,
    case when v_failed_alerts >= 2 then 'watchdog_operator_alert_failures'::text end,
    case when v_nimbo_unverified then 'watchdog_nimbo_availability_unverified'::text end
  ], null);

  v_state := case when coalesce(array_length(v_active, 1), 0) > 0
    then 'degraded' else 'healthy' end;

  insert into public.hautlab_reliability_samples (
    checked_at, overall_status, whatsapp_mode, whatsapp_emergency_stop,
    unattended_automatic_conversations, failed_outbound_1h,
    failed_operator_alerts_1h, nimbo_snapshot_status, nimbo_snapshot_age_minutes
  ) values (
    v_now, v_state, v_mode, v_stop, v_overdue,
    v_failed_outbound, v_failed_alerts, v_nimbo_status, v_nimbo_age
  );

  insert into public.hautlab_reliability_incidents (
    code, severity, status, first_seen_at, last_seen_at, occurrences, resolved_at
  )
  select active.code,
    case when active.code in ('watchdog_outbound_failures', 'watchdog_nimbo_availability_unverified')
      then 'high' else 'warning' end,
    'open', v_now, v_now, 1, null
  from unnest(v_active) as active(code)
  on conflict (code) do update
    set status = 'open',
        severity = excluded.severity,
        first_seen_at = case
          when public.hautlab_reliability_incidents.status = 'resolved'
          then excluded.first_seen_at
          else public.hautlab_reliability_incidents.first_seen_at end,
        last_seen_at = excluded.last_seen_at,
        occurrences = case
          when public.hautlab_reliability_incidents.status = 'resolved' then 1
          else public.hautlab_reliability_incidents.occurrences + 1 end,
        resolved_at = null;

  update public.hautlab_reliability_incidents i
    set status = 'resolved', resolved_at = v_now
    where i.status = 'open'
      and i.code like 'watchdog_%'
      and not (i.code = any(v_active));

  -- 14 days of five-minute samples (~4,032 rows); incident lifecycle is retained.
  delete from public.hautlab_reliability_samples
    where checked_at < v_now - interval '14 days';
end;
$watchdog$;

revoke all on function public.hautlab_capture_reliability_sample() from public, anon, authenticated;

select cron.schedule(
  'hautlab-reliability-heartbeat-v1',
  '*/5 * * * *',
  $$ select public.hautlab_capture_reliability_sample(); $$
);
