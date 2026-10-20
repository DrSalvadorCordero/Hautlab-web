-- Apply least privilege to direct reads.
-- Current iOS code reads only profile identity/consent and active site geometry.
-- All other staff data remains available only through reviewed RPCs/service-role paths.

revoke select on table public.hlstaff_cash_closures from authenticated;
revoke select on table public.hlstaff_cash_payments from authenticated;
revoke select on table public.hlstaff_compensation_rules from authenticated;
revoke select on table public.hlstaff_incidents from authenticated;
revoke select on table public.hlstaff_invites from authenticated;
revoke select on table public.hlstaff_location_events from authenticated;
revoke select on table public.hlstaff_payment_attribution from authenticated;
revoke select on table public.hlstaff_profiles from authenticated;
revoke select on table public.hlstaff_schedules from authenticated;
revoke select on table public.hlstaff_shifts from authenticated;
revoke select on table public.hlstaff_sites from authenticated;

grant select (
  id,
  operator_key,
  display_name,
  role,
  active,
  location_tracking_consent_at
) on table public.hlstaff_profiles to authenticated;

grant select (
  id,
  code,
  name,
  address,
  latitude,
  longitude,
  radius_m,
  active
) on table public.hlstaff_sites to authenticated;
