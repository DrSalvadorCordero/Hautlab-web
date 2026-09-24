import { SalesBrainConsole } from "@/components/admin/sales-brain-console";

export default function SalesBrainPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">HAUTLAB · Revenue</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Sales Brain</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Cotiza planes con reglas comerciales consistentes. El panel protege el precio,
          calcula una concesión final y conserva un piso interno que nunca se comunica al paciente.
        </p>
      </section>
      <SalesBrainConsole />
    </div>
  );
}
