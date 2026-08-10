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
import { siteConfig } from "@/lib/siteConfig";

export const MEDICAL_ASSESSMENT_PRICE = 1300;
export const MEDICAL_ASSESSMENT_LABEL = "Valoración médica HAUTLAB";

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
      // Notifications must target the public production hostname even while a
      // protected preview initiates a test purchase.
      notification_url: `${siteConfig.url}/api/payments/mercado-pago/webhook`,
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
