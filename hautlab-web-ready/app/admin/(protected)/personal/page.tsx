import { StaffPerformanceDashboard } from "@/components/admin/staff-performance-dashboard";

export default function StaffPerformancePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">HAUTLAB · Personal</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Desempeño y compensación</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">Consolida asistencia, geocerca, WhatsApp, efectivo y Mercado Pago. Las comisiones se calculan en servidor según atribución y reglas vigentes.</p>
      </section>
      <StaffPerformanceDashboard />
    </div>
  );
}
