type JsonRecord = Record<string, unknown>;

type PointConfig = {
  application_id: string;
  active_mode: "test" | "production";
  enabled: boolean;
};

type PointOrder = {
  id: string;
  external_reference: string;
  mp_order_id: string | null;
  amount: number | string;
  currency: string;
  test_mode: boolean;
};

type WebhookEvent = {
  id: string;
  processing_status: "received" | "processed" | "ignored" | "failed";
  received_at: string;
};

const allowedStatuses = new Set([
  "created",
  "at_terminal",
  "processed",
  "action_required",
  "failed",
  "canceled",
  "refunded",
  "expired"
]);

class PointWebhookError extends Error {
  constructor(
    readonly code: string,
    readonly status = 500,
    message = code
  ) {
    super(message);
    this.name = "PointWebhookError";
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
  if (!url || !key) throw new PointWebhookError("database_not_configured", 503);

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
    throw new PointWebhookError(
      String(record?.code ?? "database_request_failed"),
      response.status,
      String(record?.message ?? "database_request_failed")
    );
  }
  return payload as T;
}

async function pointSecret(name: string) {
  const value = await databaseRequest<unknown>("rpc/hautlab_point_secret", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ p_name: name })
  });
  if (typeof value !== "string" || !value.trim()) {
    throw new PointWebhookError("point_secret_not_configured", 503);
  }
  return value.trim();
}

async function getConfig() {
  const query = new URLSearchParams({
    select: "application_id,active_mode,enabled",
    provider: "eq.mercado_pago_point",
    limit: "1"
  });
  const rows = await databaseRequest<PointConfig[]>(`mp_point_provider_config?${query}`);
  const config = rows[0];
  if (!config) throw new PointWebhookError("point_provider_not_configured", 503);
  return config;
}

function parseSignature(header: string | null) {
  if (!header) return null;
  const values = new Map<string, string>();
  for (const part of header.split(",")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    values.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
  }
  const ts = values.get("ts");
  const v1 = values.get("v1");
  return ts && v1 ? { ts, v1 } : null;
}

async function hmacHex(secret: string, message: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const result = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function validateSignature(input: {
  header: string | null;
  requestId: string | null;
  dataId: string;
  secret: string;
}) {
  const parsed = parseSignature(input.header);
  if (!parsed || !input.requestId || !/^[a-f0-9]{64}$/i.test(parsed.v1)) return false;
  const numericTs = Number(parsed.ts);
  if (!Number.isFinite(numericTs)) return false;
  const timestampMs = numericTs > 10_000_000_000 ? numericTs : numericTs * 1000;
  if (Math.abs(Date.now() - timestampMs) > 5 * 60_000) return false;

  const manifest = `id:${input.dataId.toLowerCase()};request-id:${input.requestId};ts:${parsed.ts};`;
  const expected = await hmacHex(input.secret, manifest);
  return constantTimeEqual(expected, parsed.v1.toLowerCase());
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function createEvent(input: {
  deduplicationKey: string;
  providerEventId: string | null;
  requestId: string | null;
  action: string | null;
  resourceId: string;
  liveMode: boolean;
  signatureValid: boolean;
}) {
  try {
    const rows = await databaseRequest<WebhookEvent[]>("mp_point_webhook_events", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({
        deduplication_key: input.deduplicationKey,
        provider_event_id: input.providerEventId,
        request_id: input.requestId,
        action: input.action,
        resource_id: input.resourceId,
        live_mode: input.liveMode,
        signature_valid: input.signatureValid
      })
    });
    return rows[0] ?? null;
  } catch (error) {
    if (error instanceof PointWebhookError && error.code === "23505") return null;
    throw error;
  }
}

async function getEvent(deduplicationKey: string) {
  const query = new URLSearchParams({
    select: "id,processing_status,received_at",
    deduplication_key: `eq.${deduplicationKey}`,
    limit: "1"
  });
  const rows = await databaseRequest<WebhookEvent[]>(`mp_point_webhook_events?${query}`);
  return rows[0] ?? null;
}

async function finishEvent(eventId: string, status: "processed" | "ignored" | "failed", errorCode?: string) {
  const query = new URLSearchParams({ id: `eq.${eventId}` });
  await databaseRequest(`mp_point_webhook_events?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      processing_status: status,
      error_code: errorCode?.slice(0, 120) ?? null,
      processed_at: new Date().toISOString()
    })
  });
}

async function fetchProviderOrder(orderId: string, mode: "test" | "production") {
  const token = await pointSecret(`mp_point_access_token_${mode}`);
  const response = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    },
    signal: AbortSignal.timeout(10_000)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !asRecord(payload)) {
    throw new PointWebhookError("mercado_pago_order_lookup_failed", response.status >= 500 ? 503 : 409);
  }
  return payload as JsonRecord;
}

async function getLocalOrder(externalReference: string) {
  const query = new URLSearchParams({
    select: "id,external_reference,mp_order_id,amount,currency,test_mode",
    external_reference: `eq.${externalReference}`,
    limit: "1"
  });
  const rows = await databaseRequest<PointOrder[]>(`mp_point_orders?${query}`);
  return rows[0] ?? null;
}

function firstPayment(providerOrder: JsonRecord) {
  const transactions = asRecord(providerOrder.transactions);
  const payments = Array.isArray(transactions?.payments) ? transactions.payments : [];
  return asRecord(payments[0]);
}

async function reconcileOrder(resourceId: string, liveMode: boolean, webhookEventId: string) {
  if (!/^ORD[A-Za-z0-9_-]+$/.test(resourceId)) {
    throw new PointWebhookError("invalid_point_order_id", 409);
  }
  const mode = liveMode ? "production" : "test";
  const providerOrder = await fetchProviderOrder(resourceId, mode);
  if (String(providerOrder.id ?? "").toLowerCase() !== resourceId.toLowerCase()) {
    throw new PointWebhookError("point_order_id_mismatch", 409);
  }
  if (providerOrder.type !== "point") {
    throw new PointWebhookError("not_a_point_order", 409);
  }

  const externalReference = typeof providerOrder.external_reference === "string"
    ? providerOrder.external_reference
    : "";
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(externalReference)) {
    throw new PointWebhookError("invalid_external_reference", 409);
  }
  const localOrder = await getLocalOrder(externalReference);
  if (!localOrder) throw new PointWebhookError("local_order_not_found", 404);
  if (localOrder.mp_order_id && localOrder.mp_order_id.toLowerCase() !== resourceId.toLowerCase()) {
    throw new PointWebhookError("local_order_id_mismatch", 409);
  }
  if (localOrder.test_mode === liveMode) {
    throw new PointWebhookError("point_mode_mismatch", 409);
  }

  const status = typeof providerOrder.status === "string" ? providerOrder.status : "";
  if (!allowedStatuses.has(status)) {
    throw new PointWebhookError("unsupported_point_status", 409);
  }

  const payment = firstPayment(providerOrder);
  const amount = payment?.amount === undefined ? Number.NaN : Number(payment.amount);
  if (Number.isFinite(amount) && Math.abs(Number(localOrder.amount) - amount) >= 0.005) {
    throw new PointWebhookError("point_amount_mismatch", 409);
  }

  const paymentMethod = asRecord(payment?.payment_method);
  const reference = asRecord(payment?.reference);
  const query = new URLSearchParams({ id: `eq.${localOrder.id}` });
  await databaseRequest(`mp_point_orders?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      mp_order_id: String(providerOrder.id),
      status,
      status_detail: typeof providerOrder.status_detail === "string" ? providerOrder.status_detail : null,
      transaction_id: typeof payment?.id === "string" ? payment.id : null,
      payment_reference_id: reference?.id === undefined ? null : String(reference.id),
      payment_method_type: typeof paymentMethod?.type === "string" ? paymentMethod.type : null,
      payment_method_id: typeof paymentMethod?.id === "string" ? paymentMethod.id : null,
      installments: typeof paymentMethod?.installments === "number" ? paymentMethod.installments : null,
      live_mode: liveMode,
      last_webhook_event_id: webhookEventId,
      last_webhook_at: new Date().toISOString(),
      paid_at: status === "processed" ? new Date().toISOString() : undefined,
      refunded_at: status === "refunded" ? new Date().toISOString() : undefined,
      provider_created_at: typeof providerOrder.created_date === "string" ? providerOrder.created_date : null,
      provider_updated_at: typeof providerOrder.last_updated_date === "string" ? providerOrder.last_updated_date : null
    })
  });
}

