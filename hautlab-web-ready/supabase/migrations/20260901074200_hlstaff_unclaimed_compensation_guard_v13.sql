create or replace function public.hlstaff_monthly_snapshot(p_month date default current_date, p_operator_key text default 'karen')
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  v_me public.hlstaff_profiles;
  v_start date := date_trunc('month',p_month)::date;
  v_end date := (date_trunc('month',p_month)+interval '1 month')::date;
  v_start_ts timestamptz := (date_trunc('month',p_month)::date::timestamp at time zone 'America/Merida');
  v_end_ts timestamptz := (((date_trunc('month',p_month)+interval '1 month')::date)::timestamp at time zone 'America/Merida');
  v_staff public.hlstaff_profiles;
  v_rule public.hlstaff_compensation_rules;
  v_scheduled_minutes numeric := 0;
  v_worked_minutes numeric := 0;
  v_attendance_pct numeric := 0;
  v_late_minutes numeric := 0;
  v_late_count integer := 0;
  v_geofence_events integer := 0;
  v_outside_minutes numeric := 0;
  v_leads integer := 0;
  v_responded integer := 0;
  v_requested integer := 0;
  v_confirmed integer := 0;
  v_cash numeric := 0;
  v_mp numeric := 0;
  v_cash_commission numeric := 0;
  v_mp_commission numeric := 0;
  v_commission numeric := 0;
  v_cash_days integer := 0;
  v_cash_clean_days integer := 0;
  v_incident_deduction integer := 0;
  v_score numeric := 0;
  v_bonus numeric := 0;
  v_attendance_score numeric := 0;
  v_response_score numeric := 0;
  v_booking_score numeric := 0;
  v_cash_score numeric := 0;
  v_geo_score numeric := 0;
