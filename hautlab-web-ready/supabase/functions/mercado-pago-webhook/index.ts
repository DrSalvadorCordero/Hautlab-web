type JsonRecord = Record<string, unknown>;

type PaymentOrder = {
  id: string;
  amount: number | string;
  currency: string;
  test_mode: boolean;
};

type WebhookEvent = {
  id: string;
  processing_status: "received" | "processed" | "ignored" | "failed";
  received_at: string;
};

type ProviderConfig = {
  production_owner_id: number | null;
  test_owner_id: number | null;
};

const supportedStatuses = new Set([
  "pending",
  "approved",
  "authorized",
  "in_process",
  "in_mediation",
  "rejected",
  "cancelled",
  "refunded",
  "charged_back"
]);

class WebhookError extends Error {
  constructor(
    readonly code: string,
    readonly status = 500,
    message = code
  ) {
    super(message);
    this.name = "WebhookError";
  }
}

function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function serviceRoleKey() {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || null;
}

function supabaseUrl() {
  return Deno.env.get("SUPABASE_URL")?.trim().replace(/\/$/, "") || null;
}

async function databaseRequest<T>(path: string, init: RequestInit = {}) {
  const url = supabaseUrl();
  const key = serviceRoleKey();
  if (!url || !key) throw new WebhookError("database_not_configured", 503);

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
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
    const record = asRecord(payload);
    throw new WebhookError(
      String(record?.code ?? "database_request_failed"),
      response.status,
      String(record?.message ?? "database_request_failed")
    );
  }
  return payload as T;
}

function rpc<T>(name: string, body: JsonRecord) {
  return databaseRequest<T>(`rpc/${name}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body)
  });
}

async function paymentSecret(name: string) {
  const value = await rpc<string>("hautlab_payment_secret", { p_name: name });
  if (typeof value !== "string" || !value.trim()) {
    throw new WebhookError("secret_not_configured", 503);
  }
  return value.trim();
}

async function optionalPaymentSecret(name: string) {
  try {
    return await paymentSecret(name);
  } catch (error) {
    if (error instanceof Error && error.message.includes("payment_secret_not_configured")) {
      return null;
    }
    throw error;
  }
}

function parseSignature(header: string | null) {
  if (!header) return null;
  const fields = new Map<string, string>();
  for (const part of header.split(",")) {
    const separator = part.indexOf("=");
    if (separator <= 0) continue;
    fields.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }
  const timestamp = fields.get("ts");
  const signature = fields.get("v1");
  return timestamp && signature ? { timestamp, signature } : null;
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function hmacHex(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function validateSignature(input: {
  header: string | null;
  requestId: string | null;
  resourceId: string;
  secret: string;
}) {
  const parsed = parseSignature(input.header);
  if (!parsed || !input.requestId || !/^[a-f0-9]{64}$/i.test(parsed.signature)) return false;

  const numericTimestamp = Number(parsed.timestamp);
  if (!Number.isFinite(numericTimestamp)) return false;
  const timestampMs = numericTimestamp > 10_000_000_000 ? numericTimestamp : numericTimestamp * 1000;
  if (Math.abs(Date.now() - timestampMs) > 5 * 60_000) return false;

  const manifest = `id:${input.resourceId.toLowerCase()};request-id:${input.requestId};ts:${parsed.timestamp};`;
  const expected = await hmacHex(input.secret, manifest);
  return constantTimeEqual(expected, parsed.signature.toLowerCase());
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function createEvent(input: {
  deduplicationKey: string;
  providerEventId: string | null;
  requestId: string | null;
  topic: string;
  resourceId: string;
  liveMode: boolean;
  signatureValid: boolean;
}) {
  try {
    const rows = await databaseRequest<WebhookEvent[]>("payment_webhook_events", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({
        deduplication_key: input.deduplicationKey,
        provider_event_id: input.providerEventId,
        request_id: input.requestId,
        topic: input.topic,
        resource_id: input.resourceId,
        live_mode: input.liveMode,
        signature_valid: input.signatureValid
      })
    });
    return rows[0] ?? null;
  } catch (error) {
    if (error instanceof WebhookError && error.code === "23505") return null;
    throw error;
  }
}

async function getEvent(deduplicationKey: string) {
  const query = new URLSearchParams({
    select: "id,processing_status,received_at",
    deduplication_key: `eq.${deduplicationKey}`,
    limit: "1"
  });
  const rows = await databaseRequest<WebhookEvent[]>(`payment_webhook_events?${query}`);
  return rows[0] ?? null;
}

async function finishEvent(eventId: string, status: "processed" | "ignored" | "failed", errorCode?: string) {
  const query = new URLSearchParams({ id: `eq.${eventId}` });
  await databaseRequest(`payment_webhook_events?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      processing_status: status,
      error_code: errorCode?.slice(0, 120) ?? null,
      processed_at: new Date().toISOString()
    })
  });
}

