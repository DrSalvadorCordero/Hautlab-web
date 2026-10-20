-- Version the RPC already called by every automatic orchestrator send path.
-- No message bodies or phone numbers are stored in this ledger.
CREATE TABLE IF NOT EXISTS public.wa_auto_reply_claims (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 conversation_id uuid NOT NULL REFERENCES public.wa_conversations(id) ON DELETE CASCADE,
 inbound_meta_message_id text NOT NULL,
 claimed_at timestamptz NOT NULL DEFAULT now(),
 sent_at timestamptz,
 status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','sent','failed')),
 outbound_meta_message_id text,
 UNIQUE(conversation_id,inbound_meta_message_id)
);
ALTER TABLE public.wa_auto_reply_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.wa_auto_reply_claims FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.wa_auto_reply_claims TO service_role;

CREATE OR REPLACE FUNCTION public.wa_claim_auto_reply(p_phone text, p_meta_message_id text)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO pg_catalog, public AS $function$
DECLARE
 v_conversation uuid;
 v_latest_meta text;
 v_id uuid;
BEGIN
 IF nullif(btrim(p_meta_message_id),'') IS NULL THEN RETURN NULL; END IF;
 SELECT c.id INTO v_conversation FROM public.wa_conversations c
 WHERE c.phone=p_phone AND c.bot_paused=false FOR UPDATE;
 IF v_conversation IS NULL THEN RETURN NULL; END IF;
 SELECT m.meta_message_id INTO v_latest_meta FROM public.wa_messages m
 WHERE m.conversation_id=v_conversation AND m.direction='inbound'
 ORDER BY m.created_at DESC,m.id DESC LIMIT 1;
 IF v_latest_meta IS DISTINCT FROM p_meta_message_id THEN RETURN NULL; END IF;
 -- Do not suppress a DISTINCT inbound based on elapsed time or a previous
 -- response's sent_at: that response may not include the newer patient's text.
 -- Burst coalescing happens before generation in the orchestrator.
 INSERT INTO public.wa_auto_reply_claims(conversation_id,inbound_meta_message_id)
 VALUES(v_conversation,p_meta_message_id)
 ON CONFLICT(conversation_id,inbound_meta_message_id) DO NOTHING RETURNING id INTO v_id;
 RETURN v_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.wa_claim_auto_reply(text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wa_claim_auto_reply(text,text) TO service_role;
