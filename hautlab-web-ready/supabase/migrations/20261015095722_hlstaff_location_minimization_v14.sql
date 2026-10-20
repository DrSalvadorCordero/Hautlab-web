-- Privacy hardening: validate location transiently but never retain raw staff coordinates.
-- The clinic site's own coordinates remain stored because they define the geofence.

alter table public.hlstaff_shifts
  alter column check_in_lat drop not null,
  alter column check_in_lng drop not null;

alter table public.hlstaff_shifts
  drop constraint if exists hlstaff_shifts_no_raw_location;

alter table public.hlstaff_shifts
  add constraint hlstaff_shifts_no_raw_location
  check (
    check_in_lat is null
    and check_in_lng is null
    and check_out_lat is null
    and check_out_lng is null
  );

alter table public.hlstaff_location_events
  drop constraint if exists hlstaff_location_events_no_raw_location;

alter table public.hlstaff_location_events
  add constraint hlstaff_location_events_no_raw_location
  check (latitude is null and longitude is null);

comment on column public.hlstaff_shifts.check_in_lat is
  'Deprecated privacy guard: raw staff coordinates are not retained.';
comment on column public.hlstaff_shifts.check_in_lng is
  'Deprecated privacy guard: raw staff coordinates are not retained.';
comment on column public.hlstaff_shifts.check_out_lat is
  'Deprecated privacy guard: raw staff coordinates are not retained.';
comment on column public.hlstaff_shifts.check_out_lng is
  'Deprecated privacy guard: raw staff coordinates are not retained.';
comment on column public.hlstaff_location_events.latitude is
  'Deprecated privacy guard: raw staff coordinates are not retained.';
comment on column public.hlstaff_location_events.longitude is
  'Deprecated privacy guard: raw staff coordinates are not retained.';

create or replace function public.hlstaff_check_in(
  p_site_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_accuracy_m double precision default null::double precision,
  p_device_id text default null::text
)
returns public.hlstaff_shifts
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_staff public.hlstaff_profiles;
  v_site public.hlstaff_sites;
  v_distance double precision;
  v_sched public.hlstaff_schedules;
  v_late integer := 0;
  v_shift public.hlstaff_shifts;
begin
  select * into v_staff
  from public.hlstaff_profiles
  where id=auth.uid() and active=true;
  if v_staff.id is null then raise exception 'STAFF_PROFILE_NOT_FOUND'; end if;

  select * into v_site
  from public.hlstaff_sites
  where id=p_site_id and active=true;
  if v_site.id is null then raise exception 'SITE_NOT_FOUND'; end if;
  if v_site.latitude is null or v_site.longitude is null then raise exception 'SITE_NOT_CALIBRATED'; end if;

  if exists(
    select 1 from public.hlstaff_shifts
    where staff_id=v_staff.id and check_out_at is null
  ) then
    raise exception 'OPEN_SHIFT_EXISTS';
  end if;

  v_distance := public.hlstaff_haversine_m(
    p_lat,p_lng,v_site.latitude,v_site.longitude
  );

  select * into v_sched
  from public.hlstaff_schedules
  where staff_id=v_staff.id
    and weekday=extract(isodow from timezone('America/Merida',now()))::int
    and active=true;

  if v_sched.id is not null and v_sched.scheduled_start is not null then
    v_late := greatest(
      0,
      floor(
        extract(
          epoch from (
            (timezone('America/Merida',now())::time) - v_sched.scheduled_start
          )
        )/60
      )::int - v_sched.grace_minutes
    );
  end if;

  insert into public.hlstaff_shifts(
    staff_id,
    site_id,
    check_in_accuracy_m,
    check_in_distance_m,
    check_in_status,
    minutes_late,
    device_id
  )
  values(
    v_staff.id,
    v_site.id,
    p_accuracy_m,
    v_distance,
    case when v_distance <= v_site.radius_m then 'inside' else 'outside' end,
    v_late,
    p_device_id
  )
  returning * into v_shift;

  insert into public.hlstaff_location_events(
    shift_id,
    staff_id,
    event_type,
    accuracy_m,
    distance_m,
    inside_geofence
  )
  values(
    v_shift.id,
    v_staff.id,
    'check_in',
    p_accuracy_m,
    v_distance,
    v_distance <= v_site.radius_m
  );

  if v_distance > v_site.radius_m then
    raise exception 'OUTSIDE_GEOFENCE';
  end if;

  return v_shift;
end;
$function$;

