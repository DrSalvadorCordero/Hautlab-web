-- HAUTLAB Private Care: verified self-registration with owner approval.
-- An authenticated account alone is not an approved clinical patient.
alter table public.private_care_patients
  add column if not exists clerk_user_id text unique;
alter table public.private_care_patients
  add constraint private_care_patients_clerk_user_id_nonempty
  check (clerk_user_id is null or length(clerk_user_id) between 3 and 255);

create table public.private_care_access_requests (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique check (length(clerk_user_id) between 3 and 255),
  email text not null unique check (
    email = lower(btrim(email)) and length(email) between 5 and 254 and email like '%@%'
  ),
  display_name text not null check (length(display_name) between 2 and 120),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by_clerk_id text,
  patient_id uuid references public.private_care_patients(id) on delete restrict,
  check (status <> 'approved' or (reviewed_at is not null and reviewed_by_clerk_id is not null and patient_id is not null))
);
create index private_care_access_requests_queue_idx
  on public.private_care_access_requests(status, requested_at desc);

alter table public.private_care_access_requests enable row level security;
revoke all on public.private_care_access_requests from public, anon, authenticated;
grant select, insert, update on public.private_care_access_requests to service_role;

create function public.private_care_approve_access_request(p_request_id uuid, p_actor text)
returns void
language plpgsql security definer
set search_path = public, pg_temp
as $private_care_approve$
declare
  v_request public.private_care_access_requests%rowtype;
  v_patient_id uuid;
  v_existing_clerk_id text;
  v_status text;
begin
  if p_actor is null or length(p_actor) < 3 then
    raise exception 'missing_clinician_identity';
  end if;
  select * into v_request from public.private_care_access_requests
    where id = p_request_id and status = 'pending' for update;
  if not found then raise exception 'request_not_pending'; end if;

  select id, clerk_user_id, status into v_patient_id, v_existing_clerk_id, v_status
    from public.private_care_patients
    where email = v_request.email for update;
  if found then
    if v_status <> 'active' then raise exception 'existing_patient_suspended'; end if;
    if v_existing_clerk_id is not null and v_existing_clerk_id <> v_request.clerk_user_id then
      raise exception 'patient_already_bound_to_another_account';
    end if;
    update public.private_care_patients
      set clerk_user_id = v_request.clerk_user_id, updated_by_clerk_id = p_actor,
          updated_at = now()
      where id = v_patient_id;
  else
    insert into public.private_care_patients
      (email, display_name, status, clerk_user_id, created_by_clerk_id)
    values (v_request.email, v_request.display_name, 'active',
            v_request.clerk_user_id, p_actor)
    returning id into v_patient_id;
  end if;

  update public.private_care_access_requests
    set status = 'approved', patient_id = v_patient_id,
        reviewed_by_clerk_id = p_actor, reviewed_at = now()
    where id = v_request.id and status = 'pending';
end;
$private_care_approve$;

revoke all on function public.private_care_approve_access_request(uuid,text) from public, anon, authenticated;
grant execute on function public.private_care_approve_access_request(uuid,text) to service_role;

comment on table public.private_care_access_requests is
'Verified identity enrollment requests. Clinical content remains inaccessible until owner approval.';
