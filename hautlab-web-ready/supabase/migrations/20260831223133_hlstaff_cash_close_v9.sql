create or replace function public.hlstaff_close_cash(
  p_site_id uuid,
  p_counted_cash numeric,
  p_closure_date date default null,
  p_notes text default null
)
returns public.hlstaff_cash_closures
language plpgsql
security definer
set search_path=public
as $$
declare
  v_staff public.hlstaff_profiles;
  v_date date := coalesce(p_closure_date, timezone('America/Merida',now())::date);
  v_expected numeric(12,2) := 0;
  v_existing public.hlstaff_cash_closures;
  v_row public.hlstaff_cash_closures;
begin
  select * into v_staff from public.hlstaff_profiles where id=auth.uid() and active=true;
  if v_staff.id is null then raise exception 'STAFF_PROFILE_NOT_FOUND'; end if;
  if p_counted_cash < 0 then raise exception 'INVALID_COUNTED_CASH'; end if;
  if not exists(select 1 from public.hlstaff_sites where id=p_site_id and active=true) then raise exception 'SITE_NOT_FOUND'; end if;
  if v_staff.role<>'manager' and v_date<>timezone('America/Merida',now())::date then raise exception 'STAFF_CAN_ONLY_CLOSE_TODAY'; end if;

  select * into v_existing from public.hlstaff_cash_closures where site_id=p_site_id and closure_date=v_date;
  if v_existing.id is not null and v_staff.role<>'manager' then raise exception 'CASH_ALREADY_CLOSED'; end if;

  select coalesce(sum(amount),0)::numeric(12,2) into v_expected
  from public.hlstaff_cash_payments
  where (paid_at at time zone 'America/Merida')::date=v_date;

  insert into public.hlstaff_cash_closures(site_id,closure_date,expected_cash,counted_cash,closed_by,notes)
  values(p_site_id,v_date,v_expected,p_counted_cash,v_staff.id,p_notes)
  on conflict(site_id,closure_date) do update
  set expected_cash=excluded.expected_cash,
      counted_cash=excluded.counted_cash,
      closed_by=excluded.closed_by,
      notes=excluded.notes,
      created_at=now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function public.hlstaff_close_cash(uuid,numeric,date,text) from public, anon;
grant execute on function public.hlstaff_close_cash(uuid,numeric,date,text) to authenticated;
