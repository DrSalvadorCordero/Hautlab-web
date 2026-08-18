import { createHmac, timingSafeEqual } from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { processWhatsAppWebhook } from "@/lib/whatsapp-orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN ?? process.env.META_VERIFY_TOKEN ?? "";
const APP_SECRET =
  process.env.META_APP_SECRET ?? process.env.WHATSAPP_APP_SECRET ?? "";
const META_APP_ID = process.env.META_APP_ID ?? "";
const LEGACY_META_VERIFY_URL = "https://nuevo-zzys.vercel.app/api/meta-verify";
const COMMAND_RELAY_URL =
  "https://mwnmopsybpvjnfnepadv.supabase.co/functions/v1/wa-command-router";
const RELAY_SECRET_KEY = "relay_hmac_secret";

function secureStringEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyMetaSignatureLocally(rawBody: string, signatureHeader: string | null): boolean {
  if (!APP_SECRET || !signatureHeader?.startsWith("sha256=")) return false;
  const receivedDigest = signatureHeader.slice("sha256=".length);
  const expectedDigest = createHmac("sha256", APP_SECRET)
    .update(rawBody, "utf8")
    .digest("hex");
  return secureStringEqual(receivedDigest, expectedDigest);
}

async function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  if (APP_SECRET) return verifyMetaSignatureLocally(rawBody, signatureHeader);

  try {
    const response = await fetch(LEGACY_META_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": signatureHeader,
      },
      body: rawBody,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  return /^[1-9][0-9]{9,14}$/.test(digits) ? digits : null;
}

function phoneVariants(value: unknown): string[] {
  const digits = normalizePhone(value);
  if (!digits) return [];
  const variants = new Set<string>([digits]);
  if (/^521[0-9]{10}$/.test(digits)) variants.add(`52${digits.slice(3)}`);
  if (/^52[0-9]{10}$/.test(digits)) variants.add(`521${digits.slice(2)}`);
  return [...variants];
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

async function isOperatorPhone(phone: string) {
  const config = getSupabaseConfig();
  const variants = phoneVariants(phone);
  if (!config || !variants.length) return false;
  const encoded = variants.map((item) => `\"${item}\"`).join(",");
  const response = await fetch(
    `${config.url}/rest/v1/wa_operators?phone_e164=in.(${encodeURIComponent(encoded)})&active=eq.true&select=operator_key&limit=1`,
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
  if (!response.ok) return false;
  const rows = (await response.json()) as Array<{ operator_key?: string }>;
  return rows.length > 0;
}

async function callCommandRelay(action: string, payload: Record<string, unknown>) {
  const secret = await getRelaySecret();
  if (!secret) throw new Error("relay_secret_unavailable");
  const rawBody = JSON.stringify({ action, ...payload });
  const signature = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const response = await fetch(COMMAND_RELAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hautlab-relay-signature": `sha256=${signature}`,
    },
    body: rawBody,
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(`command_relay_failed:${response.status}`);
  return data;
}

type ParsedInbound = {
  from: string;
  id: string;
  type: string;
  text: string;
  profileName: string;
  replyToMessageId: string;
};

function extractInbound(payload: unknown): ParsedInbound | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          contacts?: Array<{ profile?: { name?: string } }>;
          messages?: Array<Record<string, unknown>>;
        };
      }>;
    }>;
  };
  const value = body.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  if (!message) return null;

  const from = normalizePhone(message.from) ?? "";
  const id = typeof message.id === "string" ? message.id : "";
  const type = typeof message.type === "string" ? message.type : "unknown";
  const textObject = message.text as { body?: unknown } | undefined;
  const buttonObject = message.button as { text?: unknown } | undefined;
  const contextObject = message.context as { id?: unknown } | undefined;
  const interactive = message.interactive as {
    button_reply?: { title?: unknown };
    list_reply?: { title?: unknown };
  } | undefined;

  let text =
    (typeof textObject?.body === "string" ? textObject.body.trim() : "") ||
    (typeof buttonObject?.text === "string" ? buttonObject.text.trim() : "") ||
    (typeof interactive?.button_reply?.title === "string"
      ? interactive.button_reply.title.trim()
      : "") ||
    (typeof interactive?.list_reply?.title === "string"
      ? interactive.list_reply.title.trim()
      : "");

  if (!text) text = `[${type} recibido]`;
  const profileName = value?.contacts?.[0]?.profile?.name?.trim() || "";
  const replyToMessageId =
    typeof contextObject?.id === "string" ? contextObject.id.trim() : "";
  return from && id
    ? { from, id, type, text, profileName, replyToMessageId }
    : null;
}

