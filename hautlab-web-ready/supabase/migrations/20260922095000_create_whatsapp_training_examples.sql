-- Canonical training examples for the HAUTLAB WhatsApp brain.
-- Service-role only: examples become trusted system context, not public content.

create table if not exists public.wa_training_examples (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  scenario text not null,
  patient_message text not null,
  context_hint text,
  expected_intent text not null check (expected_intent in (
    'information','pricing','booking','follow_up','clinical',
    'adverse_event','complaint','human_request','unknown'
  )),
  expected_action text not null check (expected_action in ('reply','clarify','escalate')),
  expected_operator text not null check (expected_operator in ('doctor','karen','none')),
  ideal_response text not null,
  must_include text[] not null default '{}',
  must_avoid text[] not null default '{}',
  priority integer not null default 50 check (priority between 0 and 999),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wa_training_examples_active_priority_idx
  on public.wa_training_examples (active, priority desc, updated_at desc);

alter table public.wa_training_examples enable row level security;
revoke all on table public.wa_training_examples from public, anon, authenticated;
grant select, insert, update, delete on table public.wa_training_examples to service_role;

drop trigger if exists wa_training_examples_set_updated_at on public.wa_training_examples;
create trigger wa_training_examples_set_updated_at
before update on public.wa_training_examples
for each row execute function private.hautlab_set_updated_at();
