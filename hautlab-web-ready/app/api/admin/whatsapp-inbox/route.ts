import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-access";
import {
  exceedsContentLength,
  isSameOriginRequest,
} from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxBodyBytes = 32 * 1024;
const LEGACY_SEND_RELAY_URL = "https://nuevo-zzys.vercel.app/api/send-relay";
const RELAY_SECRET_KEY = "relay_hmac_secret";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("take"),
    conversationId: z.string().uuid(),
    operator: z.enum(["doctor", "karen"]),
  }),
  z.object({
    action: z.literal("resume"),
    conversationId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("send"),
    conversationId: z.string().uuid(),
    message: z.string().trim().min(1).max(4096),
  }),
  z.object({
    action: z.literal("close"),
    conversationId: z.string().uuid(),
  }),
]);

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

function supabaseHeaders(key: string, prefer?: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function supabaseJson<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("supabase_not_configured");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...supabaseHeaders(config.key),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
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
  if (!response.ok) throw new Error(`supabase_${response.status}`);
  return payload as T;
}

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^[1-9][0-9]{9,14}$/.test(digits) ? digits : null;
}

function bookingActiveWindowMs() {
  const configured = Number(process.env.HAUTLAB_BOOKING_ACTIVE_HOURS ?? "72");
  const hours = Number.isFinite(configured)
    ? Math.max(12, Math.min(168, configured))
    : 72;
  return hours * 60 * 60 * 1000;
}

type OperationalStateRow = {
  clinical_risk: boolean;
  risk_level: string | null;
  assigned_to: string | null;
  handoff_status: string | null;
  appointment_status: string | null;
  appointment_requested_at: string | null;
  last_patient_message_at: string | null;
  last_message_at: string | null;
  closed_at: string | null;
  outcome: string | null;
};

function deriveOperationalState(row: OperationalStateRow) {
  if (row.closed_at || row.outcome) return "closed" as const;
  if (row.clinical_risk || row.risk_level === "urgent") return "clinical_review" as const;
  if (
    row.handoff_status === "pending" ||
    row.handoff_status === "assigned" ||
    Boolean(row.assigned_to)
  ) {
    return "human_pending" as const;
  }
  if (
    row.appointment_status === "collecting" ||
    row.appointment_status === "pending_confirmation"
  ) {
    const reference = Date.parse(
      row.last_patient_message_at ??
        row.appointment_requested_at ??
        row.last_message_at ??
        "",
    );
    if (Number.isFinite(reference) && Date.now() - reference <= bookingActiveWindowMs()) {
      return "booking_pending" as const;
    }
    return "reactivation" as const;
  }
  if (row.appointment_status === "confirmed") return "scheduled" as const;
  return "idle" as const;
}

async function getRelaySecret() {
  const rows = await supabaseJson<Array<{ secret_value?: string }>>(
    `wa_internal_config?key=eq.${encodeURIComponent(RELAY_SECRET_KEY)}&select=secret_value&limit=1`,
  );
  return rows[0]?.secret_value?.trim() || "";
}

async function sendWhatsAppText(to: string, body: string) {
  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ||
    process.env.WHATSAPP_TOKEN?.trim() ||
    "";
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ||
    process.env.PHONE_NUMBER_ID?.trim() ||
    "";
  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v25.0";

  if (accessToken && phoneNumberId) {
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
        signal: AbortSignal.timeout(15000),
      },
    );

    const payload = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { code?: unknown };
    };
    if (!response.ok) {
      console.error("[whatsapp-inbox] Meta send failed", {
        status: response.status,
        code: payload.error?.code ?? null,
      });
      throw new Error(`meta_send_${response.status}`);
    }
    return payload.messages?.[0]?.id ?? null;
  }

  const relaySecret = await getRelaySecret();
  if (!relaySecret) throw new Error("whatsapp_not_configured");

  const rawBody = JSON.stringify({
    to,
    message: {
      type: "text",
      text: { body, preview_url: false },
    },
  });
  const signature = createHmac("sha256", relaySecret)
    .update(rawBody, "utf8")
    .digest("hex");

  const relayResponse = await fetch(LEGACY_SEND_RELAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hautlab-relay-signature": `sha256=${signature}`,
    },
    body: rawBody,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const relayText = await relayResponse.text();
  let relayPayload: { messageId?: string; error?: string } = {};
  if (relayText) {
    try {
      relayPayload = JSON.parse(relayText) as typeof relayPayload;
    } catch {
      relayPayload = {};
    }
  }

  if (!relayResponse.ok) {
    console.error("[whatsapp-inbox] relay send failed", {
      status: relayResponse.status,
      error: relayPayload.error ?? null,
    });
    throw new Error(`whatsapp_relay_${relayResponse.status}`);
  }

  return relayPayload.messageId ?? null;
}