create or replace function public.hlstaff_log_location(
  p_shift_id uuid,
  p_event_type text,
  p_lat double precision,
  p_lng double precision,
  p_accuracy_m double precision default null::double precision
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_staff public.hlstaff_profiles;
  v_shift public.hlstaff_shifts;
  v_site public.hlstaff_sites;
  v_distance double precision;
  v_last_exit timestamptz;
  v_last_enter timestamptz;
  v_minutes integer := 0;
begin
  select * into v_staff
  from public.hlstaff_profiles
  where id=auth.uid() and active=true;
  if v_staff.id is null then raise exception 'STAFF_PROFILE_NOT_FOUND'; end if;

  select * into v_shift
  from public.hlstaff_shifts
  where id=p_shift_id
    and staff_id=v_staff.id
    and check_out_at is null
  for update;
  if v_shift.id is null then raise exception 'OPEN_SHIFT_NOT_FOUND'; end if;

  select * into v_site
  from public.hlstaff_sites
  where id=v_shift.site_id;

  v_distance := public.hlstaff_haversine_m(
    p_lat,p_lng,v_site.latitude,v_site.longitude
  );

  if p_event_type='enter' then
    select
      max(created_at) filter(where event_type='exit'),
      max(created_at) filter(where event_type='enter')
    into v_last_exit,v_last_enter
    from public.hlstaff_location_events
    where shift_id=v_shift.id;

    if v_last_exit is not null and (v_last_enter is null or v_last_exit>v_last_enter) then
      v_minutes := greatest(
        0,
        floor(extract(epoch from (now()-v_last_exit))/60)::int
      );
      update public.hlstaff_shifts
      set minutes_outside_geofence=minutes_outside_geofence+v_minutes,
          updated_at=now()
      where id=v_shift.id;
    end if;
  end if;

  insert into public.hlstaff_location_events(
    shift_id,
    staff_id,
    event_type,
    accuracy_m,
    distance_m,
    inside_geofence
  )
  values(
    v_shift.id,
    v_staff.id,
    p_event_type,
    p_accuracy_m,
    v_distance,
    v_distance <= v_site.radius_m
  );
end;
$function$;

create or replace function public.hlstaff_check_out(
  p_lat double precision,
  p_lng double precision,
  p_accuracy_m double precision default null::double precision
)
returns public.hlstaff_shifts
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_staff public.hlstaff_profiles;
  v_shift public.hlstaff_shifts;
  v_site public.hlstaff_sites;
  v_distance double precision;
  v_last_exit timestamptz;
  v_last_enter timestamptz;
  v_extra_minutes integer := 0;
begin
  select * into v_staff
  from public.hlstaff_profiles
  where id=auth.uid() and active=true;
  if v_staff.id is null then raise exception 'STAFF_PROFILE_NOT_FOUND'; end if;

  select * into v_shift
  from public.hlstaff_shifts
  where staff_id=v_staff.id and check_out_at is null
  order by check_in_at desc
  limit 1
  for update;
  if v_shift.id is null then raise exception 'NO_OPEN_SHIFT'; end if;

  select * into v_site
  from public.hlstaff_sites
  where id=v_shift.site_id;

  v_distance := public.hlstaff_haversine_m(
    p_lat,p_lng,v_site.latitude,v_site.longitude
  );

  select
    max(created_at) filter(where event_type='exit'),
    max(created_at) filter(where event_type='enter')
  into v_last_exit,v_last_enter
  from public.hlstaff_location_events
  where shift_id=v_shift.id;

  if v_last_exit is not null and (v_last_enter is null or v_last_exit>v_last_enter) then
    v_extra_minutes := greatest(
      0,
      floor(extract(epoch from (now()-v_last_exit))/60)::int
    );
  end if;

  update public.hlstaff_shifts
  set check_out_at=now(),
      check_out_accuracy_m=p_accuracy_m,
      check_out_distance_m=v_distance,
      check_out_status=case when v_distance <= v_site.radius_m then 'inside' else 'outside' end,
      minutes_outside_geofence=minutes_outside_geofence+v_extra_minutes,
      updated_at=now()
  where id=v_shift.id
  returning * into v_shift;

  insert into public.hlstaff_location_events(
    shift_id,
    staff_id,
    event_type,
    accuracy_m,
    distance_m,
    inside_geofence
  )
  values(
    v_shift.id,
    v_staff.id,
    'check_out',
    p_accuracy_m,
    v_distance,
    v_distance <= v_site.radius_m
  );

  return v_shift;
end;
$function$;
