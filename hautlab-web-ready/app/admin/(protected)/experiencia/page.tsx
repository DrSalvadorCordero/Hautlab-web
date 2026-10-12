import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarCheck2, CircleAlert, CreditCard, LockKeyhole, RefreshCcw, ShieldCheck } from "lucide-react";
import { getAdminAccess } from "@/lib/admin-access";
import { getPaymentProviderConfig } from "@/lib/payments/payment-db";
import { getNimboAvailabilitySnapshot, getNimboConfig, isNimboReadyForAutobooking } from "@/lib/server/nimbo";
import { classifyNimboAvailabilitySnapshot } from "@/lib/server/nimbo-health";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function dateLabel(value: string | null | undefined) {
  if (!value) return "Sin registro";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Fecha inválida";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/Merida",
  }).format(date);
}

function Status({ label, variant }: { label: string; variant: "ready" | "warning" | "blocked" }) {
  const styling = variant === "ready"
    ? "border-emerald-600/40 text-emerald-200"
    : variant === "warning"
      ? "border-amber-600/40 text-amber-200"
      : "border-red-600/40 text-red-200";
  return <span className={`rounded-full border px-3 py-1 text-xs ${styling}`}>{label}</span>;
}

export default async function ExperienceReadinessPage() {
  const access = await getAdminAccess();
  if (!access.isOwner && access.organizationRole !== "org:admin") redirect("/admin/asistencia");

  const [nimboResult, snapshotResult, paymentResult] = await Promise.allSettled([
    getNimboConfig(), getNimboAvailabilitySnapshot(), getPaymentProviderConfig(),
  ]);
  const nimbo = nimboResult.status === "fulfilled" ? nimboResult.value : null;
  const snapshot = snapshotResult.status === "fulfilled" ? snapshotResult.value : null;
  const payment = paymentResult.status === "fulfilled" ? paymentResult.value : null;
  const integrationReady = Boolean(nimbo && isNimboReadyForAutobooking(nimbo));
  const availableHealth = classifyNimboAvailabilitySnapshot(snapshot);
  const canOfferSlots = integrationReady && availableHealth.status === "healthy";
  const paymentMode = payment?.active_mode ?? null;
  // This is an operational readiness board, never an enablement switch.
  // There is no atomic Nimbo reservation + Mercado Pago settlement contract yet.
  const automaticBookingEnabled = false;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-line bg-white/[0.035] p-7 sm:p-10">
        <p className="text-xs uppercase tracking-[.24em] text-champagne">HAUTLAB Experience · Panel interno</p>
        <h1 className="mt-5 max-w-3xl font-serif text-4xl tracking-[-.05em] text-bone sm:text-5xl">Preparación para una reserva confirmada.</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">
          Estado verificado de los componentes que ya existen. Esta pantalla no cambia horarios,
          no habilita cobros, no genera citas y no muestra información de pacientes.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <a href="/admin/experiencia" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-2 text-sm text-bone hover:border-champagne/50">
            <RefreshCcw className="h-4 w-4" /> Actualizar estado
          </a>
          <Link href="/agenda" target="_blank" className="inline-flex items-center gap-2 text-sm text-muted hover:text-bone">
            Ver agenda pública <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.75rem] border border-line bg-white/[0.025] p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <CalendarCheck2 className="h-6 w-6 text-champagne" />
            <Status label={canOfferSlots ? "Horarios consultables" : "Verificación requerida"} variant={canOfferSlots ? "ready" : "warning"} />
          </div>
          <h2 className="mt-7 text-lg font-medium text-bone">Nimbo · disponibilidad</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {canOfferSlots
              ? "Existe una instantánea reciente de disponibilidad. El paciente puede solicitar un horario, pero todavía no reservarlo automáticamente."
              : "La integración o la última instantánea no superan la verificación. No deben ofertarse horarios como disponibles."}
          </p>
          <dl className="mt-5 space-y-2 border-t border-line pt-5 text-xs text-muted">
            <div className="flex justify-between gap-3"><dt>Última consulta</dt><dd className="text-right text-bone">{dateLabel(snapshot?.checked_at)}</dd></div>
            <div className="flex justify-between gap-3"><dt>Duración de valoración</dt><dd className="text-bone">{nimbo?.consultation_duration_minutes ?? "—"} min</dd></div>
            <div className="flex justify-between gap-3"><dt>Anticipación mínima</dt><dd className="text-bone">{nimbo?.booking_min_lead_minutes ?? "—"} min</dd></div>
          </dl>
        </article>

        <article className="rounded-[1.75rem] border border-line bg-white/[0.025] p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <CreditCard className="h-6 w-6 text-champagne" />
            <Status label={paymentMode === "test" ? "Solo pruebas" : paymentMode === "production" ? "Producción configurada" : "No verificado"} variant={paymentMode === "production" ? "warning" : "blocked"} />
          </div>
          <h2 className="mt-7 text-lg font-medium text-bone">Mercado Pago · anticipos</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {paymentMode === "test"
              ? "La configuración sigue en modo de prueba. No representa un checkout productivo para citas."
              : paymentMode === "production"
                ? "El modo producción figura configurado. Aún faltan pruebas reales de webhook, conciliación y reembolso antes de habilitar la reserva automática."
                : "No se pudo consultar de forma segura el modo de pago. No habilitar cobros desde la agenda."}
          </p>
          <p className="mt-5 border-t border-line pt-5 text-xs leading-6 text-muted">
            Un pago aprobado confirma dinero recibido, no un turno reservado en Nimbo.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-line bg-white/[0.025] p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <ShieldCheck className="h-6 w-6 text-champagne" />
            <Status label="Confirmación asistida" variant="warning" />
          </div>
          <h2 className="mt-7 text-lg font-medium text-bone">Reserva y conciliación</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {automaticBookingEnabled ? "Reserva automática validada." : "Todavía no existe una operación atómica comprobada que vincule un horario, una cita en Nimbo, un anticipo y su posible devolución."}
          </p>
          <p className="mt-5 border-t border-line pt-5 text-xs leading-6 text-muted">
            Estado conservador: el equipo confirma fecha y hora antes de considerar la cita cerrada.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-line bg-white/[0.025] p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <LockKeyhole className="h-6 w-6 text-champagne" />
            <Status label="Expediente no integrado" variant="warning" />
          </div>
          <h2 className="mt-7 text-lg font-medium text-bone">HAUTLAB Passport</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            My HAUTLAB conserva un plan orientativo privado y el estado de coordinación. Aún no es un portal autenticado de expediente ni de indicaciones médicas individuales.
          </p>
          <p className="mt-5 border-t border-line pt-5 text-xs leading-6 text-muted">
            Requiere identidad verificada, consentimiento, control de acceso y revisión médica de cada indicación.
          </p>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-line bg-white/[0.025] p-7 sm:p-9">
        <div className="flex items-center gap-3">
          <CircleAlert className="h-5 w-5 text-champagne" />
          <h2 className="text-xl font-medium text-bone">Criterios obligatorios para cerrar la automatización</h2>
        </div>
        <ol className="mt-6 grid gap-4 text-sm leading-7 text-muted md:grid-cols-2">
          <li>1. Probar y auditar webhooks de pago aprobado, pendiente, fallido, reverso y devolución.</li>
          <li>2. Probar reserva idempotente en Nimbo: sin doble cita ante reintentos ni concurrencia.</li>
          <li>3. Formalizar manejo de pago aprobado sin horario y procedimiento de devolución.</li>
          <li>4. Pilotear autenticación del paciente y seguimiento clínico aprobado, sin duplicar expediente.</li>
        </ol>
        <p className="mt-6 text-xs leading-6 text-quiet">
          Sólo cuando los cuatro criterios estén probados se podrá cambiar el estado funcional de la reserva automática. No debe deducirse de una pantalla, un flag o una configuración.
        </p>
      </section>
    </div>
  );
}
