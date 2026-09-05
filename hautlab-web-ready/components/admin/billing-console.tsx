"use client";

import { useState } from "react";

type Provider = {
  active_mode?: string;
  enabled?: boolean;
  issuer_name?: string;
  issuer_rfc?: string;
  default_series?: string;
} | null;

type Invoice = {
  id: string;
  source_provider?: string;
  source_reference?: string;
  amount?: number | string;
  currency?: string;
  status?: string;
  receiver_rfc?: string | null;
  receiver_name?: string | null;
  receiver_fiscal_regime?: string | null;
  receiver_tax_zip_code?: string | null;
  cfdi_use?: string | null;
  payment_form?: string | null;
  payment_method?: string | null;
  facturama_id?: string | null;
  fiscal_uuid?: string | null;
  provider_status?: string | null;
  error_code?: string | null;
  error_message?: string | null;
};

function money(value: Invoice["amount"]) {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(number);
}

export function BillingConsole({ provider, invoices }: { provider: Provider; invoices: Invoice[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const productionReady = Boolean(provider?.enabled && provider?.active_mode === "production");

  async function issue(invoiceRequestId: string) {
    if (!productionReady || busyId) return;
    setBusyId(invoiceRequestId);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "issue", invoiceRequestId })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error ?? `HTTP ${response.status}`));
      setMessage("CFDI timbrado correctamente. Actualizando…");
      window.location.reload();
    } catch (error) {
      setMessage(`No se pudo timbrar: ${error instanceof Error ? error.message : "error desconocido"}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Proveedor fiscal</p>
            <h2 className="mt-2 text-lg font-medium">Facturama</h2>
            <p className="mt-2 text-sm text-muted">{provider?.issuer_name ?? "Emisor sin configurar"} · {provider?.issuer_rfc ?? "—"}</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${productionReady ? "border-champagne/40 text-champagne" : "border-line text-muted"}`}>
            {productionReady ? "Producción habilitada" : `Bloqueado · ${provider?.active_mode ?? "sin modo"}`}
          </span>
        </div>
        {!productionReady && (
          <p className="mt-5 rounded-2xl border border-line bg-black/20 p-4 text-sm leading-6 text-muted">
            El timbrado real permanece deshabilitado hasta que Facturama acepte las credenciales productivas. Las facturas pueden prepararse sin riesgo y quedan en estado listo.
          </p>
        )}
      </section>

      {message && <div className="rounded-2xl border border-line bg-white/[0.035] p-4 text-sm text-bone">{message}</div>}

      <section className="space-y-4">
        {invoices.length === 0 ? (
          <div className="rounded-[1.75rem] border border-line bg-white/[0.025] p-8 text-sm text-muted">No hay solicitudes de factura.</div>
        ) : invoices.map((invoice) => {
          const issued = invoice.status === "issued" && Boolean(invoice.facturama_id);
          const canIssue = productionReady && ["ready", "failed"].includes(String(invoice.status ?? ""));
          return (
            <article key={invoice.id} className="rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-champagne">{invoice.source_provider === "mercado_pago_point" ? "Mercado Pago Point" : invoice.source_provider ?? "Cobro"}</p>
                  <h3 className="mt-2 font-serif text-2xl">{money(invoice.amount)}</h3>
                  <p className="mt-2 text-sm text-muted">Operación {invoice.source_reference ?? "—"}</p>
                </div>
                <span className="rounded-full border border-line px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-muted">{invoice.status ?? "—"}</span>
              </div>

              <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div><p className="text-xs uppercase tracking-[0.12em] text-muted">Receptor</p><p className="mt-1 text-bone">{invoice.receiver_name ?? "—"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.12em] text-muted">RFC</p><p className="mt-1 text-bone">{invoice.receiver_rfc ?? "—"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.12em] text-muted">Régimen / CP</p><p className="mt-1 text-bone">{invoice.receiver_fiscal_regime ?? "—"} · {invoice.receiver_tax_zip_code ?? "—"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.12em] text-muted">Uso CFDI</p><p className="mt-1 text-bone">{invoice.cfdi_use ?? "—"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.12em] text-muted">Pago</p><p className="mt-1 text-bone">Forma {invoice.payment_form ?? "—"} · {invoice.payment_method ?? "—"}</p></div>
                <div><p className="text-xs uppercase tracking-[0.12em] text-muted">UUID</p><p className="mt-1 break-all text-bone">{invoice.fiscal_uuid ?? "Pendiente"}</p></div>
              </div>

              {(invoice.error_code || invoice.error_message) && (
                <div className="mt-5 rounded-2xl border border-line bg-black/20 p-4 text-sm text-muted">{invoice.error_code ?? "Error"}: {invoice.error_message ?? "Sin detalle"}</div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {issued ? (
                  <>
                    <a href={`/api/admin/billing/document?invoiceRequestId=${encodeURIComponent(invoice.id)}&format=pdf`} className="rounded-full bg-champagne px-5 py-3 text-sm font-medium text-background">Descargar PDF</a>
                    <a href={`/api/admin/billing/document?invoiceRequestId=${encodeURIComponent(invoice.id)}&format=xml`} className="rounded-full border border-line px-5 py-3 text-sm text-bone">Descargar XML</a>
                  </>
                ) : (
                  <button type="button" disabled={!canIssue || busyId === invoice.id} onClick={() => issue(invoice.id)} className="rounded-full bg-champagne px-5 py-3 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-35">
                    {busyId === invoice.id ? "Timbrando…" : "Timbrar CFDI"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
