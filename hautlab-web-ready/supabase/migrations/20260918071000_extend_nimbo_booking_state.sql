alter table public.wa_conversations
  add column if not exists nimbo_pending_slot timestamptz,
  add column if not exists nimbo_pending_cause text;
