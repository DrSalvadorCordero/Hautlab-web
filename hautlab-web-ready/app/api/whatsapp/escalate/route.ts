import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LEGACY_SEND_RELAY_URL = "https://nuevo-zzys.vercel.app/api/send-relay";
const RELAY_SECRET_KEY = "relay_hmac_secret";

const inputSchema = z.object({
  conversationId: z.string().uuid(),
  operator: z.enum(["doctor", "karen"]),
});

type ConversationRow = {
  id: string;
  handoff_ref: number;
};

type OperatorRow = {
  operator_key: "doctor" | "karen";
  phone_e164: string | null;
  active: boolean;
  alert_enabled: boolean;
};

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

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
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`supabase_error:${response.status}:${JSON.stringify(payload)}`);
  }
  return payload as T;
}

async function getRelaySecret(): Promise<string> {
  try {
    const rows = await supabaseRequest<Array<{ secret_value?: string }>>(
      `wa_internal_config?key=eq.${encodeURIComponent(RELAY_SECRET_KEY)}&select=secret_value&limit=1`,
    );
    return rows[0]?.secret_value?.trim() || "";
  } catch {
    return "";
  }
}

async function patchConversation(conversationId: string, body: Record<string, unknown>) {
  await supabaseRequest(
    `wa_conversations?id=eq.${encodeURIComponent(conversationId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(body),
    },
  );
}

async function createNotification(input: {
  conversationId: string;
  operator: "doctor" | "karen";
  templateName: string;
  payload: Record<string, unknown>;
}) {
  return supabaseRequest<Array<{ id: string }>>("wa_notifications", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      conversation_id: input.conversationId,
      operator_key: input.operator,
      kind: "escalation",
      channel: "whatsapp",
      status: "queued",
      template_name: input.templateName,
      payload: input.payload,
      attempts: 0,
    }),
  });
}

async function updateNotification(
  notificationId: string,
  body: Record<string, unknown>,
) {
  await supabaseRequest(
    `wa_notifications?id=eq.${encodeURIComponent(notificationId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
    },
  );
}

async function sendWhatsAppPayload(input: {
  to: string;
  template: Record<string, unknown>;
  accessToken: string;
  phoneNumberId: string;
  graphVersion: string;
  relaySecret: string;
}) {
  if (input.accessToken && input.phoneNumberId) {
    const response = await fetch(
      `https://graph.facebook.com/${input.graphVersion}/${input.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: input.to,
          type: "template",
          template: input.template,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      },
    );
    const text = await response.text();
    let payload: Record<string, unknown> = {};
    if (text) {
      try {
        payload = JSON.parse(text) as Record<string, unknown>;
      } catch {
        payload = { raw: text };
      }
    }
    return { ok: response.ok, status: response.status, payload };
  }

  const rawBody = JSON.stringify({
    to: input.to,
    message: {
      type: "template",
      template: input.template,
    },
  });
  const signature = createHmac("sha256", input.relaySecret)
    .update(rawBody, "utf8")
    .digest("hex");
  const response = await fetch(LEGACY_SEND_RELAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hautlab-relay-signature": `sha256=${signature}`,
    },
    body: rawBody,
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const text = await response.text();
  let relayPayload: Record<string, unknown> = {};
  if (text) {
    try {
      relayPayload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      relayPayload = { raw: text };
    }
  }
  const messageId =
    typeof relayPayload.messageId === "string" ? relayPayload.messageId : null;
  const payload: Record<string, unknown> = messageId
    ? { messages: [{ id: messageId }] }
    : relayPayload;
  return { ok: response.ok, status: response.status, payload };
}

async function appendHandoffEvent(input: {
  conversationId: string;
  eventType: "alert_queued" | "alert_sent" | "alert_failed";
  actorKey: string;
  metadata?: Record<string, unknown>;
}) {
  await supabaseRequest("wa_handoff_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      conversation_id: input.conversationId,
      event_type: input.eventType,
      actor_type: "integration",
      actor_key: input.actorKey,
      metadata: input.metadata ?? {},
    }),
  });
}

export async function POST(request: NextRequest) {
  const relaySecretForAuth = await getRelaySecret();
  const internalKey =
    process.env.HAUTLAB_INTERNAL_API_KEY?.trim() || relaySecretForAuth;
  const receivedKey = request.headers.get("x-hautlab-internal-key")?.trim() ?? "";

  if (!internalKey) {
    return NextResponse.json(
      { error: "Internal API authentication is not configured." },
      { status: 503 },
    );
  }

  if (!receivedKey || !secureEqual(receivedKey, internalKey)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = inputSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { conversationId, operator } = parsed.data;
  const templateName =
    process.env.WHATSAPP_ESCALATION_TEMPLATE_NAME?.trim() ||
    "alerta_escalamiento_humano";
  const languageCode =
    process.env.WHATSAPP_ESCALATION_TEMPLATE_LANGUAGE?.trim() || "es_MX";
  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ||
    process.env.WHATSAPP_TOKEN?.trim() ||
    "";
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ||
    process.env.PHONE_NUMBER_ID?.trim() ||
    "";
  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v23.0";
  const relaySecret =
    accessToken && phoneNumberId ? "" : relaySecretForAuth || (await getRelaySecret());

  if ((!accessToken || !phoneNumberId) && !relaySecret) {
    return NextResponse.json(
      { error: "WhatsApp sending is not configured." },
      { status: 503 },
    );
  }

  try {
    const conversations = await supabaseRequest<ConversationRow[]>(
      `wa_conversations?id=eq.${encodeURIComponent(conversationId)}&select=id,handoff_ref&limit=1`,
    );
    const conversation = conversations[0];
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const operators = await supabaseRequest<OperatorRow[]>(
      `wa_operators?operator_key=eq.${encodeURIComponent(operator)}&select=operator_key,phone_e164,active,alert_enabled&limit=1`,
    );
    const target = operators[0];
    if (!target || !target.active || !target.alert_enabled || !target.phone_e164) {
      return NextResponse.json(
        { error: "Operator is unavailable for WhatsApp alerts." },
        { status: 409 },
      );
    }

    const reference = `HL-${conversation.handoff_ref}`;
    const templatePayload = {
      messaging_product: "whatsapp",
      to: target.phone_e164,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: reference }],
          },
        ],
      },
    };

    const notifications = await createNotification({
      conversationId,
      operator,
      templateName,
      payload: {
        reference,
        languageCode,
      },
    });
    const notificationId = notifications[0]?.id;

    await appendHandoffEvent({
      conversationId,
      eventType: "alert_queued",
      actorKey: operator,
      metadata: { reference, templateName, languageCode },
    });

    const metaResult = await sendWhatsAppPayload({
      to: target.phone_e164,
      template: templatePayload.template,
      accessToken,
      phoneNumberId,
      graphVersion,
      relaySecret,
    });
    const metaPayload = metaResult.payload;
    if (!metaResult.ok) {
      if (notificationId) {
        await updateNotification(notificationId, {
          status: "failed",
          attempts: 1,
          error_code: String(
            (metaPayload.error as Record<string, unknown> | undefined)?.code ??
              metaResult.status,
          ),
          error_message: String(
            (metaPayload.error as Record<string, unknown> | undefined)?.message ??
              "Meta send failed",
          ),
        });
      }
      await patchConversation(conversationId, {
        last_alert_at: new Date().toISOString(),
        last_alert_status: "failed",
      });
      await appendHandoffEvent({
        conversationId,
        eventType: "alert_failed",
        actorKey: operator,
        metadata: { reference, status: metaResult.status },
      });

      return NextResponse.json(
        { error: "Meta rejected the template message." },
        { status: 502 },
      );
    }

    const messages = metaPayload.messages as Array<{ id?: string }> | undefined;
    const metaMessageId = messages?.[0]?.id ?? null;

    if (notificationId) {
      await updateNotification(notificationId, {
        status: "sent",
        attempts: 1,
        meta_message_id: metaMessageId,
        sent_at: new Date().toISOString(),
      });
    }
    await patchConversation(conversationId, {
      assigned_to: operator,
      assigned_at: new Date().toISOString(),
      assigned_by: "ai",
      bot_paused: true,
      bot_paused_at: new Date().toISOString(),
      bot_paused_by: "ai",
      handoff_status: "assigned",
      last_alert_at: new Date().toISOString(),
      last_alert_status: "sent",
    });
    await appendHandoffEvent({
      conversationId,
      eventType: "alert_sent",
      actorKey: operator,
      metadata: { reference, metaMessageId, templateName, languageCode },
    });

    return NextResponse.json({
      sent: true,
      reference,
      operator,
      metaMessageId,
    });
  } catch (error) {
    console.error("[whatsapp-escalate] failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      { error: "Escalation could not be completed." },
      { status: 500 },
    );
  }
}
