import { createHmac, timingSafeEqual } from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN ?? process.env.META_VERIFY_TOKEN ?? "";
const APP_SECRET =
  process.env.META_APP_SECRET ?? process.env.WHATSAPP_APP_SECRET ?? "";
const META_APP_ID = process.env.META_APP_ID ?? "";
const LEGACY_META_VERIFY_URL = "https://nuevo-zzys.vercel.app/api/meta-verify";
const LEGACY_WEBHOOK_URL = "https://nuevo-zzys.vercel.app/api/webhook";

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
          orchestrator: "legacy-command-center",
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
  console.info("[whatsapp-webhook] verified event", summary);

  after(async () => {
    try {
      const response = await fetch(LEGACY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: rawBody,
        cache: "no-store",
        signal: AbortSignal.timeout(50000),
      });
      if (!response.ok) {
        console.error("[whatsapp-webhook] command center bridge failed", {
          status: response.status,
        });
      }
    } catch (error) {
      console.error("[whatsapp-webhook] command center bridge failed", {
        message: error instanceof Error ? error.message : "unknown_error",
      });
    }
  });

  return NextResponse.json(
    { received: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
