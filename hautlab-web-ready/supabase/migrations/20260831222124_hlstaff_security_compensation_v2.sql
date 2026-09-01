create table if not exists public.hlstaff_compensation_rules (
  operator_key text primary key references public.wa_operators(operator_key) on update cascade,
  base_monthly_salary numeric(12,2) not null default 0,
  standard_commission_rate numeric(6,5) not null default 0,
  reactivation_commission_rate numeric(6,5) not null default 0,
  max_monthly_bonus numeric(12,2) not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.hlstaff_compensation_rules(operator_key,base_monthly_salary,standard_commission_rate,reactivation_commission_rate,max_monthly_bonus)
values ('karen',12000,0.02,0.01,1500),('doctor',0,0,0,0)
on conflict (operator_key) do update set base_monthly_salary=excluded.base_monthly_salary,standard_commission_rate=excluded.standard_commission_rate,reactivation_commission_rate=excluded.reactivation_commission_rate,max_monthly_bonus=excluded.max_monthly_bonus,updated_at=now();

create table if not exists public.hlstaff_invites (
  id uuid primary key default gen_random_uuid(),
  operator_key text not null references public.wa_operators(operator_key) on update cascade,
  role text not null check (role in ('manager','staff')),
  code_hash text not null unique,
  expires_at timestamptz not null default (now()+interval '30 days'),
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- One-time production invite codes are intentionally not stored in source control.
-- Provision invite rows through a secure administrative path when onboarding a new install.

create or replace function public.hlstaff_claim_profile(p_code text)
returns public.hlstaff_profiles
language plpgsql security definer set search_path=public as $$
declare
 v_inv public.hlstaff_invites;
 v_name text;
 v_prof public.hlstaff_profiles;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into v_inv from public.hlstaff_invites where code_hash=encode(digest(upper(trim(p_code)),'sha256'),'hex') and used_at is null and expires_at>now() for update;
 if v_inv.id is null then raise exception 'INVALID_OR_EXPIRED_INVITE'; end if;
 if exists(select 1 from public.hlstaff_profiles where id=auth.uid()) then raise exception 'PROFILE_ALREADY_EXISTS'; end if;
 if exists(select 1 from public.hlstaff_profiles where operator_key=v_inv.operator_key) then raise exception 'OPERATOR_ALREADY_CLAIMED'; end if;
 select display_name into v_name from public.wa_operators where operator_key=v_inv.operator_key;
 insert into public.hlstaff_profiles(id,operator_key,display_name,role,base_monthly_salary,commission_rate,reactivation_rate)
 select auth.uid(),v_inv.operator_key,coalesce(v_name,v_inv.operator_key),v_inv.role,c.base_monthly_salary,c.standard_commission_rate,c.reactivation_commission_rate
 from public.hlstaff_compensation_rules c where c.operator_key=v_inv.operator_key
 returning * into v_prof;
 update public.hlstaff_invites set used_at=now(),used_by=auth.uid() where id=v_inv.id;
 if v_inv.operator_key='karen' then
   insert into public.hlstaff_schedules(staff_id,weekday,scheduled_start,scheduled_end,grace_minutes,active)
   select auth.uid(),d,'14:00'::time,'20:00'::time,5,true from generate_series(1,5) d
   on conflict (staff_id,weekday) do update set scheduled_start=excluded.scheduled_start,scheduled_end=excluded.scheduled_end,grace_minutes=excluded.grace_minutes,active=true;
 end if;
 return v_prof;
end;
$$;

drop policy if exists hlstaff_cash_insert on public.hlstaff_cash_payments;

create or replace function public.hlstaff_register_cash(
 p_patient_name text,
 p_amount numeric,
 p_concept text,
 p_revenue_owner text,
 p_commission_type text default 'none',
 p_patient_phone text default null,
 p_conversation_id uuid default null,
 p_notes text default null
)
returns public.hlstaff_cash_payments
language plpgsql security definer set search_path=public as $$
declare
 v_staff public.hlstaff_profiles;
 v_rule public.hlstaff_compensation_rules;
 v_rate numeric(6,5):=0;
 v_row public.hlstaff_cash_payments;
begin
 select * into v_staff from public.hlstaff_profiles where id=auth.uid() and active=true;
 if v_staff.id is null then raise exception 'STAFF_PROFILE_NOT_FOUND'; end if;
 if p_amount<=0 then raise exception 'INVALID_AMOUNT'; end if;
 if p_revenue_owner not in ('karen','doctor','organic','referral') then raise exception 'INVALID_REVENUE_OWNER'; end if;
 if p_commission_type not in ('none','standard','reactivation') then raise exception 'INVALID_COMMISSION_TYPE'; end if;
 select * into v_rule from public.hlstaff_compensation_rules where operator_key=p_revenue_owner and active=true;
 if p_revenue_owner='karen' and v_rule.operator_key is not null then
   if p_commission_type='standard' then v_rate:=v_rule.standard_commission_rate;
   elsif p_commission_type='reactivation' then v_rate:=v_rule.reactivation_commission_rate;
   else v_rate:=0; end if;
 end if;
 insert into public.hlstaff_cash_payments(patient_name,patient_phone,conversation_id,amount,concept,revenue_owner,commission_type,commission_rate,captured_by,notes)
 values(trim(p_patient_name),p_patient_phone,p_conversation_id,p_amount,trim(p_concept),p_revenue_owner,p_commission_type,v_rate,v_staff.id,p_notes)
 returning * into v_row;
 return v_row;
end;
$$;

create or replace function public.hlstaff_calibrate_site(p_site_id uuid,p_lat double precision,p_lng double precision,p_radius_m integer default 100)
returns public.hlstaff_sites
language plpgsql security definer set search_path=public as $$
declare v_site public.hlstaff_sites;
begin
 if not exists(select 1 from public.hlstaff_profiles where id=auth.uid() and role='manager' and active=true) then raise exception 'MANAGER_REQUIRED'; end if;
 if p_radius_m<25 or p_radius_m>1000 then raise exception 'INVALID_RADIUS'; end if;
 update public.hlstaff_sites set latitude=p_lat,longitude=p_lng,radius_m=p_radius_m,updated_at=now() where id=p_site_id and active=true returning * into v_site;
 if v_site.id is null then raise exception 'SITE_NOT_FOUND'; end if;
 return v_site;
end;
$$;

alter table public.hlstaff_compensation_rules enable row level security;
alter table public.hlstaff_invites enable row level security;
create policy hlstaff_comp_read_manager on public.hlstaff_compensation_rules for select to authenticated using (exists(select 1 from public.hlstaff_profiles m where m.id=auth.uid() and m.role='manager') or operator_key=(select operator_key from public.hlstaff_profiles s where s.id=auth.uid()));

grant execute on function public.hlstaff_claim_profile(text) to authenticated;
grant execute on function public.hlstaff_register_cash(text,numeric,text,text,text,text,uuid,text) to authenticated;
grant execute on function public.hlstaff_calibrate_site(uuid,double precision,double precision,integer) to authenticated;
