-- Prevent administrative status annotations or draft wording from being released
-- via either the prepared-plan path or the normal clinician-published plan path.
-- Clinical working notes are stored separately in prepared_plans.internal_notes.
alter table public.private_care_prepared_plans
  add constraint private_care_prepared_patient_copy_no_internal_markers
  check (status <> 'approved' or (
    (title || ' ' || summary || ' ' || phases::text)
      !~* '(borrador|notas? internas?|pendiente de revisi[oó]n m[eé]dica)'
  ));

alter table public.private_care_plans
  add constraint private_care_published_patient_copy_no_internal_markers
  check (status <> 'published' or (
    (title || ' ' || summary || ' ' || phases::text)
      !~* '(borrador|notas? internas?|pendiente de revisi[oó]n m[eé]dica)'
  ));
