import "server-only";

export type PaymentReceiptProvider = "mercado_pago" | "mercado_pago_point";
export type PaymentReceiptStatus = "issued" | "refunded" | "charged_back";

export type PaymentReceiptRow = {
  id: string;
  receipt_number: number | string;
  source_provider: PaymentReceiptProvider;
  source_reference: string;
  source_payment_id: string | null;
  source_order_id: string | null;
  payment_status: string;
  receipt_status: PaymentReceiptStatus;
  amount: number | string;
  currency: "MXN";
  paid_at: string;
  payment_method_id: string | null;
  payment_type_id: string | null;
  installments: number | null;
  live_mode: boolean | null;
  test_mode: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentReceiptItemRow = {
  receipt_id: string;
  line_no: number;
  item_code: string | null;
  label: string;
  quantity: number | string;
  unit_price: number | string;
  discount_amount: number | string;
  line_total: number | string;
};

type DatabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

function getConfig(): DatabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && serviceRoleKey ? { url, serviceRoleKey } : null;
}

async function databaseRequest<T>(path: string): Promise<T> {
  const config = getConfig();
  if (!config) throw new Error("receipt_database_not_configured");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`receipt_database_${response.status}`);
  return (await response.json()) as T;
}

export function formatReceiptNumber(receiptNumber: number | string) {
  const numeric = Number(receiptNumber);
  if (!Number.isInteger(numeric) || numeric < 1) return String(receiptNumber);
  return `HLR-${String(numeric).padStart(6, "0")}`;
}

export async function getPaymentReceiptBySource(
  provider: PaymentReceiptProvider,
  sourceReference: string,
) {
  const query = new URLSearchParams({
    select: "*",
    source_provider: `eq.${provider}`,
    source_reference: `eq.${sourceReference}`,
    limit: "1",
  });
  const rows = await databaseRequest<PaymentReceiptRow[]>(
    `payment_receipts?${query}`,
  );
  const receipt = rows[0] ?? null;
  if (!receipt) return null;

  const itemQuery = new URLSearchParams({
    select:
      "receipt_id,line_no,item_code,label,quantity,unit_price,discount_amount,line_total",
    receipt_id: `eq.${receipt.id}`,
    order: "line_no.asc",
  });
  const items = await databaseRequest<PaymentReceiptItemRow[]>(
    `payment_receipt_items?${itemQuery}`,
  );

  return { receipt, items };
}

export function publicPaymentReceipt(
  value: NonNullable<Awaited<ReturnType<typeof getPaymentReceiptBySource>>>,
) {
  return {
    number: formatReceiptNumber(value.receipt.receipt_number),
    status: value.receipt.receipt_status,
    paymentStatus: value.receipt.payment_status,
    amount: Number(value.receipt.amount),
    currency: value.receipt.currency,
    paidAt: value.receipt.paid_at,
    paymentMethodId: value.receipt.payment_method_id,
    paymentTypeId: value.receipt.payment_type_id,
    installments: value.receipt.installments,
    testMode: value.receipt.test_mode,
    items: value.items.map((item) => ({
      line: item.line_no,
      code: item.item_code,
      label: item.label,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      discount: Number(item.discount_amount),
      total: Number(item.line_total),
    })),
  };
}