async function fetchPayment(paymentId: string, accessToken: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    signal: AbortSignal.timeout(8_000)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !asRecord(payload)) {
    throw new WebhookError("mercado_pago_lookup_failed", response.status >= 500 ? 503 : 409);
  }
  return payload as JsonRecord;
}

async function getOrder(orderId: string) {
  const query = new URLSearchParams({ select: "*", id: `eq.${orderId}`, limit: "1" });
  const rows = await databaseRequest<PaymentOrder[]>(`payment_orders?${query}`);
  return rows[0] ?? null;
}

async function getProviderConfig() {
  const query = new URLSearchParams({
    select: "production_owner_id,test_owner_id",
    provider: "eq.mercado_pago",
    limit: "1"
  });
  const rows = await databaseRequest<ProviderConfig[]>(`payment_provider_config?${query}`);
  return rows[0] ?? null;
}

async function reconcilePayment(paymentId: string, liveMode: boolean, webhookEventId: string) {
  if (!/^\d{1,30}$/.test(paymentId)) throw new WebhookError("invalid_payment_id", 409);
  const mode = liveMode ? "production" : "test";
  const accessToken = await paymentSecret(`mp_access_token_${mode}`);
  const payment = await fetchPayment(paymentId, accessToken);

  const reference = typeof payment.external_reference === "string" ? payment.external_reference : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reference)) {
    throw new WebhookError("invalid_external_reference", 409);
  }
  const order = await getOrder(reference);
  if (!order) throw new WebhookError("order_not_found", 404);

  const paymentLiveMode = payment.live_mode === true;
  if (paymentLiveMode !== liveMode || order.test_mode === paymentLiveMode) {
    throw new WebhookError("payment_mode_mismatch", 409);
  }
  const amount = typeof payment.transaction_amount === "number" ? payment.transaction_amount : Number.NaN;
  if (!Number.isFinite(amount) || Math.abs(Number(order.amount) - amount) >= 0.005 || payment.currency_id !== order.currency) {
    throw new WebhookError("payment_amount_mismatch", 409);
  }
  if (String(payment.id ?? "") !== paymentId) throw new WebhookError("payment_id_mismatch", 409);

  const status = typeof payment.status === "string" ? payment.status : "";
  if (!supportedStatuses.has(status)) throw new WebhookError("unsupported_payment_status", 409);

  const config = await getProviderConfig();
  if (!config) throw new WebhookError("provider_not_configured", 503);
  const expectedOwnerId = liveMode ? config.production_owner_id : config.test_owner_id;
  if (expectedOwnerId !== null && Number(payment.collector_id) !== expectedOwnerId) {
    throw new WebhookError("collector_mismatch", 409);
  }

  const rows = await rpc<PaymentOrder[]>("hautlab_payment_apply_status", {
    p_order_id: order.id,
    p_mp_payment_id: paymentId,
    p_status: status,
    p_status_detail: typeof payment.status_detail === "string" ? payment.status_detail : null,
    p_live_mode: paymentLiveMode,
    p_payment_method_id: typeof payment.payment_method_id === "string" ? payment.payment_method_id : null,
    p_payment_type_id: typeof payment.payment_type_id === "string" ? payment.payment_type_id : null,
    p_issuer_id: payment.issuer_id === undefined || payment.issuer_id === null ? null : String(payment.issuer_id),
    p_paid_at: typeof payment.date_approved === "string" ? payment.date_approved : null,
    p_webhook_event_id: webhookEventId
  });
  if (!rows[0]) throw new WebhookError("status_not_applied", 500);
}

