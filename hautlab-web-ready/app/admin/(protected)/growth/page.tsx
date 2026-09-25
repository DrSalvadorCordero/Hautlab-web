import { GrowthDashboard } from "@/components/admin/growth-dashboard";

export default function GrowthPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">HAUTLAB · Growth OS</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Embudo y atribución</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Mide el recorrido desde el origen de marketing hasta WhatsApp, solicitud de cita,
          confirmación y revenue registrado. Los campos sin fuente conectada se muestran como
          no disponibles; no se estiman.
        </p>
      </section>
      <GrowthDashboard />
    </div>
  );
}
