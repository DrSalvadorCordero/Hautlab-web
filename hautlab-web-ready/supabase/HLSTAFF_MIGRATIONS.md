# HAUTLAB Staff — Supabase production migrations

Production project: `mwnmopsybpvjnfnepadv`

The HAUTLAB Staff schema is live and is tracked by Supabase migration history. Applied in order on 2026-08-31:

1. `20260831222045_hlstaff_core_v1`
2. `20260831222124_hlstaff_security_compensation_v2`
3. `20260831222252_hlstaff_automation_metrics_v3`
4. `20260831222311_hlstaff_metrics_precision_fix_v4`
5. `20260831222711_hlstaff_security_hardening_v5`
6. `20260831222743_hlstaff_geofence_metrics_service_v6`
7. `20260831222818_hlstaff_revenue_ledger_v7`
8. `20260831223116_hlstaff_privilege_lockdown_v8`
9. `20260831223133_hlstaff_cash_close_v9`
10. `20260831223427_hlstaff_mp_attribution_v10`
11. `20260831223530_hlstaff_open_shift_rpc_v11`
12. `hlstaff_performance_indexes_v12` — indexes and RLS query-plan optimization

## Production objects

Tables:
- `hlstaff_sites`
- `hlstaff_profiles`
- `hlstaff_schedules`
- `hlstaff_shifts`
- `hlstaff_location_events`
- `hlstaff_cash_payments`
- `hlstaff_payment_attribution`
- `hlstaff_cash_closures`
- `hlstaff_compensation_rules`
- `hlstaff_invites`
- `hlstaff_incidents`

Views:
- `hlstaff_revenue_summary_monthly`
- `hlstaff_revenue_ledger_monthly`

RPCs used by iOS/admin:
- `hlstaff_claim_profile`
- `hlstaff_record_location_consent`
- `hlstaff_open_shift`
- `hlstaff_check_in`
- `hlstaff_check_out`
- `hlstaff_log_location`
- `hlstaff_register_cash`
- `hlstaff_close_cash`
- `hlstaff_calibrate_site`
- `hlstaff_monthly_snapshot`

## Compensation seeded

Karen:
- Base salary: MXN 12,000/month
- Standard attributed commission: 2%
- Reactivation commission: 1%
- KPI bonus cap: MXN 1,500/month
- Schedule: Monday–Friday, 14:00–20:00, 5 minute grace period (created when the Karen staff profile is claimed).

## Security

- Staff data uses Supabase Auth + RLS.
- Compensation rates are server-controlled; staff cannot edit their role/rate.
- Location consent is recorded separately.
- Location event RPCs require authentication and validate the caller against their own staff profile/shift.
- Manager RPCs validate manager role in the database.
- Financial aggregate views are service-role only for the Clerk-protected admin dashboard.
- Geofence monitoring is designed to stop at check-out.
- RLS policies use init-plan-friendly auth checks and staff foreign keys used by operational queries are indexed.

## Attribution

- WhatsApp-linked Mercado Pago payments inherit the conversation operator (`karen` / `doctor`).
- Public HAUTLAB Checkout Pro orders are classified as `organic`.
- Cash is recorded in the iOS app and explicitly attributed to Karen, Dr. Salvador, organic HAUTLAB, or referral.
- Unambiguous commissions are calculated on the server, not on-device.
