import "server-only";

type JsonRecord = Record<string, unknown>;
export type PointMode = "test" | "production";
export type PointOrderStatus =
  | "created"
  | "at_terminal"
  | "processed"
  | "action_required"
  | "failed"
  | "canceled"
  | "refunded"
  | "expired";

type PointProviderConfig = {
  provider: "mercado_pago_point";
  application_id: string;
  active_mode: PointMode;
  enabled: boolean;
  terminal_id: string | null;
  store_id: string | null;
  pos_id: string | null;
};

type PointOrderRow = {
  id: string;
  external_reference: string;
  mp_order_id: string | null;
  terminal_id: string;
  description: string;
  amount: number | string;
  currency: "MXN";
  status: PointOrderStatus;
  status_detail: string | null;
  test_mode: boolean;
};

export class MercadoPagoPointError extends Error {
  constructor(
    message: string,
    readonly code = "mercado_pago_point_error",
    readonly status = 502
  ) {
    super(message);
    this.name = "MercadoPagoPointError";
  }
}

function databaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!url || !serviceRoleKey) {
    throw new MercadoPagoPointError(
      "Point database is not configured",
      "database_not_configured",
      503
    );
  }
  return { url, serviceRoleKey };
}

async function databaseRequest<T>(path: string, init: RequestInit = {}) {
  const config = databaseConfig();
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });
  const text = await response.text();
  const payload = text ? safeJson(text) : null;
  if (!response.ok) {
    const record = asRecord(payload);
    throw new MercadoPagoPointError(
      String(record?.message ?? record?.hint ?? `Database HTTP ${response.status}`),
      String(record?.code ?? "point_database_request_failed"),
      response.status
    );
  }
  return payload as T;
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function pointExternalReference() {
  return `hautlab_${crypto.randomUUID().replaceAll("-", "")}`;
}

function normalizeAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999.99) {
    throw new MercadoPagoPointError("Invalid Point amount", "invalid_amount", 400);
  }
  return amount.toFixed(2);
}

async function pointSecret(mode: PointMode, kind: "access_token" | "webhook_secret") {
  const name = `mp_point_${kind}_${mode}`;
  const rows = await databaseRequest<unknown>("rpc/hautlab_point_secret", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ p_name: name })
  });
  if (typeof rows !== "string" || !rows.trim()) {
    throw new MercadoPagoPointError(
      `Point ${kind} is not configured`,
      "point_secret_not_configured",
      503
    );
  }
  return rows.trim();
}

async function mercadoPagoRequest<T>(
  path: string,
  input: {
    mode: PointMode;
    method?: "GET" | "POST" | "PATCH";
    body?: JsonRecord;
    idempotencyKey?: string;
    headers?: Record<string, string>;
  }
) {
  const accessToken = await pointSecret(input.mode, "access_token");
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    method: input.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "X-Idempotency-Key": input.idempotencyKey } : {}),
      ...(input.headers ?? {})
    },
    body: input.body ? JSON.stringify(input.body) : undefined,
    signal: AbortSignal.timeout(10_000),
    cache: "no-store"
  });
  const text = await response.text();
  const payload = text ? safeJson(text) : null;
  if (!response.ok) {
    const record = asRecord(payload);
    const errors = Array.isArray(record?.errors) ? record.errors : [];
    const firstError = asRecord(errors[0]);
    throw new MercadoPagoPointError(
      String(firstError?.message ?? record?.message ?? `Mercado Pago HTTP ${response.status}`),
      String(firstError?.code ?? record?.error ?? "mercado_pago_point_request_failed"),
      response.status
    );
  }
  return payload as T;
}

export async function getPointProviderConfig() {
  const query = new URLSearchParams({
    select: "provider,application_id,active_mode,enabled,terminal_id,store_id,pos_id",
    provider: "eq.mercado_pago_point",
    limit: "1"
  });
  const rows = await databaseRequest<PointProviderConfig[]>(`mp_point_provider_config?${query}`);
  const config = rows[0];
  if (!config) {
    throw new MercadoPagoPointError("Point provider is not configured", "point_provider_not_configured", 503);
  }
  return config;
}

export async function listMercadoPagoPointTerminals() {
  const config = await getPointProviderConfig();
  return mercadoPagoRequest<JsonRecord>("/terminals/v1/list", {
    mode: config.active_mode
  });
}

export async function setMercadoPagoPointTerminalMode(
  terminalId: string,
  operatingMode: "PDV" | "STANDALONE"
) {
  const config = await getPointProviderConfig();
  if (!terminalId.trim()) {
    throw new MercadoPagoPointError("Terminal id is required", "terminal_id_required", 400);
  }
  return mercadoPagoRequest<JsonRecord>("/terminals/v1/setup", {
    mode: config.active_mode,
    method: "PATCH",
    body: {
      terminals: [{ id: terminalId.trim(), operating_mode: operatingMode }]
    }
  });
}

