import "server-only";

import MercadoPagoConfig, {
  InvalidWebhookSignatureError,
  Payment,
  Preference,
  WebhookSignatureValidator
} from "mercadopago";
import {
  applyPaymentStatus,
  getOptionalPaymentSecret,
  getPaymentOrder,
  getPaymentProviderConfig,
  getPaymentSecret,
  setPaymentProviderOwner,
  type PaymentMode,
  type PaymentOrderRow,
  type PaymentOrderStatus
} from "@/lib/payments/payment-db";

export const MEDICAL_ASSESSMENT_PRICE = 1300;
export const MEDICAL_ASSESSMENT_LABEL = "Valoración médica HAUTLAB";
export const MERCADO_PAGO_WEBHOOK_URL =
  "https://mwnmopsybpvjnfnepadv.supabase.co/functions/v1/mercado-pago-webhook";

const supportedPaymentStatuses = new Set<PaymentOrderStatus>([
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

export class MercadoPagoIntegrationError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "mercado_pago_error", status = 502) {
    super(message);
    this.name = "MercadoPagoIntegrationError";
    this.code = code;
    this.status = status;
  }
}

function clientFor(accessToken: string) {
  return new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 8_000,
      maxRetries: 1,
      retryOn: [429, 500, 502, 503, 504],
      initialDelay: 250,
      maxDelay: 1_000,
      jitter: true
    }
  });
}

function modeSecretName(mode: PaymentMode, kind: "access_token" | "webhook_secret") {
  return `mp_${kind}_${mode}`;
}

export async function getActivePaymentMode() {
  const config = await getPaymentProviderConfig();
  return config.active_mode;
}

export async function createMercadoPagoPreference(input: {
  order: PaymentOrderRow;
  origin: string;
}) {
  const mode: PaymentMode = input.order.test_mode ? "test" : "production";
  const accessToken = await getPaymentSecret(modeSecretName(mode, "access_token"));
  const preference = new Preference(clientFor(accessToken));
  const reference = input.order.external_reference;
  const resultUrl = `${input.origin}/pagos/resultado?reference=${encodeURIComponent(reference)}`;

  const result = await preference.create({
    body: {
      items: [
        {
          id: "hautlab-medical-assessment",
          title: MEDICAL_ASSESSMENT_LABEL,
          description: "Anticipo para valoración médica en HAUTLAB",
          category_id: "services",
          quantity: 1,
          currency_id: "MXN",
          unit_price: MEDICAL_ASSESSMENT_PRICE
        }
      ],
      payer: {
        name: input.order.payer_first_name,
        surname: input.order.payer_last_name,
        email: input.order.payer_email
      },
      external_reference: reference,
      metadata: {
        order_id: reference,
        product_code: input.order.product_code
      },
      back_urls: {
        success: `${resultUrl}&result=success`,
        pending: `${resultUrl}&result=pending`,
        failure: `${resultUrl}&result=failure`
      },
      auto_return: "approved",
      // The public Edge Function remains reachable when Vercel previews are
      // protected or a production deployment is waiting for promotion.
      notification_url: MERCADO_PAGO_WEBHOOK_URL,
      statement_descriptor: "HAUTLAB"
    },
    requestOptions: {
      idempotencyKey: input.order.id
    }
  });

  if (!result.id) {
    throw new MercadoPagoIntegrationError("Mercado Pago did not return a preference id", "missing_preference_id");
  }

  // Checkout Pro test purchases run through the regular Mercado Pago checkout.
  // Test credentials and a test buyer keep the transaction non-productive;
  // sandbox_init_point is a legacy URL that currently fails for Mexico.
  const checkoutUrl = result.init_point;
  if (!checkoutUrl) {
    throw new MercadoPagoIntegrationError("Mercado Pago did not return a checkout URL", "missing_checkout_url");
  }

  if (typeof result.collector_id === "number") {
    const config = await getPaymentProviderConfig();
    const expectedOwnerId = mode === "test" ? config.test_owner_id : config.production_owner_id;
    if (expectedOwnerId && expectedOwnerId !== result.collector_id) {
      throw new MercadoPagoIntegrationError("Unexpected Mercado Pago collector", "collector_mismatch", 409);
    }
    if (!expectedOwnerId) await setPaymentProviderOwner(mode, result.collector_id);
  }

  return {
    preferenceId: result.id,
    checkoutUrl,
    mode
  };
}

