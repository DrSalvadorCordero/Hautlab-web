-- Automatic retention for geofence-derived staff data.
-- Fine-grained events expire after 13 months. Attendance timestamps/statuses remain.

create or replace function public.hlstaff_apply_location_retention()
returns jsonb
language plpgsql
set search_path to 'public'
as $function$
declare
  v_deleted_events bigint := 0;
  v_sanitized_shifts bigint := 0;
begin
  delete from public.hlstaff_location_events
  where created_at < now() - interval '13 months';
  get diagnostics v_deleted_events = row_count;

  update public.hlstaff_shifts
  set check_in_accuracy_m = null,
      check_out_accuracy_m = null,
      check_in_distance_m = null,
      check_out_distance_m = null,
      device_id = null,
      updated_at = now()
  where check_in_at < now() - interval '13 months'
    and (
      check_in_accuracy_m is not null
      or check_out_accuracy_m is not null
      or check_in_distance_m is not null
      or check_out_distance_m is not null
      or device_id is not null
    );
  get diagnostics v_sanitized_shifts = row_count;

  return jsonb_build_object(
    'deletedLocationEvents', v_deleted_events,
    'sanitizedShifts', v_sanitized_shifts,
    'retention', '13 months'
  );
end;
$function$;

revoke all on function public.hlstaff_apply_location_retention() from public, anon, authenticated;
grant execute on function public.hlstaff_apply_location_retention() to service_role;

do $block$
declare
  v_jobid bigint;
begin
  select jobid into v_jobid
  from cron.job
  where jobname = 'hlstaff-location-retention-v15'
  limit 1;

  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;

  perform cron.schedule(
    'hlstaff-location-retention-v15',
    '17 10 * * *',
    'select public.hlstaff_apply_location_retention();'
  );
end;
$block$;
