-- Keep the clinician's working notes separate from text delivered to patients.
alter table public.private_care_prepared_plans
  add column if not exists internal_notes text not null default '';
comment on column public.private_care_prepared_plans.internal_notes is
  'Owner-only clinician notes. Never copied into private_care_plans or exposed in patient snapshots.';
alter table public.private_care_prepared_plans
  add constraint private_care_internal_notes_maximum
  check (char_length(internal_notes) <= 10000);