export async function GET(request: NextRequest) {
  const access = await getAdminAccess();
  if (!access.allowed) return noStoreJson({ error: "unauthorized" }, { status: 401 });

  const selectedId = request.nextUrl.searchParams.get("conversationId");
  if (selectedId && !z.string().uuid().safeParse(selectedId).success) {
    return noStoreJson({ error: "invalid_conversation" }, { status: 400 });
  }

  try {
    const conversations = await supabaseJson<
      Array<{
        id: string;
        phone: string;
        profile_name: string | null;
        city: string | null;
        treatment: string | null;
        stage: string | null;
        ai_mode: string;
        assigned_to: string | null;
        priority: string | null;
        clinical_risk: boolean;
        risk_level: string | null;
        last_intent: string | null;
        next_action: string | null;
        human_review_reason: string | null;
        conversation_summary: string | null;
        patient_goal: string | null;
        handoff_status: string | null;
        bot_paused: boolean;
        last_message_at: string | null;
        last_patient_message_at: string | null;
        last_team_message_at: string | null;
        appointment_status: string | null;
        appointment_requested_at: string | null;
        closed_at: string | null;
        outcome: string | null;
      }>
    >(
      "wa_conversations?select=id,phone,profile_name,city,treatment,stage,ai_mode,assigned_to,priority,clinical_risk,risk_level,last_intent,next_action,human_review_reason,conversation_summary,patient_goal,handoff_status,bot_paused,last_message_at,last_patient_message_at,last_team_message_at,appointment_status,appointment_requested_at,closed_at,outcome,first_attribution,last_attribution,first_attributed_at,last_attributed_at&order=last_message_at.desc&limit=100",
    );

    const effectiveSelected =
      selectedId && conversations.some((row) => row.id === selectedId)
        ? selectedId
        : conversations[0]?.id ?? null;

    const messages = effectiveSelected
      ? await supabaseJson<
          Array<{
            id: string;
            conversation_id: string;
            direction: string;
            sender_type: string;
            body: string | null;
            message_type: string;
            status: string | null;
            operator_key: string | null;
            proposed_by: string | null;
            approved_by: string | null;
            created_at: string;
            sent_at: string | null;
          }>
        >(
          `wa_messages?conversation_id=eq.${encodeURIComponent(effectiveSelected)}&select=id,conversation_id,direction,sender_type,body,message_type,status,operator_key,proposed_by,approved_by,created_at,sent_at&order=created_at.asc&limit=160`,
        )
      : [];

    const conversationsWithState = conversations.map((row) => ({
      ...row,
      operational_state: deriveOperationalState(row),
    }));
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stats = {
      total: conversationsWithState.length,
      today: conversationsWithState.filter((row) => {
        const value = row.last_message_at ? Date.parse(row.last_message_at) : 0;
        return value >= today.getTime() && value <= now;
      }).length,
      clinicalRisk: conversationsWithState.filter(
        (row) => row.operational_state === "clinical_review",
      ).length,
      human: conversationsWithState.filter(
        (row) => row.operational_state === "human_pending",
      ).length,
      pending: conversationsWithState.filter((row) =>
        ["clinical_review", "human_pending", "booking_pending"].includes(
          row.operational_state,
        ),
      ).length,
      reactivation: conversationsWithState.filter(
        (row) => row.operational_state === "reactivation",
      ).length,
    };

    return noStoreJson({
      canEdit: Boolean(access.isOwner || access.organizationRole === "org:admin"),
      selectedId: effectiveSelected,
      stats,
      conversations: conversationsWithState,
      messages,
    });
  } catch (error) {
    console.error("[whatsapp-inbox] load failed", {
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return noStoreJson({ error: "load_failed" }, { status: 502 });
  }
}

export async function PUT(request: NextRequest) {
  const access = await getAdminAccess();
  const canEdit = Boolean(access.isOwner || access.organizationRole === "org:admin");
  if (!canEdit) return noStoreJson({ error: "forbidden" }, { status: 403 });
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }
  if (exceedsContentLength(request, maxBodyBytes)) {
    return noStoreJson({ error: "payload_too_large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
      return noStoreJson({ error: "payload_too_large" }, { status: 413 });
    }
    raw = JSON.parse(body);
  } catch {
    return noStoreJson({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(raw);
  if (!parsed.success) {
    return noStoreJson({ error: "invalid_payload" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const actor = access.email ?? access.userId ?? "admin";
  const payload = parsed.data;

  try {
    const rows = await supabaseJson<Array<{ id: string; phone: string }>>(
      `wa_conversations?id=eq.${encodeURIComponent(payload.conversationId)}&select=id,phone&limit=1`,
    );
    const conversation = rows[0];
    if (!conversation) return noStoreJson({ error: "not_found" }, { status: 404 });

    if (payload.action === "take") {
      await supabaseJson(`wa_conversations?id=eq.${encodeURIComponent(conversation.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          assigned_to: payload.operator,
          assigned_at: now,
          assigned_by: actor,
          bot_paused: true,
          bot_paused_at: now,
          bot_paused_by: actor,
          paused_reason: "human_takeover",
          handoff_status: "assigned",
          updated_at: now,
        }),
      });
      return noStoreJson({ ok: true });
    }

    if (payload.action === "resume") {
      await supabaseJson(`wa_conversations?id=eq.${encodeURIComponent(conversation.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          assigned_to: null,
          bot_paused: false,
          bot_paused_at: null,
          bot_paused_by: actor,
          paused_reason: null,
          handoff_status: "resolved",
          updated_at: now,
        }),
      });
      return noStoreJson({ ok: true });
    }

    if (payload.action === "close") {
      await supabaseJson(`wa_conversations?id=eq.${encodeURIComponent(conversation.id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          closed_at: now,
          closed_by: actor,
          handoff_status: "resolved",
          bot_paused: true,
          bot_paused_at: now,
          bot_paused_by: actor,
          paused_reason: "conversation_closed",
          updated_at: now,
        }),
      });
      return noStoreJson({ ok: true });
    }

    const to = normalizePhone(conversation.phone);
    if (!to) return noStoreJson({ error: "invalid_phone" }, { status: 409 });
    const metaMessageId = await sendWhatsAppText(to, payload.message);

    await supabaseJson("wa_messages", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        conversation_id: conversation.id,
        meta_message_id: metaMessageId,
        direction: "outbound",
        sender_type: "human",
        operator_key: actor,
        body: payload.message,
        message_type: "text",
        status: "sent",
        approved_by: actor,
        sent_at: now,
      }),
    });

    await supabaseJson(`wa_conversations?id=eq.${encodeURIComponent(conversation.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        bot_paused: true,
        bot_paused_at: now,
        bot_paused_by: actor,
        paused_reason: "manual_reply",
        last_team_message_at: now,
        last_message_at: now,
        updated_at: now,
      }),
    });

    return noStoreJson({ ok: true, messageId: metaMessageId });
  } catch (error) {
    console.error("[whatsapp-inbox] action failed", {
      action: payload.action,
      reason: error instanceof Error ? error.message : "unknown_error",
    });
    return noStoreJson({ error: "action_failed" }, { status: 502 });
  }
}