function paymentAmountMatches(order: PaymentOrderRow, amount: number | undefined) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return false;
  return Math.abs(Number(order.amount) - amount) < 0.005;
}

export type MercadoPagoRecoveryCandidate = {
  paymentId: string;
  status: PaymentOrderStatus;
  statusDetail: string | null;
  amount: number;
  currency: string;
  liveMode: boolean;
  dateLastUpdated: string | null;
};

export type MercadoPagoRecoveryInspection = {
  state: "linked" | "ready" | "not_found" | "ambiguous";
  selectedPaymentId: string | null;
  candidates: MercadoPagoRecoveryCandidate[];
};

type MercadoPagoSearchPayment = {
  id?: string | number | null;
  external_reference?: string | null;
  status?: string | null;
  status_detail?: string | null;
  transaction_amount?: number | null;
  currency_id?: string | null;
  live_mode?: boolean | null;
  collector_id?: number | null;
  date_last_updated?: string | null;
};

async function searchMercadoPagoPaymentsByReference(
  order: PaymentOrderRow,
): Promise<MercadoPagoRecoveryCandidate[]> {
  const mode: PaymentMode = order.test_mode ? "test" : "production";
  const accessToken = await getPaymentSecret(modeSecretName(mode, "access_token"));
  const query = new URLSearchParams({
    external_reference: order.external_reference,
    sort: "date_last_updated",
    criteria: "desc",
    limit: "20",
    offset: "0",
  });
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/search?${query}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | { results?: MercadoPagoSearchPayment[] }
    | null;
  if (!response.ok) {
    throw new MercadoPagoIntegrationError(
      "Mercado Pago payment search failed",
      "payment_search_failed",
      response.status >= 500 ? 503 : 409,
    );
  }

  const config = await getPaymentProviderConfig();
  const expectedOwnerId =
    mode === "production" ? config.production_owner_id : config.test_owner_id;
  const expectedLiveMode = mode === "production";
  const deduplicated = new Map<string, MercadoPagoRecoveryCandidate>();

  for (const payment of Array.isArray(payload?.results) ? payload.results : []) {
    const paymentId = String(payment.id ?? "");
    const status = payment.status as PaymentOrderStatus | null | undefined;
    const amount = payment.transaction_amount;

    if (!/^\d{1,30}$/.test(paymentId)) continue;
    if (payment.external_reference !== order.external_reference) continue;
    if (!status || !supportedPaymentStatuses.has(status)) continue;
    if (typeof amount !== "number" || !paymentAmountMatches(order, amount)) continue;
    if (payment.currency_id !== order.currency) continue;
    if (payment.live_mode !== expectedLiveMode) continue;
    if (
      expectedOwnerId !== null &&
      typeof expectedOwnerId === "number" &&
      Number(payment.collector_id) !== expectedOwnerId
    ) {
      continue;
    }

    deduplicated.set(paymentId, {
      paymentId,
      status,
      statusDetail: payment.status_detail ?? null,
      amount,
      currency: payment.currency_id,
      liveMode: payment.live_mode,
      dateLastUpdated: payment.date_last_updated ?? null,
    });
  }

  return Array.from(deduplicated.values());
}

export async function inspectMercadoPagoOrderRecovery(
  order: PaymentOrderRow,
): Promise<MercadoPagoRecoveryInspection> {
  const candidates = await searchMercadoPagoPaymentsByReference(order);
  if (candidates.length === 0) {
    if (order.mp_payment_id) {
      return {
        state: "linked",
        selectedPaymentId: order.mp_payment_id,
        candidates,
      };
    }
    return { state: "not_found", selectedPaymentId: null, candidates };
  }

  const settledStatuses: PaymentOrderStatus[] = [
    "approved",
    "refunded",
    "charged_back",
  ];
  const activeStatuses: PaymentOrderStatus[] = [
    "pending",
    "authorized",
    "in_process",
    "in_mediation",
  ];
  const settled = candidates.filter((candidate) =>
    settledStatuses.includes(candidate.status),
  );
  const active = candidates.filter((candidate) =>
    activeStatuses.includes(candidate.status),
  );

  // A single settled payment is safe to recover only when there is no second
  // active attempt that could still settle and create a duplicate charge.
  if (settled.length === 1 && active.length === 0) {
    return {
      state: "ready",
      selectedPaymentId: settled[0].paymentId,
      candidates,
    };
  }
  if (settled.length > 1 || active.length > 1 || (settled.length && active.length)) {
    return { state: "ambiguous", selectedPaymentId: null, candidates };
  }
  if (active.length === 1) {
    return {
      state: "ready",
      selectedPaymentId: active[0].paymentId,
      candidates,
    };
  }

  const terminal = candidates.filter((candidate) =>
    candidate.status === "rejected" || candidate.status === "cancelled",
  );
  if (terminal.length === 1) {
    return {
      state: "ready",
      selectedPaymentId: terminal[0].paymentId,
      candidates,
    };
  }

  return { state: "ambiguous", selectedPaymentId: null, candidates };
}

