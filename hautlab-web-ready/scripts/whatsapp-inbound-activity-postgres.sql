-- Synthetic fixture for isolated PostgreSQL 17 only. NEVER run against HAUTLAB production.
\set ON_ERROR_STOP on
create table public.wa_conversations (
  id bigint generated always as identity primary key,
  last_message_at timestamptz,
  last_patient_message_at timestamptz,
  updated_at timestamptz not null default now()
);
create table public.wa_messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references public.wa_conversations(id),
  meta_message_id text not null unique,
  direction text not null,
  body text,
  created_at timestamptz not null default now()
);
\ir ../supabase/migrations/20261021065000_fix_wa_inbound_timestamps.sql
create trigger trg_touch_wa_conversation
after insert on public.wa_messages
for each row execute function public.touch_wa_conversation();

insert into public.wa_conversations default values;
insert into public.wa_messages(conversation_id,meta_message_id,direction,body,created_at)
values (1,'synthetic-1','inbound','first', '2026-10-21T10:00:00Z');
do $$
begin
 if (select last_patient_message_at from public.wa_conversations where id=1)
    is distinct from '2026-10-21T10:00:00Z'::timestamptz then
   raise exception 'first inbound message was not recorded';
 end if;
end $$;

insert into public.wa_messages(conversation_id,meta_message_id,direction,body,created_at)
values (1,'synthetic-out','outbound','reply','2026-10-21T10:01:00Z');
do $$
begin
 if (select last_patient_message_at from public.wa_conversations where id=1)
    is distinct from '2026-10-21T10:00:00Z'::timestamptz then
   raise exception 'outbound reply moved inbound patient timestamp';
 end if;
 if (select last_message_at from public.wa_conversations where id=1)
    is distinct from '2026-10-21T10:01:00Z'::timestamptz then
   raise exception 'outbound reply did not update general activity';
 end if;
end $$;

-- Retried webhook with the same Meta ID: no INSERT, no trigger, no fake activity.
insert into public.wa_messages(conversation_id,meta_message_id,direction,body,created_at)
values (1,'synthetic-1','inbound','first','2026-10-21T10:02:00Z')
on conflict (meta_message_id) do nothing;

-- A distinct real follow-up must survive dedup, even with identical content.
insert into public.wa_messages(conversation_id,meta_message_id,direction,body,created_at)
values (1,'synthetic-2','inbound','first','2026-10-21T10:03:00Z');
-- An older event delivered late must not regress the timestamp.
insert into public.wa_messages(conversation_id,meta_message_id,direction,body,created_at)
values (1,'synthetic-old','inbound','late arrival','2026-10-21T10:00:30Z');

do $$
begin
 if (select count(*) from public.wa_messages where meta_message_id='synthetic-1') <> 1 then
   raise exception 'duplicate inbound persisted';
 end if;
 if (select count(*) from public.wa_messages where direction='inbound') <> 3 then
   raise exception 'legitimate follow-up lost';
 end if;
 if (select last_patient_message_at from public.wa_conversations where id=1)
    is distinct from '2026-10-21T10:03:00Z'::timestamptz then
   raise exception 'last patient timestamp incorrect after duplicates or reordered events';
 end if;
 if (select last_message_at from public.wa_conversations where id=1)
    is distinct from '2026-10-21T10:03:00Z'::timestamptz then
   raise exception 'last general activity regressed';
 end if;
end $$;