async function readBody(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > 64 * 1024) {
    throw new PointWebhookError("payload_too_large", 413);
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 64 * 1024) {
    throw new PointWebhookError("payload_too_large", 413);
  }
  const body = asRecord(JSON.parse(text));
  if (!body) throw new PointWebhookError("invalid_payload", 400);
  return body;
}

Deno.serve(async (request) => {
  if (request.method === "GET") {
    return json({ status: "ok", provider: "mercado_pago_point" });
  }
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await readBody(request);
    const url = new URL(request.url);
    const data = asRecord(body.data);
    const resourceId = String(url.searchParams.get("data.id") ?? data?.id ?? "");
    const topic = String(url.searchParams.get("type") ?? body.type ?? "unknown").toLowerCase();
    const action = body.action === undefined ? null : String(body.action);
    const liveMode = body.live_mode === true;
    const mode = liveMode ? "production" : "test";
    const requestId = request.headers.get("x-request-id");
    if (!resourceId) return json({ error: "missing_resource_id" }, 400);
    if (topic !== "order") return json({ ok: true, ignored: true, reason: "unsupported_topic" });

    const config = await getConfig();
    const applicationId = body.application_id === undefined ? "" : String(body.application_id);
    if (applicationId && applicationId !== config.application_id) {
      return json({ error: "application_id_mismatch" }, 409);
    }

    const webhookSecret = await pointSecret(`mp_point_webhook_secret_${mode}`);
    const signatureValid = await validateSignature({
      header: request.headers.get("x-signature"),
      requestId,
      dataId: resourceId,
      secret: webhookSecret
    });
    if (!signatureValid) return json({ error: "invalid_signature" }, 401);

    const providerEventId = body.id === undefined ? null : String(body.id);
    const deduplicationKey = await sha256Hex(
      [topic, action ?? "", providerEventId ?? "", resourceId.toLowerCase(), String(liveMode)].join("|")
    );
    let event = await createEvent({
      deduplicationKey,
      providerEventId,
      requestId,
      action,
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
    if (!event) throw new PointWebhookError("event_not_recorded", 503);

    try {
      await reconcileOrder(resourceId, liveMode, event.id);
      await finishEvent(event.id, "processed");
      return json({ ok: true });
    } catch (error) {
      const code = error instanceof PointWebhookError ? error.code : "point_reconciliation_failed";
      if (code === "local_order_not_found") {
        await finishEvent(event.id, "ignored", code);
        return json({ ok: true, ignored: true });
      }
      await finishEvent(event.id, "failed", code);
      console.error("Mercado Pago Point webhook reconciliation failed", { code, requestId });
      return json({ error: "processing_failed" }, 500);
    }
  } catch (error) {
    const status = error instanceof PointWebhookError ? error.status : 400;
    const code = error instanceof PointWebhookError ? error.code : "invalid_payload";
    console.error("Mercado Pago Point webhook request failed", { code });
    return json({ error: code }, status);
  }
});
