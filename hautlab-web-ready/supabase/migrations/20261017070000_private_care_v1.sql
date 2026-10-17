-- HAUTLAB Private Care v1: dedicated clinical records, never coupled to the public HLP planning code.
-- Identifiable data is server-only; authenticated/anon Supabase roles have no table grants.

create table public.private_care_patients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (
    email = lower(btrim(email))
    and length(email) between 5 and 254
    and email like '%@%'
  ),
  display_name text not null check (char_length(display_name) between 1 and 120),
  status text not null default 'active' check (status in ('active','suspended')),
  consent_version text,
  consent_at timestamptz,
  consent_actor_clerk_id text,
  created_by_clerk_id text not null,
  updated_by_clerk_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((consent_version is null and consent_at is null) or (consent_version is not null and consent_at is not null))
);

create table public.private_care_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.private_care_patients(id) on delete restrict,
  title text not null check (char_length(title) between 2 and 140),
  summary text not null check (char_length(summary) between 4 and 1200),
  phases jsonb not null check (jsonb_typeof(phases) = 'array' and jsonb_array_length(phases) between 1 and 5),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  revision integer not null default 1 check (revision > 0),
  created_by_clerk_id text not null,
  reviewed_by_clerk_id text,
  published_at timestamptz,
  updated_by_clerk_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status != 'published' or (reviewed_by_clerk_id is not null and published_at is not null))
);

create index private_care_plans_patient_status_idx
  on public.private_care_plans(patient_id, status, published_at desc);

create table public.private_care_read_receipts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.private_care_patients(id) on delete restrict,
  plan_id uuid not null references public.private_care_plans(id) on delete restrict,
  item_key text not null check (item_key ~ '^phase-[0-4]-item-[0-9]{1,2}$'),
  actor_clerk_id text not null,
  read_at timestamptz not null default now(),
  unique (patient_id, plan_id, item_key)
);

create table public.private_care_followups (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.private_care_patients(id) on delete restrict,
  plan_id uuid not null references public.private_care_plans(id) on delete restrict,
  reported_state text not null check (reported_state in ('better','same','worse')),
  message text not null check (char_length(message) between 3 and 1000),
  actor_clerk_id text not null,
  review_status text not null default 'new' check (review_status in ('new','reviewed')),
  reviewed_by_clerk_id text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index private_care_followups_patient_time_idx
  on public.private_care_followups(patient_id, created_at desc);

create table public.private_care_audit (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.private_care_patients(id) on delete restrict,
  plan_id uuid,
  action text not null,
  actor_clerk_id text,
  recorded_at timestamptz not null default now()
);

-- Durable audit entries are created by the database, not by a second best-effort HTTP request.
create function public.private_care_audit_change()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_patient_id uuid;
  v_plan_id uuid;
  v_actor text;
begin
  if TG_TABLE_NAME = 'private_care_patients' then
    v_patient_id := new.id;
    v_plan_id := null;
    v_actor := case when TG_OP = 'INSERT' then new.created_by_clerk_id
                    when old.consent_at is distinct from new.consent_at then new.consent_actor_clerk_id
                    else new.updated_by_clerk_id end;
  elsif TG_TABLE_NAME = 'private_care_plans' then
    v_patient_id := new.patient_id;
    v_plan_id := new.id;
    v_actor := case when TG_OP = 'INSERT' then new.created_by_clerk_id
                    when old.status is distinct from new.status and new.status = 'published' then new.reviewed_by_clerk_id
                    else new.updated_by_clerk_id end;
  else
    v_patient_id := new.patient_id;
    v_plan_id := new.plan_id;
    v_actor := new.actor_clerk_id;
  end if;
  insert into public.private_care_audit(patient_id, plan_id, action, actor_clerk_id)
    values (v_patient_id, v_plan_id, TG_TABLE_NAME || ':' || lower(TG_OP), v_actor);
  return new;
end;
$$;

create trigger private_care_patient_audit after insert or update on public.private_care_patients
  for each row execute function public.private_care_audit_change();
create trigger private_care_plan_audit after insert or update on public.private_care_plans
  for each row execute function public.private_care_audit_change();
create trigger private_care_read_audit after insert on public.private_care_read_receipts
  for each row execute function public.private_care_audit_change();
create trigger private_care_followup_audit after insert on public.private_care_followups
  for each row execute function public.private_care_audit_change();

-- Clinical records never leave through Supabase's browser roles.
alter table public.private_care_patients enable row level security;
alter table public.private_care_plans enable row level security;
alter table public.private_care_read_receipts enable row level security;
alter table public.private_care_followups enable row level security;
alter table public.private_care_audit enable row level security;

revoke all on public.private_care_patients, public.private_care_plans,
  public.private_care_read_receipts, public.private_care_followups,
  public.private_care_audit from public, anon, authenticated;

grant select, insert, update on public.private_care_patients to service_role;
grant select, insert, update on public.private_care_plans to service_role;
grant select, insert on public.private_care_read_receipts to service_role;
grant select, insert, update on public.private_care_followups to service_role;
grant select on public.private_care_audit to service_role;

revoke all on function public.private_care_audit_change() from public, anon, authenticated;

comment on table public.private_care_patients is 'Restricted clinical program enrollment. Authorized only via verified Clerk identity on server.';
comment on table public.private_care_plans is 'Clinician-authored clinical guidance. Drafts never shown to patients.';
comment on table public.private_care_read_receipts is 'Acknowledgement of reading, never proof of adherence.';
comment on table public.private_care_followups is 'Sensitive patient reported outcome, review required by clinician.';
