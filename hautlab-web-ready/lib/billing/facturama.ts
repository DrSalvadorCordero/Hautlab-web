import "server-only";

type JsonRecord = Record<string, unknown>;
export type BillingMode = "test" | "production";

type BillingConfig = {
  provider: "facturama";
  active_mode: BillingMode;
  enabled: boolean;
  issuer_rfc: string;
  issuer_name: string;
  issuer_fiscal_regime: string;
  expedition_zip: string;
  default_series: string;
};

type InvoiceRequest = {
  id: string;
  source_provider: string;
  source_reference: string;
  amount: number | string;
  currency: "MXN";
  service_code: string | null;
  status: string;
  receiver_rfc: string | null;
  receiver_name: string | null;
  receiver_fiscal_regime: string | null;
  receiver_tax_zip_code: string | null;
  cfdi_use: string | null;
  payment_form: string | null;
  payment_method: "PUE" | "PPD";
};

type ServiceRow = {
  code: string;
  label: string;
  sat_product_code: string;
  unit_code: string;
  unit_label: string;
  tax_object: "01" | "02" | "03" | "04";
  tax_name: string | null;
  tax_rate: number | string | null;
  tax_exempt: boolean;
  enabled: boolean;
};

export class FacturamaBillingError extends Error {
  constructor(
    message: string,
    readonly code = "facturama_billing_error",
    readonly status = 502
  ) {
    super(message);
    this.name = "FacturamaBillingError";
  }
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

function dbConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!url || !serviceRoleKey) {
    throw new FacturamaBillingError("Billing database is not configured", "database_not_configured", 503);
  }
  return { url, serviceRoleKey };
}

async function dbRequest<T>(path: string, init: RequestInit = {}) {
  const { url, serviceRoleKey } = dbConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
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
    throw new FacturamaBillingError(
      String(record?.message ?? record?.hint ?? `Database HTTP ${response.status}`),
      String(record?.code ?? "billing_database_request_failed"),
      response.status
    );
  }
  return payload as T;
}

async function getBillingConfig() {
  const query = new URLSearchParams({
    provider: "eq.facturama",
    select: "provider,active_mode,enabled,issuer_rfc,issuer_name,issuer_fiscal_regime,expedition_zip,default_series",
    limit: "1"
  });
  const rows = await dbRequest<BillingConfig[]>(`billing_provider_config?${query}`);
  const config = rows[0];
  if (!config) throw new FacturamaBillingError("Billing provider is not configured", "billing_provider_not_configured", 503);
  return config;
}

async function billingSecret(mode: BillingMode, kind: "username" | "password") {
  const secret = await dbRequest<unknown>("rpc/hautlab_billing_secret", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ p_name: `facturama_${kind}_${mode}` })
  });
  if (typeof secret !== "string" || !secret.trim()) {
    throw new FacturamaBillingError("Facturama credential is not configured", "billing_secret_not_configured", 503);
  }
  return secret.trim();
}

async function facturamaRequest<T>(
  path: string,
  input: { billingMode: BillingMode; method?: string; headers?: HeadersInit; body?: BodyInit | null }
) {
  const [username, password] = await Promise.all([
    billingSecret(input.billingMode, "username"),
    billingSecret(input.billingMode, "password")
  ]);
  const base = input.billingMode === "production"
    ? "https://api.facturama.mx"
    : "https://apisandbox.facturama.mx";
  const auth = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
  const response = await fetch(`${base}${path}`, {
    method: input.method,
    body: input.body,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(input.headers ?? {})
    },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store"
  });
  const text = await response.text();
  const payload = text ? safeJson(text) : null;
  if (!response.ok) {
    const record = asRecord(payload);
    const message = String(record?.Message ?? record?.message ?? `Facturama HTTP ${response.status}`);
    throw new FacturamaBillingError(message, "facturama_request_failed", response.status);
  }
  return payload as T;
}

function money(value: number | string) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new FacturamaBillingError("Invalid invoice amount", "invalid_amount", 400);
  return Number(n.toFixed(2));
}

function normalizeReceiverName(value: string) {
  const name = value.trim().toUpperCase();
  if (name.length < 3 || name.length > 254) {
    throw new FacturamaBillingError("Invalid receiver name", "invalid_receiver_name", 400);
  }
  return name;
}

function buildTax(service: ServiceRow, base: number) {
  if (service.tax_object !== "02") return [];
  if (!service.tax_name || service.tax_rate === null) {
    throw new FacturamaBillingError("Service tax profile is incomplete", "service_tax_profile_incomplete", 409);
  }
  const rate = Number(service.tax_rate);
  if (!Number.isFinite(rate) || rate < 0) {
    throw new FacturamaBillingError("Invalid service tax rate", "invalid_service_tax_rate", 409);
  }
  return [{
    Name: service.tax_name,
    Rate: rate,
    Total: Number((base * rate).toFixed(2)),
    Base: base,
    IsRetention: false,
    IsFederalTax: true
  }];
}

