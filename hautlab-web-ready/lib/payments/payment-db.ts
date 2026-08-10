import "server-only";

export type PaymentMode = "test" | "production";

export type PaymentProviderConfigRow = {
  provider: "mercado_pago";
  application_id: string;
  active_mode: PaymentMode;
  production_owner_id: number | null;
  test_owner_id: number | null;
  created_at: string;
  updated_at: string;
};

export type PaymentOrderStatus =
  | "created"
  | "preference_created"
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back"
  | "expired"
  | "error";

export type PaymentOrderRow = {
  id: string;
  provider: "mercado_pago";
  product_code: "medical_assessment";
  product_label: string;
  amount: number | string;
  currency: "MXN";
  payer_email: string;
  payer_first_name: string;
  payer_last_name: string;
  request_fingerprint: string;
  external_reference: string;
  preference_id: string | null;
  mp_payment_id: string | null;
  status: PaymentOrderStatus;
  status_detail: string | null;
  live_mode: boolean | null;
  test_mode: boolean;
  payment_method_id: string | null;
  payment_type_id: string | null;
  issuer_id: string | null;
  last_webhook_event_id: string | null;
  last_webhook_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentWebhookEventRow = {
  id: string;
  deduplication_key: string;
  provider_event_id: string | null;
  request_id: string | null;
  topic: string;
  resource_id: string;
  live_mode: boolean | null;
  signature_valid: boolean;
  processing_status: "received" | "processed" | "ignored" | "failed";
  error_code: string | null;
  received_at: string;
  processed_at: string | null;
};

type DatabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

export class PaymentDatabaseError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "payment_database_error") {
    super(message);
    this.name = "PaymentDatabaseError";
    this.status = status;
    this.code = code;
  }
}

function getConfig(): DatabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && serviceRoleKey ? { url, serviceRoleKey } : null;
}

export function isPaymentDatabaseConfigured() {
  return Boolean(getConfig());
}

async function databaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getConfig();
  if (!config) {
    throw new PaymentDatabaseError(
      "Payment database is not configured",
      503,
      "database_not_configured"
    );
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
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
    const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
    const message = String(record?.message ?? record?.hint ?? `HTTP ${response.status}`);
    const code = String(record?.code ?? "payment_database_request_failed");
    throw new PaymentDatabaseError(message, response.status, code);
  }

  return payload as T;
}

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  return databaseRequest<T>(`rpc/${name}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body)
  });
}

const secretCache = new Map<string, { value: string; expiresAt: number }>();

export async function getPaymentSecret(name: string) {
  const cached = secretCache.get(name);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value = await rpc<string>("hautlab_payment_secret", { p_name: name });
  if (typeof value !== "string" || !value.trim()) {
    throw new PaymentDatabaseError("Payment secret is not configured", 503, "secret_not_configured");
  }

  const normalized = value.trim();
  secretCache.set(name, { value: normalized, expiresAt: Date.now() + 5 * 60_000 });
  return normalized;
}

export async function getOptionalPaymentSecret(name: string) {
  try {
    return await getPaymentSecret(name);
  } catch (error) {
    if (
      error instanceof PaymentDatabaseError &&
      (error.message.includes("payment_secret_not_configured") || error.code === "secret_not_configured")
    ) {
      return null;
    }
    throw error;
  }
}

export async function getPaymentProviderConfig() {
  const query = new URLSearchParams({
    select: "provider,application_id,active_mode,production_owner_id,test_owner_id,created_at,updated_at",
    provider: "eq.mercado_pago",
    limit: "1"
  });
  const rows = await databaseRequest<PaymentProviderConfigRow[]>(`payment_provider_config?${query}`);
  const config = rows[0];
  if (!config) {
    throw new PaymentDatabaseError("Payment provider is not configured", 503, "provider_not_configured");
  }
  return config;
}

export async function setPaymentProviderOwner(mode: PaymentMode, ownerId: number) {
  const field = mode === "production" ? "production_owner_id" : "test_owner_id";
  const query = new URLSearchParams({ provider: "eq.mercado_pago" });
  const rows = await databaseRequest<PaymentProviderConfigRow[]>(`payment_provider_config?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ [field]: ownerId })
  });
  return rows[0] ?? null;
}

