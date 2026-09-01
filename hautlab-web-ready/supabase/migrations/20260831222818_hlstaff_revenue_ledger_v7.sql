create or replace view public.hlstaff_revenue_ledger_monthly as
with cash as (
  select date_trunc('month', paid_at at time zone 'America/Merida')::date as month,
         revenue_owner,
         'cash'::text as payment_channel,
         count(*)::bigint as payments,
         sum(amount)::numeric(14,2) as gross_revenue,
         sum(commission_amount)::numeric(14,2) as commission
  from public.hlstaff_cash_payments
  group by 1,2
), mp as (
  select date_trunc('month', coalesce(p.date_approved,p.date_created) at time zone 'America/Merida')::date as month,
         coalesce(a.revenue_owner,'unassigned') as revenue_owner,
         'mercado_pago'::text as payment_channel,
         count(*)::bigint as payments,
         sum(greatest(p.transaction_amount-p.refunded_amount,0))::numeric(14,2) as gross_revenue,
         sum(round(greatest(p.transaction_amount-p.refunded_amount,0)*coalesce(a.commission_rate,0),2))::numeric(14,2) as commission
  from public.mp_finance_payments p
  left join public.hlstaff_payment_attribution a
    on a.provider='mercado_pago' and a.provider_payment_id=p.payment_id
  where p.status='approved'
  group by 1,2
)
select * from cash
union all
select * from mp;

revoke all on public.hlstaff_revenue_ledger_monthly from anon;
grant select on public.hlstaff_revenue_ledger_monthly to authenticated, service_role;