export async function createMercadoPagoPointOrder(input: {
  amount: number;
  description: string;
  printTicket?: boolean;
  paymentType?: "credit_card" | "debit_card" | "qr";
  installments?: number;
}) {
  const config = await getPointProviderConfig();
  if (!config.enabled) {
    throw new MercadoPagoPointError(
      "Point payments are not enabled yet",
      "point_not_enabled",
      409
    );
  }
  if (!config.terminal_id) {
    throw new MercadoPagoPointError(
      "No Point terminal has been selected",
      "point_terminal_not_selected",
      409
    );
  }

  const amount = normalizeAmount(input.amount);
  const description = input.description.trim().slice(0, 150);
  if (!description) {
    throw new MercadoPagoPointError("Description is required", "description_required", 400);
  }
  if (input.installments !== undefined && (!Number.isInteger(input.installments) || input.installments < 1)) {
    throw new MercadoPagoPointError("Invalid installments", "invalid_installments", 400);
  }
  if (input.installments !== undefined && input.paymentType !== "credit_card") {
    throw new MercadoPagoPointError(
      "Installments require credit_card",
      "installments_require_credit_card",
      400
    );
  }

  const internalId = crypto.randomUUID();
  const externalReference = pointExternalReference();
  const testMode = config.active_mode === "test";

  const createdRows = await databaseRequest<PointOrderRow[]>("mp_point_orders", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      id: internalId,
      external_reference: externalReference,
      terminal_id: config.terminal_id,
      description,
      amount,
      currency: "MXN",
      status: "created",
      test_mode: testMode
    })
  });
  const localOrder = createdRows[0];
  if (!localOrder) {
    throw new MercadoPagoPointError("Point order was not recorded", "point_order_not_recorded", 500);
  }

  const paymentMethod = input.paymentType
    ? {
        default_type: input.paymentType,
        ...(input.installments !== undefined ? { default_installments: input.installments } : {})
      }
    : undefined;

  try {
    const providerOrder = await mercadoPagoRequest<JsonRecord>("/v1/orders", {
      mode: config.active_mode,
      method: "POST",
      idempotencyKey: internalId,
      body: {
        type: "point",
        external_reference: externalReference,
        description,
        transactions: {
          payments: [{ amount }]
        },
        config: {
          point: {
            terminal_id: config.terminal_id,
            print_on_terminal: input.printTicket === false ? "no_ticket" : "seller_ticket"
          },
          ...(paymentMethod ? { payment_method: paymentMethod } : {})
        }
      }
    });

    const mpOrderId = typeof providerOrder.id === "string" ? providerOrder.id : "";
    if (!mpOrderId) {
      throw new MercadoPagoPointError("Mercado Pago returned no order id", "missing_point_order_id", 502);
    }
    const status = typeof providerOrder.status === "string" ? providerOrder.status : "created";
    const statusDetail = typeof providerOrder.status_detail === "string" ? providerOrder.status_detail : null;
    const query = new URLSearchParams({ id: `eq.${internalId}` });
    const rows = await databaseRequest<PointOrderRow[]>(`mp_point_orders?${query}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        mp_order_id: mpOrderId,
        status,
        status_detail: statusDetail,
        live_mode: config.active_mode === "production",
        provider_created_at: typeof providerOrder.created_date === "string" ? providerOrder.created_date : null,
        provider_updated_at: typeof providerOrder.last_updated_date === "string" ? providerOrder.last_updated_date : null
      })
    });

    return { localOrder: rows[0] ?? localOrder, providerOrder };
  } catch (error) {
    const query = new URLSearchParams({ id: `eq.${internalId}` });
    await databaseRequest(`mp_point_orders?${query}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        status: "failed",
        status_detail: error instanceof MercadoPagoPointError ? error.code : "create_order_failed"
      })
    }).catch(() => undefined);
    throw error;
  }
}

export async function getMercadoPagoPointOrder(mpOrderId: string) {
  const config = await getPointProviderConfig();
  if (!/^ORD[A-Za-z0-9_-]+$/.test(mpOrderId)) {
    throw new MercadoPagoPointError("Invalid Point order id", "invalid_point_order_id", 400);
  }
  return mercadoPagoRequest<JsonRecord>(`/v1/orders/${encodeURIComponent(mpOrderId)}`, {
    mode: config.active_mode
  });
}

export async function cancelMercadoPagoPointOrder(mpOrderId: string, allowAtTerminal = false) {
  const config = await getPointProviderConfig();
  return mercadoPagoRequest<JsonRecord>(`/v1/orders/${encodeURIComponent(mpOrderId)}/cancel`, {
    mode: config.active_mode,
    method: "POST",
    idempotencyKey: crypto.randomUUID(),
    headers: allowAtTerminal ? { "x-allow-cancelable-status": "at_terminal" } : undefined
  });
}

export async function refundMercadoPagoPointOrder(mpOrderId: string) {
  const config = await getPointProviderConfig();
  return mercadoPagoRequest<JsonRecord>(`/v1/orders/${encodeURIComponent(mpOrderId)}/refund`, {
    mode: config.active_mode,
    method: "POST",
    idempotencyKey: crypto.randomUUID()
  });
}
