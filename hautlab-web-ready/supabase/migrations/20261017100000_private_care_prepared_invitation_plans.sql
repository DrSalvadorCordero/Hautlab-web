-- HAUTLAB Private Care: clinician-reviewed plan drafts staged against a *specific*
-- unused invitation. No emails or diagnoses are stored in Git.
create table public.private_care_prepared_plans (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique
    references public.private_care_invitations(id) on delete restrict,
  title text not null check (char_length(title) between 2 and 140),
  summary text not null check (char_length(summary) between 4 and 1200),
  phases jsonb not null check (jsonb_typeof(phases)='array'
    and jsonb_array_length(phases) between 1 and 5),
  status text not null default 'draft' check (status in ('draft','approved')),
  source_label text not null default 'clinician_review_required',
  approved_by_clerk_id text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'draft' and approved_by_clerk_id is null and approved_at is null)
    or (status = 'approved' and approved_by_clerk_id is not null and approved_at is not null)
  )
);

alter table public.private_care_prepared_plans enable row level security;
revoke all on public.private_care_prepared_plans from public, anon, authenticated;
grant select, insert, update on public.private_care_prepared_plans to service_role;

-- No patient-visible records before activation. Once the verified invitation is
-- redeemed, atomically copy the prepared plan into the new patient's account.
-- Unreviewed plans remain drafts; only explicitly clinician-approved plans publish.
create function public.private_care_attach_prepared_plan()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $attach_private_care$
declare
  v_plan public.private_care_prepared_plans%rowtype;
begin
  if old.redeemed_at is null and new.redeemed_at is not null and new.patient_id is not null then
    select * into v_plan from public.private_care_prepared_plans
      where invitation_id = new.id for update;
    if found then
      insert into public.private_care_plans
        (patient_id, title, summary, phases, status, revision, created_by_clerk_id,
         reviewed_by_clerk_id, published_at)
      values
        (new.patient_id, v_plan.title, v_plan.summary, v_plan.phases,
         case when v_plan.status = 'approved' then 'published' else 'draft' end,
         1,
         'private_care_prepared_plan_import',
         case when v_plan.status = 'approved' then v_plan.approved_by_clerk_id else null end,
         case when v_plan.status = 'approved' then now() else null end);
    end if;
  end if;
  return new;
end;
$attach_private_care$;
revoke all on function public.private_care_attach_prepared_plan() from public, anon, authenticated;
create trigger private_care_attach_plan_on_invitation
after update of redeemed_at on public.private_care_invitations
for each row execute function public.private_care_attach_prepared_plan();

comment on table public.private_care_prepared_plans is
'Clinical draft staged only for a unique verified-channel invitation. Staged notes are not visible to patients until redeemed; clinician must approve to publish.';
