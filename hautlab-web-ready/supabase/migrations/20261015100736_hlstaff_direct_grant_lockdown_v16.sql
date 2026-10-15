-- Reduce direct table privileges for HAUTLAB Staff.
-- Signed-in staff use RLS-filtered reads and reviewed SECURITY DEFINER RPCs for writes.

do $block$
declare
  t text;
  hlstaff_tables constant text[] := array[
    'hlstaff_cash_closures',
    'hlstaff_cash_payments',
    'hlstaff_compensation_rules',
    'hlstaff_incidents',
    'hlstaff_invites',
    'hlstaff_location_events',
    'hlstaff_payment_attribution',
    'hlstaff_profiles',
    'hlstaff_schedules',
    'hlstaff_shifts',
    'hlstaff_sites'
  ];
begin
  foreach t in array hlstaff_tables loop
    execute format(
      'revoke insert, update, delete, truncate, references, trigger on table public.%I from anon, authenticated',
      t
    );
    execute format(
      'revoke select on table public.%I from anon',
      t
    );
  end loop;
end;
$block$;

grant select on table public.hlstaff_profiles to authenticated;
grant select on table public.hlstaff_sites to authenticated;
grant select on table public.hlstaff_shifts to authenticated;
grant select on table public.hlstaff_location_events to authenticated;
grant select on table public.hlstaff_cash_payments to authenticated;
grant select on table public.hlstaff_cash_closures to authenticated;
grant select on table public.hlstaff_compensation_rules to authenticated;
grant select on table public.hlstaff_incidents to authenticated;