async function readPayload(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > 64 * 1024) {
    throw new WebhookError("payload_too_large", 413);
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 64 * 1024) {
    throw new WebhookError("payload_too_large", 413);
  }
  const body = asRecord(JSON.parse(text));
  if (!body) throw new WebhookError("invalid_payload", 400);
  return body;
}

Deno.serve(async (request) => {
  if (request.method === "GET") {
    return json({ status: "ok", provider: "mercado_pago" });
  }
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await readPayload(request);
    const url = new URL(request.url);
    const data = asRecord(body.data);
    const resourceId = String(url.searchParams.get("data.id") ?? data?.id ?? "").toLowerCase();
    const topic = String(url.searchParams.get("type") ?? body.type ?? "unknown").toLowerCase();
    const liveMode = body.live_mode === true;
    const mode = liveMode ? "production" : "test";
    const requestId = request.headers.get("x-request-id");
    if (!resourceId) return json({ error: "missing_resource_id" }, 400);

    const webhookSecret = await optionalPaymentSecret(`mp_webhook_secret_${mode}`);
    let signatureValid = false;
    if (webhookSecret) {
      signatureValid = await validateSignature({
        header: request.headers.get("x-signature"),
        requestId,
        resourceId,
        secret: webhookSecret
      });
      if (!signatureValid) return json({ error: "invalid_signature" }, 401);
    } else if (liveMode) {
      return json({ error: "webhook_secret_not_configured" }, 503);
    }

    const providerEventId = body.id === undefined ? null : String(body.id);
    const deduplicationKey = await sha256Hex(
      [topic, providerEventId ?? "", resourceId, String(liveMode)].join("|")
    );
    let event = await createEvent({
      deduplicationKey,
      providerEventId,
      requestId,
      topic,
      resourceId,
      liveMode,
      signatureValid
    });

    if (!event) {
      event = await getEvent(deduplicationKey);
      if (!event || event.processing_status === "processed" || event.processing_status === "ignored") {
        return json({ ok: true, duplicate: true });
      }
      if (event.processing_status === "received" && Date.now() - Date.parse(event.received_at) < 2 * 60_000) {
        return json({ ok: true, processing: true });
      }
    }
    if (!event) throw new WebhookError("event_not_recorded", 503);

    if (topic !== "payment") {
      await finishEvent(event.id, "ignored", "unsupported_topic");
      return json({ ok: true, ignored: true });
    }

    try {
      await reconcilePayment(resourceId, liveMode, providerEventId ?? event.id);
      await finishEvent(event.id, "processed");
      return json({ ok: true });
    } catch (error) {
      const code = error instanceof WebhookError ? error.code : "payment_reconciliation_failed";
      if (code === "invalid_external_reference" || code === "order_not_found") {
        await finishEvent(event.id, "ignored", code);
        return json({ ok: true, ignored: true });
      }
      await finishEvent(event.id, "failed", code);
      console.error("Mercado Pago webhook reconciliation failed", { code, requestId });
      return json({ error: "processing_failed" }, 500);
    }
  } catch (error) {
    const status = error instanceof WebhookError ? error.status : 400;
    const code = error instanceof WebhookError ? error.code : "invalid_payload";
    console.error("Mercado Pago webhook request failed", { code });
    return json({ error: code === "payload_too_large" ? code : "invalid_payload" }, status);
  }
});
