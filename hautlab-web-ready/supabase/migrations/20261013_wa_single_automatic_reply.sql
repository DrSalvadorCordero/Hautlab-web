-- Reserve exactly one automatic WhatsApp reply per inbound turn, across Vercel workers.
-- Contains only Meta message identifiers, never patient text or phone numbers.
CREATE TABLE IF NOT EXISTS public.wa_outbound_reply_claims (
  conversation_id uuid NOT NULL REFERENCES public.wa_conversations(id) ON DELETE CASCADE,
  inbound_meta_message_id text NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT wa_outbound_reply_claims_pkey PRIMARY KEY (conversation_id, inbound_meta_message_id)
);

CREATE INDEX IF NOT EXISTS wa_outbound_reply_claims_recent_idx
  ON public.wa_outbound_reply_claims (conversation_id, claimed_at DESC);

ALTER TABLE public.wa_outbound_reply_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.wa_outbound_reply_claims FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.wa_outbound_reply_claims TO service_role;

CREATE OR REPLACE FUNCTION public.wa_claim_single_automatic_reply(
  p_conversation_id uuid,
  p_inbound_meta_message_id text
)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO pg_catalog, public
AS $function$
DECLARE
  v_conversation_id uuid;
  v_latest_meta_message_id text;
  v_inserted_id uuid;
BEGIN
  IF p_conversation_id IS NULL OR nullif(btrim(p_inbound_meta_message_id), '') IS NULL THEN
    RETURN 'invalid';
  END IF;

  -- Row lock serializes the check AND reservation for every worker.
  SELECT id INTO v_conversation_id
    FROM public.wa_conversations
   WHERE id = p_conversation_id
   FOR UPDATE;
  IF NOT FOUND THEN RETURN 'missing'; END IF;

  SELECT meta_message_id INTO v_latest_meta_message_id
    FROM public.wa_messages
   WHERE conversation_id = p_conversation_id AND direction = 'inbound'
   ORDER BY created_at DESC, id DESC
   LIMIT 1;
  IF v_latest_meta_message_id IS DISTINCT FROM p_inbound_meta_message_id THEN
    RETURN 'stale';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.wa_outbound_reply_claims
     WHERE conversation_id = p_conversation_id
       AND inbound_meta_message_id = p_inbound_meta_message_id
  ) THEN
    RETURN 'already_claimed';
  END IF;

  -- Recent different inbound bubbles belong to the same patient burst.
  -- They are routed to a human, never silently discarded or double-answered.
  IF EXISTS (
    SELECT 1 FROM public.wa_outbound_reply_claims
     WHERE conversation_id = p_conversation_id
       AND claimed_at >= clock_timestamp() - interval '12 seconds'
  ) THEN
    RETURN 'recent_reply';
  END IF;

  INSERT INTO public.wa_outbound_reply_claims (conversation_id, inbound_meta_message_id)
  VALUES (p_conversation_id, p_inbound_meta_message_id)
  ON CONFLICT DO NOTHING
  RETURNING conversation_id INTO v_inserted_id;
  IF v_inserted_id IS NULL THEN RETURN 'already_claimed'; END IF;
  RETURN 'claimed';
END;
$function$;

REVOKE ALL ON FUNCTION public.wa_claim_single_automatic_reply(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wa_claim_single_automatic_reply(uuid, text) TO service_role;
