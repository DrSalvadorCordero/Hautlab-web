create or replace function public.hlstaff_is_manager()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.hlstaff_profiles
    where id=auth.uid() and role='manager' and active=true
  );
$$;

revoke all on function public.hlstaff_is_manager() from public;
grant execute on function public.hlstaff_is_manager() to authenticated;

drop policy if exists hlstaff_profiles_self on public.hlstaff_profiles;
drop policy if exists hlstaff_profiles_self_update on public.hlstaff_profiles;
drop policy if exists hlstaff_schedules_read on public.hlstaff_schedules;
drop policy if exists hlstaff_shifts_read on public.hlstaff_shifts;
drop policy if exists hlstaff_location_read on public.hlstaff_location_events;
drop policy if exists hlstaff_cash_read on public.hlstaff_cash_payments;
drop policy if exists hlstaff_attribution_manager on public.hlstaff_payment_attribution;
drop policy if exists hlstaff_closures_manager on public.hlstaff_cash_closures;
drop policy if exists hlstaff_incidents_manager on public.hlstaff_incidents;
drop policy if exists hlstaff_comp_read_manager on public.hlstaff_compensation_rules;

create policy hlstaff_profiles_read on public.hlstaff_profiles
for select to authenticated
using (id=auth.uid() or public.hlstaff_is_manager());

create policy hlstaff_schedules_read on public.hlstaff_schedules
for select to authenticated
using (staff_id=auth.uid() or public.hlstaff_is_manager());

create policy hlstaff_shifts_read on public.hlstaff_shifts
for select to authenticated
using (staff_id=auth.uid() or public.hlstaff_is_manager());

create policy hlstaff_location_read on public.hlstaff_location_events
for select to authenticated
using (staff_id=auth.uid() or public.hlstaff_is_manager());

create policy hlstaff_cash_read on public.hlstaff_cash_payments
for select to authenticated
using (captured_by=auth.uid() or public.hlstaff_is_manager());

create policy hlstaff_attribution_manager on public.hlstaff_payment_attribution
for all to authenticated
using (public.hlstaff_is_manager())
with check (public.hlstaff_is_manager());

create policy hlstaff_closures_manager on public.hlstaff_cash_closures
for all to authenticated
using (public.hlstaff_is_manager())
with check (public.hlstaff_is_manager());

create policy hlstaff_incidents_manager on public.hlstaff_incidents
for all to authenticated
using (public.hlstaff_is_manager())
with check (public.hlstaff_is_manager());

create policy hlstaff_comp_read on public.hlstaff_compensation_rules
for select to authenticated
using (
  public.hlstaff_is_manager()
  or operator_key=(select p.operator_key from public.hlstaff_profiles p where p.id=auth.uid())
);

create or replace function public.hlstaff_record_location_consent()
returns timestamptz
language plpgsql
security definer
set search_path=public
as $$
declare v_at timestamptz;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  v_at := now();
  update public.hlstaff_profiles
  set location_tracking_consent_at=v_at, updated_at=now()
  where id=auth.uid() and active=true;
  if not found then raise exception 'STAFF_PROFILE_NOT_FOUND'; end if;
  return v_at;
end;
$$;
revoke all on function public.hlstaff_record_location_consent() from public;
grant execute on function public.hlstaff_record_location_consent() to authenticated;
