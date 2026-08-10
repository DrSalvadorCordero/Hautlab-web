import { NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentOrder } from "@/lib/payments/payment-db";
import { reconcileMercadoPagoPayment } from "@/lib/payments/mercado-pago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  reference: z.string().uuid(),
  paymentId: z.string().regex(/^\d{1,30}$/).optional()
});

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

function publicOrder(order: NonNullable<Awaited<ReturnType<typeof getPaymentOrder>>>) {
  return {
    reference: order.id,
    status: order.status,
    amount: Number(order.amount),
    currency: order.currency,
    product: order.product_label,
    testMode: order.test_mode,
    updatedAt: order.updated_at
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    reference: url.searchParams.get("reference"),
    paymentId: url.searchParams.get("payment_id") ?? url.searchParams.get("collection_id") ?? undefined
  });
  if (!parsed.success) {
    return noStoreJson({ error: "invalid_query" }, { status: 400 });
  }

  let order = await getPaymentOrder(parsed.data.reference);
  if (!order) return noStoreJson({ error: "not_found" }, { status: 404 });

  if (
    parsed.data.paymentId &&
    (!order.mp_payment_id || order.mp_payment_id === parsed.data.paymentId) &&
    !["approved", "refunded", "charged_back", "cancelled"].includes(order.status)
  ) {
    try {
      order = await reconcileMercadoPagoPayment({
        paymentId: parsed.data.paymentId,
        mode: order.test_mode ? "test" : "production"
      });
    } catch (error) {
      const reason = error instanceof Error ? error.name : "unknown";
      console.error("Mercado Pago redirect reconciliation failed", { reason });
    }
  }

  return noStoreJson(publicOrder(order));
}
