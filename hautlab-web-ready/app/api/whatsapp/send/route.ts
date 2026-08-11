import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RELAY_SECRET_KEY = "relay_hmac_secret";

type RelayPayload = {
  to?: unknown;
  message?: unknown;
};

type MetaMessage = {
  type: "text" | "template";
  text?: { body?: string; preview_url?: boolean };
  template?: Record<string, unknown>;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

async function getRelaySecret(): Promise<string | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const response = await fetch(
    `${config.url}/rest/v1/wa_internal_config?key=eq.${RELAY_SECRET_KEY}&select=secret_value&limit=1`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as Array<{ secret_value?: string }>;
  return rows[0]?.secret_value?.trim() || null;
}

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function validSignature(rawBody: string, secret: string, signature: string | null) {
  if (!signature?.startsWith("sha256=")) return false;
  const received = signature.slice("sha256=".length);
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return secureEqual(received, expected);
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  return /^[1-9][0-9]{9,14}$/.test(digits) ? digits : null;
}

function normalizeMessage(value: unknown): MetaMessage | null {
  if (!value || typeof value !== "object") return null;
  const message = value as Record<string, unknown>;

  if (message.type === "text") {
    const text = message.text;
    if (!text || typeof text !== "object") return null;
    const body = (text as Record<string, unknown>).body;
    if (typeof body !== "string" || !body.trim() || body.length > 4096) return null;
    return {
      type: "text",
      text: {
        body: body.trim(),
        preview_url: Boolean((text as Record<string, unknown>).preview_url),
      },
    };
  }

  if (message.type === "template") {
    const template = message.template;
    if (!template || typeof template !== "object") return null;
    const name = (template as Record<string, unknown>).name;
    const language = (template as Record<string, unknown>).language;
    if (typeof name !== "string" || !name.trim()) return null;
    if (!language || typeof language !== "object") return null;
    return { type: "template", template: template as Record<string, unknown> };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const secret = await getRelaySecret();
  if (!secret) {
    return NextResponse.json({ error: "relay_not_configured" }, { status: 503 });
  }

  if (!validSignature(rawBody, secret, request.headers.get("x-hautlab-relay-signature"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: RelayPayload;
  try {
    payload = JSON.parse(rawBody) as RelayPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const to = normalizePhone(payload.to);
  const message = normalizeMessage(payload.message);
  if (!to || !message) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() ?? "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const graphVersion = process.env.META_GRAPH_VERSION?.trim() || "v23.0";
  if (!accessToken || !phoneNumberId) {
    return NextResponse.json({ error: "whatsapp_not_configured" }, { status: 503 });
  }

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", to, ...message }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    },
  );

  const providerPayload = (await response.json().catch(() => ({}))) as {
    messages?: Array<{ id?: string }>;
    error?: { code?: unknown };
  };

  if (!response.ok) {
    console.error("[whatsapp-send-relay] provider send failed", {
      status: response.status,
      code: providerPayload.error?.code ?? null,
    });
    return NextResponse.json({ error: "provider_send_failed" }, { status: 502 });
  }

  const messageId = providerPayload.messages?.[0]?.id ?? null;
  if (!messageId) {
    return NextResponse.json({ error: "provider_message_id_missing" }, { status: 502 });
  }

  return NextResponse.json(
    { sent: true, messageId },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
