import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createPaymentOrder,
  getPaymentSecret,
  markPaymentOrderError,
  PaymentDatabaseError,
  setPaymentPreference
} from "@/lib/payments/payment-db";
import {
  createMercadoPagoPreference,
  getActivePaymentMode,
  MEDICAL_ASSESSMENT_LABEL,
  MercadoPagoIntegrationError
} from "@/lib/payments/mercado-pago";
import { exceedsContentLength, isSameOriginRequest } from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}'’ .-]*$/u;
const checkoutSchema = z.object({
  firstName: z.string().trim().min(2).max(80).regex(namePattern),
  lastName: z.string().trim().min(2).max(120).regex(namePattern),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  acceptPrivacy: z.literal(true)
});

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("Referrer-Policy", "no-referrer");
  return NextResponse.json(value, { ...init, headers });
}

async function parseJson(request: Request) {
  if (exceedsContentLength(request, 8 * 1024)) throw new Error("payload_too_large");
  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > 8 * 1024) throw new Error("payload_too_large");
  return JSON.parse(body) as unknown;
}

function requestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

async function requestFingerprint(request: Request) {
  const secret = await getPaymentSecret("payment_rate_limit_secret");
  return createHmac("sha256", secret).update(requestIp(request)).digest("hex");
}

function errorResponse(error: unknown) {
  if (error instanceof PaymentDatabaseError && error.message.includes("payment_rate_limit")) {
    return noStoreJson(
      { error: "rate_limit", message: "Espera unos minutos antes de volver a intentarlo." },
      { status: 429 }
    );
  }
  if (error instanceof PaymentDatabaseError && error.code === "database_not_configured") {
    return noStoreJson({ error: "payment_unavailable" }, { status: 503 });
  }
  if (error instanceof MercadoPagoIntegrationError) {
    return noStoreJson({ error: "payment_unavailable" }, { status: error.status >= 500 ? 503 : error.status });
  }
  return noStoreJson({ error: "payment_unavailable" }, { status: 503 });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }

  let input: z.infer<typeof checkoutSchema>;
  try {
    input = checkoutSchema.parse(await parseJson(request));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "invalid_payload";
    return noStoreJson(
      { error: reason === "payload_too_large" ? reason : "invalid_payload" },
      { status: 400 }
    );
  }

  const orderId = randomUUID();
  let orderCreated = false;

  try {
    const mode = await getActivePaymentMode();
    const order = await createPaymentOrder({
      id: orderId,
      productLabel: MEDICAL_ASSESSMENT_LABEL,
      email: input.email,
      firstName: input.firstName.replace(/\s+/g, " "),
      lastName: input.lastName.replace(/\s+/g, " "),
      requestFingerprint: await requestFingerprint(request),
      testMode: mode === "test"
    });
    orderCreated = true;

    const preference = await createMercadoPagoPreference({
      order,
      origin: new URL(request.url).origin
    });
    await setPaymentPreference(order.id, preference.preferenceId);

    return noStoreJson({
      checkoutUrl: preference.checkoutUrl,
      reference: order.id,
      testMode: preference.mode === "test"
    });
  } catch (error) {
    const code =
      error instanceof MercadoPagoIntegrationError
        ? error.code
        : error instanceof PaymentDatabaseError
          ? error.code
          : "unexpected_error";
    console.error("Mercado Pago preference creation failed", { code });

    if (orderCreated) {
      try {
        await markPaymentOrderError(orderId, code);
      } catch {
        console.error("Could not mark Mercado Pago order as failed", { orderId });
      }
    }

    return errorResponse(error);
  }
}
