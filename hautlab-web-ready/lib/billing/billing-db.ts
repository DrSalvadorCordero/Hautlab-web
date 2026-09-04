import "server-only";

type JsonRecord = Record<string, unknown>;

export class BillingDatabaseError extends Error {
  constructor(
    message: string,
    readonly code = "billing_database_error",
    readonly status = 502
  ) {
    super(message);
    this.name = "BillingDatabaseError";
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

function databaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!url || !serviceRoleKey) {
    throw new BillingDatabaseError(
      "Billing database is not configured",
      "database_not_configured",
      503
    );
  }
  return { url, serviceRoleKey };
}

export function isBillingDatabaseConfigured() {
  try {
    databaseConfig();
    return true;
  } catch {
    return false;
  }
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
    throw new BillingDatabaseError(
      String(record?.message ?? record?.hint ?? `Database HTTP ${response.status}`),
      String(record?.code ?? "billing_database_request_failed"),
      response.status
    );
  }
  return payload as T;
}

export async function getBillingSnapshot(limit = 100) {
  const safeLimit = Math.max(1, Math.min(250, Math.trunc(limit)));
  const providerQuery = new URLSearchParams({
    select: "provider,active_mode,enabled,issuer_rfc,issuer_name,issuer_fiscal_regime,expedition_zip,default_series,updated_at",
    provider: "eq.facturama",
    limit: "1"
  });
  const servicesQuery = new URLSearchParams({
    select: "code,label,sat_product_code,unit_code,unit_label,tax_object,tax_name,tax_rate,tax_exempt,enabled,fiscal_reviewed_at",
    order: "label.asc"
  });
  const invoicesQuery = new URLSearchParams({
    select: "id,source_provider,source_reference,source_payment_id,source_order_id,amount,currency,service_code,status,receiver_rfc,receiver_name,receiver_fiscal_regime,receiver_tax_zip_code,cfdi_use,payment_form,payment_method,facturama_id,fiscal_uuid,provider_status,error_code,error_message,issued_at,cancelled_at,requested_at,updated_at",
    order: "requested_at.desc",
    limit: String(safeLimit)
  });

  const [providers, services, invoices] = await Promise.all([
    databaseRequest<JsonRecord[]>(`billing_provider_config?${providerQuery}`),
    databaseRequest<JsonRecord[]>(`billing_service_catalog?${servicesQuery}`),
    databaseRequest<JsonRecord[]>(`billing_invoice_requests?${invoicesQuery}`)
  ]);

  return {
    provider: providers[0] ?? null,
    services,
    invoices
  };
}

export async function setBillingReceiver(input: {
  invoiceRequestId: string;
  receiverRfc: string;
  receiverName: string;
  receiverFiscalRegime: string;
  receiverTaxZipCode: string;
  cfdiUse: string;
  paymentForm?: string | null;
}) {
  const rows = await databaseRequest<JsonRecord[]>("rpc/hautlab_billing_set_receiver", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      p_invoice_request_id: input.invoiceRequestId,
      p_receiver_rfc: input.receiverRfc,
      p_receiver_name: input.receiverName,
      p_receiver_fiscal_regime: input.receiverFiscalRegime,
      p_receiver_tax_zip_code: input.receiverTaxZipCode,
      p_cfdi_use: input.cfdiUse,
      p_payment_form: input.paymentForm ?? null
    })
  });
  const invoice = rows[0];
  if (!invoice) {
    throw new BillingDatabaseError("Invoice request was not updated", "invoice_request_not_updated", 404);
  }
  return invoice;
}

export async function setBillingService(input: {
  invoiceRequestId: string;
  serviceCode: string;
}) {
  const serviceQuery = new URLSearchParams({
    code: `eq.${input.serviceCode}`,
    enabled: "eq.true",
    select: "code",
    limit: "1"
  });
  const services = await databaseRequest<JsonRecord[]>(`billing_service_catalog?${serviceQuery}`);
  if (!services[0]) {
    throw new BillingDatabaseError("Billing service is not enabled", "billing_service_not_enabled", 409);
  }

  const invoiceQuery = new URLSearchParams({
    id: `eq.${input.invoiceRequestId}`,
    select: "id,receiver_rfc,receiver_name,receiver_fiscal_regime,receiver_tax_zip_code,cfdi_use,payment_form,status",
    limit: "1"
  });
  const invoiceRows = await databaseRequest<JsonRecord[]>(`billing_invoice_requests?${invoiceQuery}`);
  const invoice = invoiceRows[0];
  if (!invoice) {
    throw new BillingDatabaseError("Invoice request not found", "invoice_request_not_found", 404);
  }
  const status = String(invoice.status ?? "");
  if (!["pending_fiscal_data", "ready", "failed"].includes(status)) {
    throw new BillingDatabaseError("Invoice request cannot be edited", "invoice_request_not_editable", 409);
  }

  const ready = Boolean(
    invoice.receiver_rfc &&
    invoice.receiver_name &&
    invoice.receiver_fiscal_regime &&
    invoice.receiver_tax_zip_code &&
    invoice.cfdi_use &&
    invoice.payment_form
  );
  const patchQuery = new URLSearchParams({ id: `eq.${input.invoiceRequestId}` });
  const rows = await databaseRequest<JsonRecord[]>(`billing_invoice_requests?${patchQuery}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      service_code: input.serviceCode,
      status: ready ? "ready" : "pending_fiscal_data",
      error_code: null,
      error_message: null
    })
  });
  return rows[0] ?? invoice;
}

export async function getBillingInvoiceForDocument(invoiceRequestId: string) {
  const query = new URLSearchParams({
    id: `eq.${invoiceRequestId}`,
    select: "id,status,facturama_id,fiscal_uuid,source_reference",
    limit: "1"
  });
  const rows = await databaseRequest<JsonRecord[]>(`billing_invoice_requests?${query}`);
  const invoice = rows[0];
  if (!invoice) {
    throw new BillingDatabaseError("Invoice request not found", "invoice_request_not_found", 404);
  }
  return invoice;
}
