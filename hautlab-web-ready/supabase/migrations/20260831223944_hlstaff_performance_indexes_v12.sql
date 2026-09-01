create index if not exists hlstaff_cash_closures_closed_by_idx on public.hlstaff_cash_closures(closed_by);
create index if not exists hlstaff_cash_payments_captured_by_idx on public.hlstaff_cash_payments(captured_by);
create index if not exists hlstaff_cash_payments_conversation_id_idx on public.hlstaff_cash_payments(conversation_id);
create index if not exists hlstaff_incidents_created_by_idx on public.hlstaff_incidents(created_by);
create index if not exists hlstaff_incidents_staff_operator_key_idx on public.hlstaff_incidents(staff_operator_key);
create index if not exists hlstaff_invites_operator_key_idx on public.hlstaff_invites(operator_key);
create index if not exists hlstaff_invites_used_by_idx on public.hlstaff_invites(used_by);
create index if not exists hlstaff_location_events_staff_id_idx on public.hlstaff_location_events(staff_id);
create index if not exists hlstaff_payment_attribution_attributed_by_idx on public.hlstaff_payment_attribution(attributed_by);
create index if not exists hlstaff_payment_attribution_conversation_id_idx on public.hlstaff_payment_attribution(conversation_id);
create index if not exists hlstaff_shifts_site_id_idx on public.hlstaff_shifts(site_id);

drop policy if exists hlstaff_profiles_read on public.hlstaff_profiles;
create policy hlstaff_profiles_read on public.hlstaff_profiles
for select to authenticated
using (id=(select auth.uid()) or (select public.hlstaff_is_manager()));

drop policy if exists hlstaff_schedules_read on public.hlstaff_schedules;
create policy hlstaff_schedules_read on public.hlstaff_schedules
for select to authenticated
using (staff_id=(select auth.uid()) or (select public.hlstaff_is_manager()));

drop policy if exists hlstaff_shifts_read on public.hlstaff_shifts;
create policy hlstaff_shifts_read on public.hlstaff_shifts
for select to authenticated
using (staff_id=(select auth.uid()) or (select public.hlstaff_is_manager()));

drop policy if exists hlstaff_location_read on public.hlstaff_location_events;
create policy hlstaff_location_read on public.hlstaff_location_events
for select to authenticated
using (staff_id=(select auth.uid()) or (select public.hlstaff_is_manager()));

drop policy if exists hlstaff_cash_read on public.hlstaff_cash_payments;
create policy hlstaff_cash_read on public.hlstaff_cash_payments
for select to authenticated
using (captured_by=(select auth.uid()) or (select public.hlstaff_is_manager()));

drop policy if exists hlstaff_comp_read on public.hlstaff_compensation_rules;
create policy hlstaff_comp_read on public.hlstaff_compensation_rules
for select to authenticated
using (
  (select public.hlstaff_is_manager())
  or operator_key=(select p.operator_key from public.hlstaff_profiles p where p.id=(select auth.uid()))
);

drop policy if exists hlstaff_attribution_manager on public.hlstaff_payment_attribution;
create policy hlstaff_attribution_manager on public.hlstaff_payment_attribution
for all to authenticated
using ((select public.hlstaff_is_manager()))
with check ((select public.hlstaff_is_manager()));

drop policy if exists hlstaff_closures_manager on public.hlstaff_cash_closures;
create policy hlstaff_closures_manager on public.hlstaff_cash_closures
for all to authenticated
using ((select public.hlstaff_is_manager()))
with check ((select public.hlstaff_is_manager()));

drop policy if exists hlstaff_incidents_manager on public.hlstaff_incidents;
create policy hlstaff_incidents_manager on public.hlstaff_incidents
for all to authenticated
using ((select public.hlstaff_is_manager()))
with check ((select public.hlstaff_is_manager()));
