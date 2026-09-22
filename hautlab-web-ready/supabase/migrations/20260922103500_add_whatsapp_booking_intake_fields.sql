alter table public.wa_conversations
  add column if not exists booking_full_name text,
  add column if not exists booking_birth_date date,
  add column if not exists booking_email text,
  add column if not exists booking_whatsapp text,
  add column if not exists booking_reason text,
  add column if not exists booking_intake_completed_at timestamptz;

create index if not exists wa_conversations_booking_email_idx
  on public.wa_conversations (lower(booking_email))
  where booking_email is not null;
