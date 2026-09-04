import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-access";
import {
  BillingDatabaseError,
  getBillingSnapshot,
  isBillingDatabaseConfigured,
  setBillingReceiver,
  setBillingService
} from "@/lib/billing/billing-db";
import {
  FacturamaBillingError,
  issueInvoice,
  verifyFacturamaAccount
} from "@/lib/billing/facturama";
import { exceedsContentLength, isSameOriginRequest } from "@/lib/server/admin-request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify_provider") }).strict(),
  z.object({
    action: z.literal("set_receiver"),
    invoiceRequestId: z.string().uuid(),
    receiverRfc: z.string().trim().min(12).max(13),
    receiverName: z.string().trim().min(3).max(254),
    receiverFiscalRegime: z.string().regex(/^\d{3}$/),
    receiverTaxZipCode: z.string().regex(/^\d{5}$/),
    cfdiUse: z.string().trim().regex(/^[A-Za-z0-9]{3}$/),
    paymentForm: z.string().regex(/^\d{2}$/).nullable().optional()
  }).strict(),
  z.object({
    action: z.literal("set_service"),
    invoiceRequestId: z.string().uuid(),
    serviceCode: z.string().trim().min(2).max(80)
  }).strict(),
  z.object({
    action: z.literal("issue"),
    invoiceRequestId: z.string().uuid()
  }).strict()
]);

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

async function parseJson(request: Request) {
  if (exceedsContentLength(request, 16 * 1024)) throw new Error("payload_too_large");
  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > 16 * 1024) throw new Error("payload_too_large");
  return JSON.parse(body) as unknown;
}

function billingFailure(error: unknown) {
  const code = error instanceof BillingDatabaseError || error instanceof FacturamaBillingError
    ? error.code
    : "billing_unavailable";
  const status = error instanceof BillingDatabaseError || error instanceof FacturamaBillingError
    ? error.status
    : 502;
  console.error("Billing admin request failed", { code, status });

  const safeStatus = status >= 400 && status <= 599 ? status : 502;
  return noStoreJson({ error: code }, { status: safeStatus });
}

async function ownerAccess() {
  const access = await getAdminAccess();
  return {
    access,
    allowed: Boolean(access.configured && access.userId && access.isOwner)
  };
}

export async function GET(request: Request) {
  const { access, allowed } = await ownerAccess();
  if (!allowed) {
    return noStoreJson({ error: access.userId ? "forbidden" : "unauthorized" }, { status: access.userId ? 403 : 401 });
  }
  if (!isBillingDatabaseConfigured()) {
    return noStoreJson(
      {
        error: "database_not_configured",
        setupRequired: true,
        requiredVariables: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
      },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(limitParam) ? limitParam : 100;
  try {
    const snapshot = await getBillingSnapshot(limit);
    return noStoreJson({ ok: true, ...snapshot });
  } catch (error) {
    return billingFailure(error);
  }
}

export async function POST(request: Request) {
  const { access, allowed } = await ownerAccess();
  if (!allowed) {
    return noStoreJson({ error: access.userId ? "forbidden" : "unauthorized" }, { status: access.userId ? 403 : 401 });
  }
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }
  if (!isBillingDatabaseConfigured()) {
    return noStoreJson({ error: "database_not_configured", setupRequired: true }, { status: 503 });
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    parsed = requestSchema.parse(await parseJson(request));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "invalid_json";
    return noStoreJson(
      { error: reason === "payload_too_large" ? reason : "invalid_payload" },
      { status: 400 }
    );
  }

  try {
    if (parsed.action === "verify_provider") {
      const profile = await verifyFacturamaAccount();
      return noStoreJson({ ok: true, provider: "facturama", profile });
    }

    if (parsed.action === "set_receiver") {
      const invoice = await setBillingReceiver({
        invoiceRequestId: parsed.invoiceRequestId,
        receiverRfc: parsed.receiverRfc.toUpperCase(),
        receiverName: parsed.receiverName,
        receiverFiscalRegime: parsed.receiverFiscalRegime,
        receiverTaxZipCode: parsed.receiverTaxZipCode,
        cfdiUse: parsed.cfdiUse.toUpperCase(),
        paymentForm: parsed.paymentForm ?? null
      });
      return noStoreJson({ ok: true, invoice });
    }

    if (parsed.action === "set_service") {
      const invoice = await setBillingService({
        invoiceRequestId: parsed.invoiceRequestId,
        serviceCode: parsed.serviceCode
      });
      return noStoreJson({ ok: true, invoice });
    }

    const issued = await issueInvoice(parsed.invoiceRequestId);
    return noStoreJson({ ok: true, invoice: issued.invoice });
  } catch (error) {
    return billingFailure(error);
  }
}
