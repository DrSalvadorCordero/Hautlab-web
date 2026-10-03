alter table public.wa_conversations add column if not exists booking_gender text check (booking_gender in ('f', 'm', 'o'));
