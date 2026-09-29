-- P3 Nimbo external-change synchronization state.
-- Nimbo remains the scheduling source of truth; HAUTLAB stores only an operational mirror.

alter table public.nimbo_integration_config
  add column if not exists last_schedule_sync_at timestamptz,
  add column if not exists last_schedule_sync_status text
    check (last_schedule_sync_status is null or last_schedule_sync_status in ('ok','partial','error')),
  add column if not exists last_schedule_sync_error text;

alter table public.wa_conversations
  add column if not exists nimbo_last_synced_at timestamptz,
  add column if not exists nimbo_sync_status text
    check (
      nimbo_sync_status is null
      or nimbo_sync_status in (
        'synced','changed','cancelled','completed','missing','conflict','error'
      )
    ),
  add column if not exists nimbo_sync_error text,
  add column if not exists nimbo_schedule_ends_at timestamptz;

create index if not exists wa_conversations_nimbo_sync_due_idx
  on public.wa_conversations (nimbo_last_synced_at, appointment_datetime)
  where nimbo_schedule_id is not null
    and appointment_status in ('confirmed','pending_confirmation');
