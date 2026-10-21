-- Fix false unattended-lead alerts caused by duplicate/reordered Meta webhooks.
-- The existing AFTER INSERT trigger fires only for an actually inserted message.
-- Do not backfill or overwrite historical patient records in this migration.
-- Release order: migrate the trigger first, then deploy the orchestrator change.
create or replace function public.touch_wa_conversation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  update public.wa_conversations
     set updated_at = now(),
         last_message_at = greatest(last_message_at, new.created_at),
         last_patient_message_at = case
           when new.direction = 'inbound' then greatest(last_patient_message_at, new.created_at)
           else last_patient_message_at
         end
   where id = new.conversation_id;
  return new;
end;
$function$;
