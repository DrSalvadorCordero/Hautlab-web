type AiMode = "off" | "manual" | "supervised" | "automatic";
type OperatorKey = "doctor" | "karen";

type ConversationRow = {
  id: string;
  phone: string;
  city: string | null;
  ai_mode: "inherit" | AiMode;
  bot_paused: boolean;
};

type SettingsRow = {
  global_mode: AiMode;
  emergency_stop: boolean;
};

type TriageDecision = {
  intent:
    | "information"
    | "pricing"
    | "booking"
    | "follow_up"
    | "clinical"
    | "adverse_event"
    | "complaint"
    | "human_request"
    | "unknown";
  action: "reply" | "clarify" | "escalate";
  operator: OperatorKey | "none";
  confidence: number;
  reply: string;
  reasonCode: string;
  model?: string;
};

type IncomingMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
};

type WebhookValue = {
  contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
  messages?: IncomingMessage[];
};

type WebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: WebhookValue;
    }>;
  }>;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("supabase_not_configured");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new Error(`supabase_error:${response.status}`);
  }
  return payload as T;
}

async function getSettings(): Promise<SettingsRow> {
  const rows = await supabaseRequest<SettingsRow[]>(
    "wa_settings?id=eq.global&select=global_mode,emergency_stop&limit=1",
  );
  return rows[0] ?? { global_mode: "supervised", emergency_stop: false };
}

async function upsertConversation(input: {
  phone: string;
  profileName?: string;
}): Promise<ConversationRow> {
  const now = new Date().toISOString();
  const rows = await supabaseRequest<ConversationRow[]>(
    "wa_conversations?on_conflict=phone&select=id,phone,city,ai_mode,bot_paused",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        phone: input.phone,
        ...(input.profileName ? { profile_name: input.profileName } : {}),
        last_message_at: now,
        last_patient_message_at: now,
        updated_at: now,
      }),
    },
  );
  const conversation = rows[0];
  if (!conversation) throw new Error("conversation_upsert_failed");
  return conversation;
}

async function insertInboundMessage(input: {
  conversationId: string;
  metaMessageId: string;
  body: string | null;
  messageType: string;
}): Promise<boolean> {
  const rows = await supabaseRequest<Array<{ id: string }>>(
    "wa_messages?on_conflict=meta_message_id&select=id",
    {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({
        conversation_id: input.conversationId,
        meta_message_id: input.metaMessageId,
        direction: "inbound",
        sender_type: "patient",
        body: input.body,
        message_type: input.messageType,
        status: "received",
      }),
    },
  );
  return rows.length > 0;
}

async function updateConversation(
  conversationId: string,
  body: Record<string, unknown>,
) {
  await supabaseRequest(
    `wa_conversations?id=eq.${encodeURIComponent(conversationId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
    },
  );
}

async function storeDraft(input: {
  conversationId: string;
  body: string;
  proposedBy: string;
}) {
  await supabaseRequest("wa_messages", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      conversation_id: input.conversationId,
      direction: "outbound",
      sender_type: "ai",
      body: input.body,
      message_type: "text",
      status: "draft",
      proposed_by: input.proposedBy,
    }),
  });
}

async function storeSentMessage(input: {
  conversationId: string;
  body: string;
  metaMessageId: string | null;
  senderType?: "ai" | "system";
  proposedBy?: string;
}) {
  await supabaseRequest("wa_messages", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      conversation_id: input.conversationId,
      meta_message_id: input.metaMessageId,
      direction: "outbound",
      sender_type: input.senderType ?? "ai",
      body: input.body,
      message_type: "text",
      status: "sent",
      proposed_by: input.proposedBy ?? null,
      sent_at: new Date().toISOString(),
    }),
  });
}

function effectiveMode(conversation: ConversationRow, settings: SettingsRow): AiMode {
  if (settings.emergency_stop) return "off";
  return conversation.ai_mode === "inherit"
    ? settings.global_mode
    : conversation.ai_mode;
}

function extractText(message: IncomingMessage): string | null {
  if (message.type === "text") return message.text?.body?.trim() || null;
  if (message.type === "button") return message.button?.text?.trim() || null;
  if (message.type === "interactive") {
    return (
      message.interactive?.button_reply?.title?.trim() ||
      message.interactive?.list_reply?.title?.trim() ||
      null
    );
  }
  return null;
}

async function callTriage(input: {
  origin: string;
  message: string;
  city: string | null;
  conversationId: string;
}): Promise<TriageDecision> {
  const internalKey = process.env.HAUTLAB_INTERNAL_API_KEY?.trim() ?? "";
  if (!internalKey) throw new Error("internal_api_key_not_configured");

  const city = input.city === "merida" || input.city === "cdmx" ? input.city : "unknown";
  const response = await fetch(`${input.origin}/api/ai/triage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hautlab-internal-key": internalKey,
    },
    body: JSON.stringify({
      message: input.message,
      city,
      conversationId: input.conversationId,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(18000),
  });

  if (!response.ok) throw new Error(`triage_failed:${response.status}`);
  return (await response.json()) as TriageDecision;
}