begin
  if auth.role()<>'service_role' then
    select * into v_me from public.hlstaff_profiles where id=auth.uid() and active=true;
    if v_me.id is null then raise exception 'STAFF_PROFILE_NOT_FOUND'; end if;
    if v_me.role<>'manager' and v_me.operator_key<>p_operator_key then raise exception 'FORBIDDEN'; end if;
  end if;

  select * into v_staff from public.hlstaff_profiles where operator_key=p_operator_key and active=true;
  select * into v_rule from public.hlstaff_compensation_rules where operator_key=p_operator_key and active=true;

  if v_staff.id is null then
    return jsonb_build_object(
      'month',v_start,
      'operatorKey',p_operator_key,
      'displayName',p_operator_key,
      'baseSalary',0,
      'commission',0,
      'bonus',0,
      'totalPay',0,
      'revenue',jsonb_build_object('cash',0,'mercadoPago',0,'total',0),
      'attendance',jsonb_build_object('scheduledMinutes',0,'workedMinutes',0,'attendancePct',0,'lateMinutes',0,'lateCount',0,'geofenceExitEvents',0,'outsideMinutes',0),
      'leads',jsonb_build_object('assigned',0,'responded',0,'appointmentRequested',0,'appointmentConfirmed',0),
      'score',0,
      'scoreBreakdown',jsonb_build_object('attendance',0,'response',0,'booking',0,'cashAccuracy',0,'geofence',0,'incidentDeduction',0)
    );
  end if;

  select coalesce(sum(extract(epoch from (s.scheduled_end-s.scheduled_start))/60),0) into v_scheduled_minutes
  from generate_series(v_start,v_end-1,interval '1 day') d
  join public.hlstaff_schedules s on s.staff_id=v_staff.id and s.active=true and s.weekday=extract(isodow from d)::int
  where s.scheduled_start is not null and s.scheduled_end is not null;

  select coalesce(sum(extract(epoch from (coalesce(check_out_at,least(now(),v_end_ts))-check_in_at))/60),0),
         coalesce(sum(minutes_late),0),
         count(*) filter(where minutes_late>0),
         coalesce(sum(minutes_outside_geofence),0)
  into v_worked_minutes,v_late_minutes,v_late_count,v_outside_minutes
  from public.hlstaff_shifts
  where staff_id=v_staff.id and check_in_at>=v_start_ts and check_in_at<v_end_ts;

  select count(*) into v_geofence_events from public.hlstaff_location_events e
  where e.staff_id=v_staff.id and e.created_at>=v_start_ts and e.created_at<v_end_ts and e.event_type='exit';

  v_attendance_pct := case when v_scheduled_minutes>0 then least(1,v_worked_minutes/v_scheduled_minutes) else 0 end;

  select count(*),count(*) filter(where last_team_message_at is not null),count(*) filter(where appointment_requested_at is not null),count(*) filter(where appointment_confirmed_at is not null)
  into v_leads,v_responded,v_requested,v_confirmed
  from public.wa_conversations
  where assigned_to=p_operator_key and created_at>=v_start_ts and created_at<v_end_ts;

  select coalesce(sum(amount),0),coalesce(sum(commission_amount),0) into v_cash,v_cash_commission
  from public.hlstaff_cash_payments where revenue_owner=p_operator_key and paid_at>=v_start_ts and paid_at<v_end_ts;

  select coalesce(sum(greatest(p.transaction_amount-p.refunded_amount,0)),0),coalesce(sum(round(greatest(p.transaction_amount-p.refunded_amount,0)*a.commission_rate,2)),0)
  into v_mp,v_mp_commission
  from public.mp_finance_payments p join public.hlstaff_payment_attribution a on a.provider='mercado_pago' and a.provider_payment_id=p.payment_id
  where a.revenue_owner=p_operator_key and p.status='approved' and coalesce(p.date_approved,p.date_created)>=v_start_ts and coalesce(p.date_approved,p.date_created)<v_end_ts;
  v_commission := coalesce(v_cash_commission,0)+coalesce(v_mp_commission,0);

  select count(*),count(*) filter(where abs(difference)<0.01) into v_cash_days,v_cash_clean_days
  from public.hlstaff_cash_closures where closure_date>=v_start and closure_date<v_end;

  select coalesce(sum(points_deducted),0) into v_incident_deduction
  from public.hlstaff_incidents where staff_operator_key=p_operator_key and occurred_at>=v_start_ts and occurred_at<v_end_ts;

  v_attendance_score := round(30*v_attendance_pct,1);
  v_response_score := case when v_leads=0 then 25 else round(25*(v_responded::numeric/v_leads),1) end;
  v_booking_score := case when v_requested=0 then 20 else round(20*least(1,v_confirmed::numeric/v_requested),1) end;
  v_cash_score := case when v_cash_days=0 then 15 else round(15*(v_cash_clean_days::numeric/v_cash_days),1) end;
  v_geo_score := greatest(0,10-least(10,(v_geofence_events*2)+floor(v_outside_minutes/30)));
  v_score := greatest(0,least(100,v_attendance_score+v_response_score+v_booking_score+v_cash_score+v_geo_score-v_incident_deduction));
  v_bonus := case when v_score>=95 then least(1500,coalesce(v_rule.max_monthly_bonus,1500)) when v_score>=90 then least(1000,coalesce(v_rule.max_monthly_bonus,1500)) when v_score>=80 then least(500,coalesce(v_rule.max_monthly_bonus,1500)) else 0 end;

  return jsonb_build_object(
    'month',v_start,
    'operatorKey',p_operator_key,
    'displayName',coalesce(v_staff.display_name,p_operator_key),
    'baseSalary',coalesce(v_rule.base_monthly_salary,0),
    'commission',round(v_commission,2),
    'bonus',round(v_bonus,2),
    'totalPay',round(coalesce(v_rule.base_monthly_salary,0)+v_commission+v_bonus,2),
    'revenue',jsonb_build_object('cash',round(v_cash,2),'mercadoPago',round(v_mp,2),'total',round(v_cash+v_mp,2)),
    'attendance',jsonb_build_object('scheduledMinutes',round(v_scheduled_minutes,0),'workedMinutes',round(v_worked_minutes,0),'attendancePct',round(v_attendance_pct*100,1),'lateMinutes',round(v_late_minutes,0),'lateCount',v_late_count,'geofenceExitEvents',v_geofence_events,'outsideMinutes',round(v_outside_minutes,0)),
    'leads',jsonb_build_object('assigned',v_leads,'responded',v_responded,'appointmentRequested',v_requested,'appointmentConfirmed',v_confirmed),
    'score',round(v_score,1),
    'scoreBreakdown',jsonb_build_object('attendance',v_attendance_score,'response',v_response_score,'booking',v_booking_score,'cashAccuracy',v_cash_score,'geofence',v_geo_score,'incidentDeduction',v_incident_deduction)
  );
end;
$$;