function summarizeWebhook(payload: unknown) {
  const summary = {
    object: "unknown",
    entries: 0,
    changes: 0,
    messageEvents: 0,
    statusEvents: 0,
    phoneNumberIds: [] as string[],
  };
  if (!payload || typeof payload !== "object") return summary;
  const body = payload as {
    object?: unknown;
    entry?: Array<{
      changes?: Array<{
        value?: {
          metadata?: { phone_number_id?: unknown };
          messages?: unknown[];
          statuses?: unknown[];
        };
      }>;
    }>;
  };
  summary.object = typeof body.object === "string" ? body.object : "unknown";
  const entries = Array.isArray(body.entry) ? body.entry : [];
  summary.entries = entries.length;
  const phoneNumberIds = new Set<string>();
  for (const entry of entries) {
    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    summary.changes += changes.length;
    for (const change of changes) {
      const value = change?.value;
      if (!value) continue;
      if (Array.isArray(value.messages)) summary.messageEvents += value.messages.length;
      if (Array.isArray(value.statuses)) summary.statusEvents += value.statuses.length;
      const phoneNumberId = value.metadata?.phone_number_id;
      if (typeof phoneNumberId === "string") phoneNumberIds.add(phoneNumberId);
    }
  }
  summary.phoneNumberIds = [...phoneNumberIds];
  return summary;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!mode && !token && !challenge) {
    return NextResponse.json(
      {
        service: "hautlab-whatsapp-webhook",
        status: "ok",
        configuration: {
          metaAppId: Boolean(META_APP_ID),
          verifyToken: Boolean(VERIFY_TOKEN),
          signatureVerification: APP_SECRET ? "local" : "secure-bridge",
          orchestrator: "hautlab-command-center-internal",
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!VERIFY_TOKEN) {
    return NextResponse.json(
      { error: "Webhook verification is not configured." },
      { status: 503 },
    );
  }

  if (
    mode === "subscribe" &&
    token &&
    challenge &&
    secureStringEqual(token, VERIFY_TOKEN)
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json({ error: "Invalid verification request." }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!(await verifyMetaSignature(rawBody, signature))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const summary = summarizeWebhook(payload);
  const incoming = extractInbound(payload);
  const origin = request.nextUrl.origin;
  console.info("[whatsapp-webhook] verified event", summary);

  after(async () => {
    try {
      if (incoming && (await isOperatorPhone(incoming.from))) {
        await callCommandRelay("operator_ingest", {
          phone: incoming.from,
          messageId: incoming.id,
          text: incoming.text,
          messageType: incoming.type,
          profileName: incoming.profileName,
          replyToMessageId: incoming.replyToMessageId,
        });
        console.info("[whatsapp-webhook] operator command routed", {
          type: incoming.type,
          replyContext: Boolean(incoming.replyToMessageId),
        });
        return;
      }

      await processWhatsAppWebhook(payload, origin);

      if (incoming?.from) {
        try {
          await callCommandRelay("repair_phone", { phone: incoming.from });
        } catch (error) {
          console.error("[whatsapp-webhook] notification relay repair failed", {
            message: error instanceof Error ? error.message : "unknown_error",
          });
        }
      }
    } catch (error) {
      console.error("[whatsapp-webhook] internal command center failed", {
        message: error instanceof Error ? error.message : "unknown_error",
      });
    }
  });

  return NextResponse.json(
    { received: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
