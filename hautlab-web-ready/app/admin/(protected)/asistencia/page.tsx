import { AttendanceDashboard } from "@/components/admin/attendance-dashboard";

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">Operación interna</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Check-in / Check-out</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Control privado de entradas, salidas, horas trabajadas, retardos e incidencias. El módulo web conserva las marcas por hora del servidor; la app HAUTLAB Staff añade validación por geocerca durante el turno con consentimiento laboral registrado.
        </p>
      </section>
      <AttendanceDashboard />
    </div>
  );
}
