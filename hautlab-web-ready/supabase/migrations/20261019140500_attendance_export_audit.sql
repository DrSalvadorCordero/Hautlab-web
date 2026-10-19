-- Record each authorized attendance export before returning a CSV response.
-- Metadata only: no CSV contents, patient data, staff rows, IP address or user agent.
create table if not exists public.attendance_export_audit (
  id uuid primary key default gen_random_uuid(),
  actor_user_id text not null check (char_length(btrim(actor_user_id)) between 3 and 255),
  range_from timestamptz not null,
  range_to timestamptz not null,
  exported_profile_count integer not null check (exported_profile_count between 0 and 10000),
  exported_shift_count integer not null check (exported_shift_count between 0 and 2000),
  created_at timestamptz not null default now(),
  check (range_to > range_from)
);

create index if not exists attendance_export_audit_created_idx
  on public.attendance_export_audit (created_at desc);

alter table public.attendance_export_audit enable row level security;
revoke all on public.attendance_export_audit from public, anon, authenticated;
grant select, insert on public.attendance_export_audit to service_role;

comment on table public.attendance_export_audit is
  'Immutable generation log for restricted attendance CSV exports; stores actor, range and counts only.';