export async function createPaymentOrder(input: {
  id: string;
  productLabel: string;
  email: string;
  firstName: string;
  lastName: string;
  requestFingerprint: string;
  testMode: boolean;
}) {
  const rows = await rpc<PaymentOrderRow[]>("hautlab_payment_create_order", {
    p_id: input.id,
    p_product_code: "medical_assessment",
    p_product_label: input.productLabel,
    p_amount: 1300,
    p_currency: "MXN",
    p_payer_email: input.email,
    p_payer_first_name: input.firstName,
    p_payer_last_name: input.lastName,
    p_request_fingerprint: input.requestFingerprint,
    p_test_mode: input.testMode
  });
  const order = rows[0];
  if (!order) throw new PaymentDatabaseError("Payment order was not created", 500, "order_not_created");
  return order;
}

export async function setPaymentPreference(orderId: string, preferenceId: string) {
  const query = new URLSearchParams({
    id: `eq.${orderId}`,
    status: "eq.created"
  });
  const rows = await databaseRequest<PaymentOrderRow[]>(`payment_orders?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ preference_id: preferenceId, status: "preference_created" })
  });
  const order = rows[0];
  if (!order) {
    throw new PaymentDatabaseError("Payment preference was not recorded", 409, "preference_not_recorded");
  }
  return order;
}

export async function markPaymentOrderError(orderId: string, detail: string) {
  const query = new URLSearchParams({ id: `eq.${orderId}` });
  await databaseRequest<PaymentOrderRow[]>(`payment_orders?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ status: "error", status_detail: detail.slice(0, 160) })
  });
}

export async function getPaymentOrder(orderId: string) {
  const query = new URLSearchParams({
    select: "*",
    id: `eq.${orderId}`,
    limit: "1"
  });
  const rows = await databaseRequest<PaymentOrderRow[]>(`payment_orders?${query}`);
  return rows[0] ?? null;
}

export async function applyPaymentStatus(input: {
  orderId: string;
  paymentId: string;
  status: PaymentOrderStatus;
  statusDetail: string | null;
  liveMode: boolean;
  paymentMethodId: string | null;
  paymentTypeId: string | null;
  issuerId: string | null;
  paidAt: string | null;
  webhookEventId: string | null;
}) {
  const rows = await rpc<PaymentOrderRow[]>("hautlab_payment_apply_status", {
    p_order_id: input.orderId,
    p_mp_payment_id: input.paymentId,
    p_status: input.status,
    p_status_detail: input.statusDetail,
    p_live_mode: input.liveMode,
    p_payment_method_id: input.paymentMethodId,
    p_payment_type_id: input.paymentTypeId,
    p_issuer_id: input.issuerId,
    p_paid_at: input.paidAt,
    p_webhook_event_id: input.webhookEventId
  });
  const order = rows[0];
  if (!order) throw new PaymentDatabaseError("Payment status was not applied", 500, "status_not_applied");
  return order;
}

export async function createWebhookEvent(input: {
  deduplicationKey: string;
  providerEventId: string | null;
  requestId: string | null;
  topic: string;
  resourceId: string;
  liveMode: boolean | null;
  signatureValid: boolean;
}) {
  const rows = await databaseRequest<PaymentWebhookEventRow[]>("payment_webhook_events", {
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
}

export async function getWebhookEvent(deduplicationKey: string) {
  const query = new URLSearchParams({
    select: "*",
    deduplication_key: `eq.${deduplicationKey}`,
    limit: "1"
  });
  const rows = await databaseRequest<PaymentWebhookEventRow[]>(`payment_webhook_events?${query}`);
  return rows[0] ?? null;
}

export async function finishWebhookEvent(
  eventId: string,
  status: "processed" | "ignored" | "failed",
  errorCode: string | null = null
) {
  const query = new URLSearchParams({ id: `eq.${eventId}` });
  await databaseRequest<PaymentWebhookEventRow[]>(`payment_webhook_events?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      processing_status: status,
      error_code: errorCode?.slice(0, 120) ?? null,
      processed_at: new Date().toISOString()
    })
  });
}