function buildCfdiPayload(config: BillingConfig, request: InvoiceRequest, service: ServiceRow) {
  if (!request.receiver_rfc || !request.receiver_name || !request.receiver_fiscal_regime ||
      !request.receiver_tax_zip_code || !request.cfdi_use || !request.payment_form) {
    throw new FacturamaBillingError("Invoice fiscal data is incomplete", "invoice_not_ready", 409);
  }
  if (!service.enabled) {
    throw new FacturamaBillingError("Service is not enabled for invoicing", "service_not_enabled", 409);
  }
  const amount = money(request.amount);
  const taxes = buildTax(service, amount);
  const taxTotal = taxes.reduce((sum, tax) => sum + Number(tax.Total), 0);
  const total = Number((amount + taxTotal).toFixed(2));

  return {
    Receiver: {
      Name: normalizeReceiverName(request.receiver_name),
      CfdiUse: request.cfdi_use,
      Rfc: request.receiver_rfc.toUpperCase(),
      FiscalRegime: request.receiver_fiscal_regime,
      TaxZipCode: request.receiver_tax_zip_code
    },
    CfdiType: "I",
    NameId: 1,
    ExpeditionPlace: config.expedition_zip,
    Serie: config.default_series,
    PaymentForm: request.payment_form,
    PaymentMethod: request.payment_method,
    Exportation: "01",
    Currency: "MXN",
    Items: [{
      Quantity: 1,
      ProductCode: service.sat_product_code,
      UnitCode: service.unit_code,
      Unit: service.unit_label,
      Description: service.label,
      UnitPrice: amount,
      Subtotal: amount,
      TaxObject: service.tax_object,
      Taxes: taxes,
      Total: total
    }]
  };
}

async function loadInvoiceRequest(invoiceRequestId: string) {
  const query = new URLSearchParams({
    id: `eq.${invoiceRequestId}`,
    select: "id,source_provider,source_reference,amount,currency,service_code,status,receiver_rfc,receiver_name,receiver_fiscal_regime,receiver_tax_zip_code,cfdi_use,payment_form,payment_method",
    limit: "1"
  });
  const rows = await dbRequest<InvoiceRequest[]>(`billing_invoice_requests?${query}`);
  const request = rows[0];
  if (!request) throw new FacturamaBillingError("Invoice request not found", "invoice_request_not_found", 404);
  return request;
}

async function loadService(code: string) {
  const query = new URLSearchParams({
    code: `eq.${code}`,
    select: "code,label,sat_product_code,unit_code,unit_label,tax_object,tax_name,tax_rate,tax_exempt,enabled",
    limit: "1"
  });
  const rows = await dbRequest<ServiceRow[]>(`billing_service_catalog?${query}`);
  const service = rows[0];
  if (!service) throw new FacturamaBillingError("Billing service is not configured", "billing_service_not_configured", 409);
  return service;
}

async function updateInvoice(id: string, patch: JsonRecord) {
  const query = new URLSearchParams({ id: `eq.${id}` });
  const rows = await dbRequest<JsonRecord[]>(`billing_invoice_requests?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch)
  });
  return rows[0] ?? null;
}

export async function verifyFacturamaAccount() {
  const config = await getBillingConfig();
  return facturamaRequest<JsonRecord>("/api/Account/UserInfo", {
    billingMode: config.active_mode,
    method: "GET"
  });
}

export async function issueInvoice(invoiceRequestId: string) {
  const config = await getBillingConfig();
  if (!config.enabled) {
    throw new FacturamaBillingError("Billing issuance is not enabled", "billing_not_enabled", 409);
  }
  const request = await loadInvoiceRequest(invoiceRequestId);
  if (request.status === "issued") {
    throw new FacturamaBillingError("Invoice was already issued", "invoice_already_issued", 409);
  }
  if (request.status !== "ready" && request.status !== "failed") {
    throw new FacturamaBillingError("Invoice is not ready", "invoice_not_ready", 409);
  }
  if (!request.service_code) {
    throw new FacturamaBillingError("Invoice service is missing", "invoice_service_missing", 409);
  }
  const service = await loadService(request.service_code);
  const payload = buildCfdiPayload(config, request, service);
  await updateInvoice(request.id, { status: "issuing", error_code: null, error_message: null });

  try {
    const result = await facturamaRequest<JsonRecord>("/3/cfdis", {
      billingMode: config.active_mode,
      method: "POST",
      body: JSON.stringify(payload)
    });
    const id = typeof result.Id === "string" ? result.Id : typeof result.id === "string" ? result.id : null;
    const complement = asRecord(result.Complement ?? result.complement);
    const taxStamp = asRecord(complement?.TaxStamp ?? complement?.taxStamp);
    const uuidValue = String(taxStamp?.Uuid ?? taxStamp?.UUID ?? result.Uuid ?? result.UUID ?? "").trim();

    if (!id) {
      throw new FacturamaBillingError("Facturama returned no CFDI id", "missing_facturama_id", 502);
    }

    const updated = await updateInvoice(request.id, {
      status: "issued",
      facturama_id: id,
      ...(uuidValue ? { fiscal_uuid: uuidValue } : {}),
      provider_status: "issued",
      issued_at: new Date().toISOString()
    });
    return { invoice: updated, provider: result };
  } catch (error) {
    const code = error instanceof FacturamaBillingError ? error.code : "unexpected_error";
    const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown billing error";
    await updateInvoice(request.id, { status: "failed", error_code: code, error_message: message });
    throw error;
  }
}

export async function downloadInvoiceDocument(
  facturamaId: string,
  format: "pdf" | "xml",
  mode?: BillingMode
) {
  const config = await getBillingConfig();
  const activeMode = mode ?? config.active_mode;
  const [username, password] = await Promise.all([
    billingSecret(activeMode, "username"),
    billingSecret(activeMode, "password")
  ]);
  const base = activeMode === "production" ? "https://api.facturama.mx" : "https://apisandbox.facturama.mx";
  const auth = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
  const response = await fetch(`${base}/Cfdi/${format}/issued/${encodeURIComponent(facturamaId)}`, {
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store"
  });
  if (!response.ok) {
    throw new FacturamaBillingError(`Facturama document HTTP ${response.status}`, "facturama_document_failed", response.status);
  }
  return Buffer.from(await response.arrayBuffer());
}
