import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-access";
import { getPaymentOrder } from "@/lib/payments/payment-db";
import {
  inspectMercadoPagoOrderRecovery,
  MercadoPagoIntegrationError,
  reconcileMercadoPagoPayment,
} from "@/lib/payments/mercado-pago";
import {
  getPaymentReceiptBySource,
  publicPaymentReceipt,
} from "@/lib/payments/receipt-db";
import {
  exceedsContentLength,
  isSameOriginRequest,
} from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  reference: z.string().uuid(),
  apply: z.boolean().optional().default(false),
});

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

function publicOrder(
  order: NonNullable<Awaited<ReturnType<typeof getPaymentOrder>>>,
) {
  return {
    reference: order.id,
    status: order.status,
    amount: Number(order.amount),
    currency: order.currency,
    testMode: order.test_mode,
    paymentId: order.mp_payment_id,
    paidAt: order.paid_at,
    updatedAt: order.updated_at,
  };
}

export async function POST(request: NextRequest) {
  const access = await getAdminAccess();
  if (!access.allowed) {
    return noStoreJson({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }
  if (exceedsContentLength(request, 8 * 1024)) {
    return noStoreJson({ error: "payload_too_large" }, { status: 413 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return noStoreJson({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    let order = await getPaymentOrder(parsed.data.reference);
    if (!order) {
      return noStoreJson({ error: "not_found" }, { status: 404 });
    }

    const inspection = await inspectMercadoPagoOrderRecovery(order);

    if (parsed.data.apply) {
      if (!inspection.selectedPaymentId) {
        return noStoreJson(
          {
            error:
              inspection.state === "ambiguous"
                ? "ambiguous_payment"
                : "payment_not_found",
            inspection,
          },
          { status: 409 },
        );
      }

      order = await reconcileMercadoPagoPayment({
        paymentId: inspection.selectedPaymentId,
        mode: order.test_mode ? "test" : "production",
      });
    }

    const receipt = await getPaymentReceiptBySource(
      "mercado_pago",
      order.external_reference,
    );

    return noStoreJson({
      order: publicOrder(order),
      inspection,
      applied: parsed.data.apply,
      receipt: receipt ? publicPaymentReceipt(receipt) : null,
    });
  } catch (error) {
    if (error instanceof MercadoPagoIntegrationError) {
      return noStoreJson(
        { error: error.code },
        { status: error.status },
      );
    }
    console.error("[payments-reconcile] failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return noStoreJson({ error: "reconciliation_failed" }, { status: 500 });
  }
}
