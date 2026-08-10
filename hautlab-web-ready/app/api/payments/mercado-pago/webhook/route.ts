import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createWebhookEvent,
  finishWebhookEvent,
  getWebhookEvent
} from "@/lib/payments/payment-db";
import {
  MercadoPagoIntegrationError,
  reconcileMercadoPagoPayment,
  validateMercadoPagoWebhookSignature
} from "@/lib/payments/mercado-pago";
import { exceedsContentLength } from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  type: z.string().optional(),
  live_mode: z.boolean().optional(),
  data: z.object({ id: z.union([z.string(), z.number()]) }).passthrough().optional()
}).passthrough();

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

async function parseWebhook(request: Request) {
  if (exceedsContentLength(request, 64 * 1024)) throw new Error("payload_too_large");
  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > 64 * 1024) throw new Error("payload_too_large");
  return webhookSchema.parse(JSON.parse(body));
}

export async function POST(request: Request) {
  let body: z.infer<typeof webhookSchema>;
  try {
    body = await parseWebhook(request);
  } catch {
    return noStoreJson({ error: "invalid_payload" }, { status: 400 });
  }

  const url = new URL(request.url);
  const resourceId = String(url.searchParams.get("data.id") ?? body.data?.id ?? "").toLowerCase();
  const topic = String(url.searchParams.get("type") ?? body.type ?? "unknown").toLowerCase();
  const liveMode = body.live_mode === true;
  const mode = liveMode ? "production" : "test";
  const requestId = request.headers.get("x-request-id");

  if (!resourceId) {
    return noStoreJson({ error: "missing_resource_id" }, { status: 400 });
  }

  let signatureValid = false;
  try {
    signatureValid = await validateMercadoPagoWebhookSignature({
      xSignature: request.headers.get("x-signature"),
      xRequestId: requestId,
      dataId: resourceId,
      mode
    });
  } catch (error) {
    const status = error instanceof MercadoPagoIntegrationError ? error.status : 401;
    return noStoreJson({ error: "invalid_signature" }, { status });
  }

  // Sandbox can be bootstrapped before Mercado Pago exposes its generated
  // signature secret. Production remains fail-closed until that secret exists.
  if (!signatureValid && mode === "production") {
    return noStoreJson({ error: "webhook_secret_not_configured" }, { status: 503 });
  }

  const providerEventId = body.id === undefined ? null : String(body.id);
  const deduplicationKey = createHash("sha256")
    .update([topic, providerEventId ?? "", resourceId, String(liveMode)].join("|"))
    .digest("hex");

  let event = await createWebhookEvent({
    deduplicationKey,
    providerEventId,
    requestId,
    topic,
    resourceId,
    liveMode,
    signatureValid
  });

  if (!event) {
    event = await getWebhookEvent(deduplicationKey);
    if (!event || event.processing_status === "processed" || event.processing_status === "ignored") {
      return noStoreJson({ ok: true, duplicate: true });
    }
    if (
      event.processing_status === "received" &&
      Date.now() - Date.parse(event.received_at) < 2 * 60_000
    ) {
      return noStoreJson({ ok: true, processing: true });
    }
  }

  if (!event) return noStoreJson({ error: "event_not_recorded" }, { status: 503 });

  if (topic !== "payment") {
    await finishWebhookEvent(event.id, "ignored", "unsupported_topic");
    return noStoreJson({ ok: true, ignored: true });
  }

  try {
    await reconcileMercadoPagoPayment({
      paymentId: resourceId,
      mode,
      webhookEventId: providerEventId ?? event.id
    });
    await finishWebhookEvent(event.id, "processed");
    return noStoreJson({ ok: true });
  } catch (error) {
    const code = error instanceof MercadoPagoIntegrationError ? error.code : "payment_reconciliation_failed";
    if (code === "invalid_external_reference" || code === "order_not_found") {
      await finishWebhookEvent(event.id, "ignored", code);
      return noStoreJson({ ok: true, ignored: true });
    }

    console.error("Mercado Pago webhook reconciliation failed", { code, requestId });
    await finishWebhookEvent(event.id, "failed", code);
    return noStoreJson({ error: "processing_failed" }, { status: 500 });
  }
}