async function sendWhatsAppText(to: string, body: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() ?? "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v23.0";
  if (!accessToken || !phoneNumberId) throw new Error("whatsapp_send_not_configured");

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body, preview_url: false },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    },
  );

  const text = await response.text();
  let payload: { messages?: Array<{ id?: string }> } = {};
  if (text) {
    try {
      payload = JSON.parse(text) as { messages?: Array<{ id?: string }> };
    } catch {
      payload = {};
    }
  }
  if (!response.ok) throw new Error(`whatsapp_send_failed:${response.status}`);
  return payload.messages?.[0]?.id ?? null;
}

async function triggerEscalation(input: {
  origin: string;
  conversationId: string;
  operator: OperatorKey;
}) {
  const internalKey = process.env.HAUTLAB_INTERNAL_API_KEY?.trim() ?? "";
  if (!internalKey) throw new Error("internal_api_key_not_configured");

  const response = await fetch(`${input.origin}/api/whatsapp/escalate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hautlab-internal-key": internalKey,
    },
    body: JSON.stringify({
      conversationId: input.conversationId,
      operator: input.operator,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) throw new Error(`escalation_failed:${response.status}`);
}

async function processTextMessage(input: {
  origin: string;
  message: IncomingMessage;
  profileName?: string;
}) {
  const conversation = await upsertConversation({
    phone: input.message.from,
    profileName: input.profileName,
  });

  const text = extractText(input.message);
  const isNew = await insertInboundMessage({
    conversationId: conversation.id,
    metaMessageId: input.message.id,
    body: text,
    messageType: input.message.type,
  });
  if (!isNew) return;

  const settings = await getSettings();
  const mode = effectiveMode(conversation, settings);
  if (mode === "off" || mode === "manual" || conversation.bot_paused) return;

  // Media and unsupported message types are never interpreted autonomously.
  if (!text) {
    const acknowledgement =
      "Recibí el archivo. Para revisarlo correctamente, voy a pasar la conversación con el Dr. Salvador.";
    await updateConversation(conversation.id, {
      last_intent: "clinical",
      next_action: "escalate",
      clinical_risk: true,
      priority: "high",
      human_review_reason: "media_requires_human_review",
      last_ai_analysis: {
        intent: "clinical",
        action: "escalate",
        operator: "doctor",
        reasonCode: "media_requires_human_review",
      },
    });
    const metaMessageId = await sendWhatsAppText(input.message.from, acknowledgement);
    await storeSentMessage({
      conversationId: conversation.id,
      body: acknowledgement,
      metaMessageId,
      senderType: "system",
    });
    await triggerEscalation({
      origin: input.origin,
      conversationId: conversation.id,
      operator: "doctor",
    });
    return;
  }

  const decision = await callTriage({
    origin: input.origin,
    message: text,
    city: conversation.city,
    conversationId: conversation.id,
  });

  const clinicalRisk =
    decision.intent === "clinical" || decision.intent === "adverse_event";
  const priority = decision.intent === "adverse_event" ? "urgent" : clinicalRisk ? "high" : "normal";

  await updateConversation(conversation.id, {
    last_intent: decision.intent,
    next_action: decision.action,
    clinical_risk: clinicalRisk,
    priority,
    human_review_reason: decision.action === "escalate" ? decision.reasonCode : null,
    last_ai_analysis: {
      intent: decision.intent,
      action: decision.action,
      operator: decision.operator,
      confidence: decision.confidence,
      reasonCode: decision.reasonCode,
      model: decision.model ?? null,
    },
  });

  if (decision.action === "escalate") {
    const operator: OperatorKey = decision.operator === "karen" ? "karen" : "doctor";
    if (decision.reply) {
      const metaMessageId = await sendWhatsAppText(input.message.from, decision.reply);
      await storeSentMessage({
        conversationId: conversation.id,
        body: decision.reply,
        metaMessageId,
        senderType: "system",
        proposedBy: decision.model,
      });
    }
    await triggerEscalation({
      origin: input.origin,
      conversationId: conversation.id,
      operator,
    });
    return;
  }

  if (!decision.reply) return;

  if (mode === "supervised") {
    await storeDraft({
      conversationId: conversation.id,
      body: decision.reply,
      proposedBy: decision.model ?? "hautlab-router",
    });
    return;
  }

  if (mode === "automatic") {
    const metaMessageId = await sendWhatsAppText(input.message.from, decision.reply);
    await storeSentMessage({
      conversationId: conversation.id,
      body: decision.reply,
      metaMessageId,
      proposedBy: decision.model,
    });
    await updateConversation(conversation.id, {
      last_team_message_at: new Date().toISOString(),
    });
  }
}

export async function processWhatsAppWebhook(payload: unknown, origin: string) {
  if (!payload || typeof payload !== "object") return;
  const body = payload as WebhookPayload;

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;
      const profileName = value.contacts?.[0]?.profile?.name;

      for (const message of value.messages ?? []) {
        try {
          await processTextMessage({ origin, message, profileName });
        } catch (error) {
          // Never log patient text, phone numbers, names, or media identifiers.
          console.error("[whatsapp-orchestrator] message processing failed", {
            message: error instanceof Error ? error.message : "unknown_error",
            type: message.type,
          });
        }
      }
    }
  }
}
