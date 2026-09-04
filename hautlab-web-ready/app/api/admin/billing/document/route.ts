import { getAdminAccess } from "@/lib/admin-access";
import {
  BillingDatabaseError,
  getBillingInvoiceForDocument,
  isBillingDatabaseConfigured
} from "@/lib/billing/billing-db";
import {
  downloadInvoiceDocument,
  FacturamaBillingError
} from "@/lib/billing/facturama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status: number) {
  return Response.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function safeFileToken(value: string) {
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "CFDI";
}

export async function GET(request: Request) {
  const access = await getAdminAccess();
  if (!access.configured || !access.userId || !access.isOwner) {
    return jsonError(access.userId ? "forbidden" : "unauthorized", access.userId ? 403 : 401);
  }
  if (!isBillingDatabaseConfigured()) {
    return jsonError("database_not_configured", 503);
  }

  const url = new URL(request.url);
  const invoiceRequestId = url.searchParams.get("invoiceRequestId")?.trim() ?? "";
  const format = url.searchParams.get("format")?.toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(invoiceRequestId)) {
    return jsonError("invalid_invoice_request_id", 400);
  }
  if (format !== "pdf" && format !== "xml") {
    return jsonError("invalid_format", 400);
  }

  try {
    const invoice = await getBillingInvoiceForDocument(invoiceRequestId);
    const status = String(invoice.status ?? "");
    const facturamaId = typeof invoice.facturama_id === "string" ? invoice.facturama_id : "";
    if (status !== "issued" || !facturamaId) {
      return jsonError("invoice_not_issued", 409);
    }

    const document = await downloadInvoiceDocument(facturamaId, format);
    const uuid = typeof invoice.fiscal_uuid === "string" && invoice.fiscal_uuid
      ? invoice.fiscal_uuid
      : typeof invoice.source_reference === "string"
        ? invoice.source_reference
        : invoiceRequestId;
    const filename = `HAUTLAB-CFDI-${safeFileToken(uuid)}.${format}`;
    const contentType = format === "pdf" ? "application/pdf" : "application/xml; charset=utf-8";

    return new Response(new Uint8Array(document), {
      status: 200,
      headers: {
        "Cache-Control": "no-store, private",
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    const code = error instanceof BillingDatabaseError || error instanceof FacturamaBillingError
      ? error.code
      : "billing_document_unavailable";
    const status = error instanceof BillingDatabaseError || error instanceof FacturamaBillingError
      ? error.status
      : 502;
    console.error("Billing document request failed", { code, status });
    return jsonError(code, status >= 400 && status <= 599 ? status : 502);
  }
}
