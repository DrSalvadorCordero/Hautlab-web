alter view public.hlstaff_revenue_summary_monthly set (security_invoker = true);
alter view public.hlstaff_revenue_ledger_monthly set (security_invoker = true);

revoke all on public.hlstaff_revenue_summary_monthly from anon, authenticated;
revoke all on public.hlstaff_revenue_ledger_monthly from anon, authenticated;
grant select on public.hlstaff_revenue_summary_monthly to service_role;
grant select on public.hlstaff_revenue_ledger_monthly to service_role;

revoke execute on function public.hlstaff_haversine_m(double precision,double precision,double precision,double precision) from public, anon, authenticated;
revoke execute on function public.hlstaff_check_in(uuid,double precision,double precision,double precision,text) from public, anon;
revoke execute on function public.hlstaff_check_out(double precision,double precision,double precision) from public, anon;
revoke execute on function public.hlstaff_log_location(uuid,text,double precision,double precision,double precision) from public, anon;
revoke execute on function public.hlstaff_claim_profile(text) from public, anon;
revoke execute on function public.hlstaff_register_cash(text,numeric,text,text,text,text,uuid,text) from public, anon;
revoke execute on function public.hlstaff_calibrate_site(uuid,double precision,double precision,integer) from public, anon;
revoke execute on function public.hlstaff_monthly_snapshot(date,text) from public, anon;
revoke execute on function public.hlstaff_record_location_consent() from public, anon;
revoke execute on function public.hlstaff_is_manager() from public, anon;
revoke execute on function public.hlstaff_try_auto_attribute_mp() from public, anon, authenticated;

grant execute on function public.hlstaff_check_in(uuid,double precision,double precision,double precision,text) to authenticated;
grant execute on function public.hlstaff_check_out(double precision,double precision,double precision) to authenticated;
grant execute on function public.hlstaff_log_location(uuid,text,double precision,double precision,double precision) to authenticated;
grant execute on function public.hlstaff_claim_profile(text) to authenticated;
grant execute on function public.hlstaff_register_cash(text,numeric,text,text,text,text,uuid,text) to authenticated;
grant execute on function public.hlstaff_calibrate_site(uuid,double precision,double precision,integer) to authenticated;
grant execute on function public.hlstaff_monthly_snapshot(date,text) to authenticated, service_role;
grant execute on function public.hlstaff_record_location_consent() to authenticated;
grant execute on function public.hlstaff_is_manager() to authenticated;

alter function public.hlstaff_haversine_m(double precision,double precision,double precision,double precision) set search_path=public,pg_temp;
