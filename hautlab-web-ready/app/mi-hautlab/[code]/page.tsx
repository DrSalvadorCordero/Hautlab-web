import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, CalendarCheck, Check, Circle, MessageCircle, ShieldCheck } from "lucide-react";
import { PlanWhatsAppButton } from "@/components/plan/plan-whatsapp-button";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  getHautlabPlan,
  hautlabPlanAccessCookieName,
} from "@/lib/server/hautlab-plan";

export const metadata: Metadata = {
  title: "My HAUTLAB",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

function money(value: number | null) {
  if (value == null) return null;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function appointmentDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Merida",
  }).format(date);
}

export default async function MyHautlabPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ access?: string }>;
}) {
  const { code } = await params;
  const { access: legacyAccess } = await searchParams;
  const normalizedCode = code.toUpperCase();
  const cookieStore = await cookies();
  const cookieAccess = cookieStore.get(
    hautlabPlanAccessCookieName(normalizedCode),
  )?.value;

  let snapshot = cookieAccess
    ? await getHautlabPlan(normalizedCode, cookieAccess)
    : null;

  if (!snapshot && legacyAccess) {
    snapshot = await getHautlabPlan(normalizedCode, legacyAccess);
  }

  if (!snapshot) {
    return (
      <main className="min-h-[70svh] border-b border-line bg-aurora">
        <section className="mx-auto flex w-[min(760px,calc(100%-32px))] flex-col items-center py-24 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne">My HAUTLAB</p>
          <h1 className="mt-4 font-serif text-5xl tracking-[-0.05em] text-bone">Este acceso no es válido.</h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-muted">
            Por seguridad, tu HAUTLAB Code por sí solo no abre el plan. Usa el enlace privado guardado en el dispositivo donde lo creaste.
          </p>
          <Button asChild className="mt-8">
            <Link href="/plan">Crear un nuevo plan</Link>
          </Button>
        </section>
      </main>
    );
  }

  const { plan, conversation } = snapshot;
  const requested = Boolean(conversation?.appointment_requested_at) || Boolean(conversation && conversation.appointment_status !== "none");
  // Never treat an old confirmation timestamp as proof of a current booking.
  const appointmentStatus = conversation?.appointment_status ?? "none";
  const confirmed = appointmentStatus === "confirmed";
  const completed = appointmentStatus === "completed";
  const cancelled = appointmentStatus === "cancelled";
  const date = appointmentDate(conversation?.appointment_datetime ?? null);

  const journey = [
    { label: "Plan HAUTLAB creado", done: true },
    { label: "Conversación conectada", done: Boolean(conversation) },
    { label: "Valoración solicitada", done: requested },
    { label: cancelled ? "Cita cancelada" : completed ? "Valoración realizada" : "Cita confirmada", done: confirmed || completed },
  ];

  return (
    <main className="min-h-[80svh] border-b border-line bg-aurora">
      <section className="mx-auto w-[min(1040px,calc(100%-32px))] py-14 sm:py-20">
        <div className="flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-champagne">My HAUTLAB</p>
            <h1 className="mt-3 font-serif text-5xl tracking-[-0.055em] text-bone sm:text-6xl">Tu recorrido, en un solo lugar.</h1>
            <p className="mt-4 text-sm text-muted">Plan {plan.public_code}</p>
          </div>
          <PlanWhatsAppButton code={plan.public_code} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          <section className="rounded-[2rem] border border-line bg-white/[0.035] p-6 sm:p-8">
            <h2 className="font-serif text-3xl tracking-[-0.04em] text-bone">Estado</h2>
            <ol className="mt-7 space-y-5">
              {journey.map((step, index) => (
                <li key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={
                        step.done
                          ? "grid h-8 w-8 place-items-center rounded-full border border-champagne bg-champagne/10 text-champagne"
                          : "grid h-8 w-8 place-items-center rounded-full border border-line text-quiet"
                      }
                    >
                      {step.done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                    </span>
                    {index < journey.length - 1 ? <span className="mt-2 h-7 w-px bg-line" /> : null}
                  </div>
                  <div className="pt-1">
                    <p className={step.done ? "text-sm font-medium text-bone" : "text-sm text-quiet"}>{step.label}</p>
                    {(confirmed || completed) && index === journey.length - 1 && date ? (
                      <p className="mt-1 text-xs leading-5 text-muted">{date}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            {confirmed ? (
              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-champagne/25 bg-champagne/[0.07] p-4">
                <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
                <p className="text-xs leading-5 text-muted">
                  Tu cita figura confirmada en el estado de coordinación. Si necesitas modificarla, comunícate con el equipo; la agenda médica es la referencia definitiva.
                </p>
              </div>
            ) : completed ? (
              <div className="mt-7 rounded-2xl border border-champagne/25 bg-champagne/[0.07] p-5">
                <p className="text-sm font-medium text-bone">Continuidad después de tu valoración</p>
                <p className="mt-2 text-xs leading-6 text-muted">Consulta las indicaciones entregadas por tu profesional y solicita la revisión que corresponda. Este portal no muestra recetas ni sustituye la historia clínica.</p>
                <a href={buildWhatsAppLink(`Hola, quiero coordinar seguimiento de mi Plan HAUTLAB ${plan.public_code} después de mi consulta.`)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-bone transition hover:text-champagne">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Solicitar seguimiento <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            ) : cancelled ? (
              <div className="mt-7 rounded-2xl border border-line p-5">
                <p className="text-sm font-medium text-bone">La cita anterior fue cancelada.</p>
                <p className="mt-2 text-xs leading-6 text-muted">La confirmación anterior ya no está vigente. Solicita una nueva fecha antes de acudir.</p>
                <Link href="/agenda" className="mt-4 inline-flex items-center gap-2 text-sm text-champagne">Consultar nuevos horarios <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            ) : requested ? (
              <Link href="/agenda" className="mt-7 inline-flex items-center gap-2 text-sm text-champagne">Ver horarios propuestos <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-line bg-white/[0.035] p-6 sm:p-8">
            <h2 className="font-serif text-3xl tracking-[-0.04em] text-bone">Tu plan inicial</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Estas son posibilidades para discutir en valoración; no son una prescripción ni garantizan que todas estén indicadas.
            </p>
            <div className="mt-6 divide-y divide-line rounded-3xl border border-line bg-background/40">
              {plan.recommendations.map((item) => {
                const low = money(item.preferentialPrice ?? item.publicPrice);
                const high = money(item.publicPrice);
                return (
                  <article key={item.key} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]">
                    <div>
                      <h3 className="text-sm font-medium text-bone">{item.name}</h3>
                      <p className="mt-2 text-xs leading-5 text-muted">{item.why}</p>
                    </div>
                    <div className="text-xs text-muted sm:text-right">
                      {low ? <p>{low}{high && high !== low ? ` – ${high}` : ""}</p> : <p>Según valoración</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-line bg-white/[0.025] p-5 text-xs leading-5 text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
          My HAUTLAB muestra únicamente tu plan no clínico y el estado de coordinación. La historia clínica y las fotografías no se almacenan aquí.
        </div>
      </section>
    </main>
  );
}