export async function reconcileMercadoPagoPayment(input: {
  paymentId: string;
  mode: PaymentMode;
  webhookEventId?: string | null;
}) {
  const accessToken = await getPaymentSecret(modeSecretName(input.mode, "access_token"));
  const paymentClient = new Payment(clientFor(accessToken));
  const payment = await paymentClient.get({ id: input.paymentId });

  const reference = payment.external_reference;
  if (!reference || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reference)) {
    throw new MercadoPagoIntegrationError("Payment has no valid HAUTLAB reference", "invalid_external_reference", 409);
  }

  const order = await getPaymentOrder(reference);
  if (!order) {
    throw new MercadoPagoIntegrationError("Payment order was not found", "order_not_found", 404);
  }

  if (
    order.mp_payment_id &&
    order.mp_payment_id !== input.paymentId &&
    ["approved", "refunded", "charged_back"].includes(order.status)
  ) {
    throw new MercadoPagoIntegrationError(
      "Payment order is already settled with another payment",
      "settled_payment_conflict",
      409,
    );
  }

  const liveMode = payment.live_mode === true;
  const expectedLiveMode = input.mode === "production";
  if (liveMode !== expectedLiveMode || order.test_mode === liveMode) {
    throw new MercadoPagoIntegrationError("Payment environment does not match the order", "payment_mode_mismatch", 409);
  }
  if (!paymentAmountMatches(order, payment.transaction_amount) || payment.currency_id !== order.currency) {
    throw new MercadoPagoIntegrationError("Payment amount or currency does not match the order", "payment_amount_mismatch", 409);
  }
  if (!payment.id || String(payment.id) !== String(input.paymentId)) {
    throw new MercadoPagoIntegrationError("Payment identifier does not match", "payment_id_mismatch", 409);
  }
  if (!payment.status || !supportedPaymentStatuses.has(payment.status as PaymentOrderStatus)) {
    throw new MercadoPagoIntegrationError("Unsupported Mercado Pago payment status", "unsupported_payment_status", 409);
  }

  const config = await getPaymentProviderConfig();
  const expectedOwnerId = input.mode === "production" ? config.production_owner_id : config.test_owner_id;
  if (expectedOwnerId && payment.collector_id !== expectedOwnerId) {
    throw new MercadoPagoIntegrationError("Payment collector does not match HAUTLAB", "collector_mismatch", 409);
  }
  if (!expectedOwnerId && typeof payment.collector_id === "number") {
    await setPaymentProviderOwner(input.mode, payment.collector_id);
  }

  return applyPaymentStatus({
    orderId: order.id,
    paymentId: String(payment.id),
    status: payment.status as PaymentOrderStatus,
    statusDetail: payment.status_detail ?? null,
    liveMode,
    paymentMethodId: payment.payment_method_id ?? null,
    paymentTypeId: payment.payment_type_id ?? null,
    issuerId: payment.issuer_id ? String(payment.issuer_id) : null,
    paidAt: payment.date_approved ?? null,
    webhookEventId: input.webhookEventId ?? null
  });
}

export async function validateMercadoPagoWebhookSignature(input: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
  mode: PaymentMode;
}) {
  const secret = await getOptionalPaymentSecret(modeSecretName(input.mode, "webhook_secret"));
  if (!secret) return false;

  try {
    WebhookSignatureValidator.validate({
      xSignature: input.xSignature,
      xRequestId: input.xRequestId,
      dataId: input.dataId,
      secret,
      toleranceSeconds: 300
    });
    return true;
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      throw new MercadoPagoIntegrationError("Invalid Mercado Pago webhook signature", "invalid_signature", 401);
    }
    throw error;
  }
}
