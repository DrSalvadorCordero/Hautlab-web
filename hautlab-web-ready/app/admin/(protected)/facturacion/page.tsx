import { BillingConsole } from "@/components/admin/billing-console";
import { getBillingSnapshot, isBillingDatabaseConfigured } from "@/lib/billing/billing-db";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage() {
  if (!isBillingDatabaseConfigured()) {
    return (
      <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">Facturación</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Base fiscal no conectada</h1>
        <p className="mt-4 text-muted">Falta la conexión de servidor a Supabase.</p>
      </section>
    );
  }

  const snapshot = await getBillingSnapshot(100);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">Facturación</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">CFDI · HAUTLAB</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Cobros conciliados, datos fiscales, timbrado y descarga de comprobantes. El timbrado se habilita únicamente cuando el proveedor productivo está validado.
        </p>
      </section>

      <BillingConsole provider={snapshot.provider} invoices={snapshot.invoices as never[]} />
    </div>
  );
}
