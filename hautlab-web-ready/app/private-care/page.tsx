import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { AlertTriangle, Check, Circle, LockKeyhole, ShieldCheck } from "lucide-react";
import { acceptCareConsent, acknowledgeCareItem, reportCareEvolution, revokeCareConsent } from "@/app/private-care/actions";
import { patientCareSnapshot } from "@/lib/server/private-care";
import { isClerkConfigured } from "@/lib/auth-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Mi espacio privado | HAUTLAB",
  description: "Acceso individual a cuidados aprobados por HAUTLAB.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};
const card = "rounded-[1.6rem] border border-line bg-white/[0.035] p-6 sm:p-8";
const input = "w-full min-h-12 rounded-xl border border-line bg-background px-4 py-3 text-sm text-bone focus:outline-none focus:border-champagne";
const cta = "inline-flex min-h-11 items-center justify-center rounded-full bg-champagne px-6 py-3 text-sm font-medium text-background hover:opacity-90";

export default async function PrivateCareHome({ searchParams }: {
  searchParams: Promise<{ enviado?: string; error?: string }>
}) {
  const { enviado, error } = await searchParams;
  let snapshot: Awaited<ReturnType<typeof patientCareSnapshot>> = null;
  let unavailable = false;
  try {
    snapshot = await patientCareSnapshot();
  } catch {
    unavailable = true;
  }
  return (
    <main id="contenido-principal" className="min-h-screen bg-background px-4 py-12 text-bone sm:py-16">
      <div className="mx-auto w-full max-w-[1000px]">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-5">
          <div>
            <Link href="/" className="text-xs uppercase tracking-[.26em] text-champagne">HAUTLAB / PRIVATE CARE</Link>
            <h1 className="mt-5 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[.95] tracking-[-.05em]">Un espacio solo para ti.</h1>
            <p className="mt-5 text-sm leading-7 text-muted">Tu seguimiento, bajo supervisión médica.</p>
          </div>
          {isClerkConfigured() && <SignOutButton><button className="rounded-full border border-line px-5 py-2 text-xs text-muted hover:text-bone">Cerrar sesión</button></SignOutButton>}
        </header>
        {unavailable ? (
          <section className={card}><LockKeyhole className="h-6 w-6 text-champagne"/><h2 className="mt-4 text-xl">Acceso clínico temporalmente no disponible</h2><p className="mt-3 text-sm text-muted">No podemos mostrar tu plan en este momento. Intenta de nuevo más tarde o contacta a HAUTLAB.</p></section>
        ) : !snapshot ? (
          <section className={card}>
            <LockKeyhole className="h-7 w-7 text-champagne"/>
            <h2 className="mt-5 font-serif text-3xl">Acceso individual pendiente</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Puedes registrarte con el correo que elijas, verificarlo y solicitar acceso. HAUTLAB confirmará tu identidad antes de mostrar cualquier indicación médica. Un código compartido nunca abre expedientes.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/private-care/registro" className="inline-flex rounded-full bg-champagne px-5 py-3 text-sm font-medium text-background">Crear mi cuenta</Link>
              <Link href="/private-care/solicitar" className="inline-flex rounded-full border border-line px-5 py-3 text-sm text-bone hover:border-champagne">Consultar mi solicitud</Link>
            </div>
          </section>
        ) : !snapshot.patient.consent_at ? (
          <section className={card}>
            <ShieldCheck className="h-7 w-7 text-champagne"/>
            <p className="mt-5 text-xs uppercase tracking-[.18em] text-champagne">Activación individual</p>
            <h2 className="mt-3 font-serif text-3xl">Bienvenido a Private Care.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">Este espacio contiene indicaciones de salud y reportes de seguimiento accesibles únicamente a tu cuenta verificada y al personal clínico autorizado. Tu consentimiento para utilizar este portal es voluntario; no condiciona tu atención presencial. Puedes solicitar su revocación al equipo.</p>
            <p className="mt-4 text-sm text-muted">Revisa el <Link href="/aviso-de-privacidad" target="_blank" rel="noreferrer" className="text-bone underline underline-offset-4">aviso de privacidad</Link> antes de continuar.</p>
            <form action={acceptCareConsent} className="mt-7 space-y-5">
              <label className="flex items-start gap-3 text-sm leading-6 text-bone"><input type="checkbox" name="consent" value="acepto" required className="mt-1 h-4 w-4 accent-[#c5a46d]"/> He leído la información y acepto activar este portal individual para consultar mi seguimiento clínico.</label>
              <button type="submit" className={cta}>Activar mi espacio privado</button>
            </form>
          </section>
        ) : (
          <>
            <section className={card}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[.17em] text-champagne">MI ESPACIO DE CUIDADO</p>
                  <h2 className="mt-3 font-serif text-3xl tracking-[-.04em]">{snapshot.patient.display_name}</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-muted"><LockKeyhole className="h-4 w-4 text-champagne"/> Información privada</span>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted">Las indicaciones aquí mostradas corresponden a la versión que aprobó tu profesional. No cambies de fase ni suspendas tratamientos por marcar una instrucción como leída.</p>
              {enviado && <p role="status" className="mt-5 rounded-xl border border-emerald-800 p-4 text-sm text-emerald-200">Tu reporte fue registrado para revisión. No significa que ya haya sido leído por el equipo.</p>}
              {error && <p role="alert" className="mt-5 rounded-xl border border-amber-800 p-4 text-sm text-amber-200">No fue posible registrar la operación. Verifica la información; para reportes nuevos espera al menos 15 minutos entre envíos.</p>}
            </section>
            {!snapshot.plan ? (
              <section className={"mt-6 "+card}>
                <h2 className="font-serif text-3xl">Tu plan está en preparación.</h2>
                <p className="mt-4 text-sm leading-7 text-muted">El profesional aún no ha publicado indicaciones para esta cuenta. Comunícate con HAUTLAB si tu revisión es próxima.</p>
              </section>
            ) : (
              <>
                <section className={"mt-6 "+card}>
                  <p className="text-xs uppercase tracking-[.2em] text-champagne">INDICACIONES VIGENTES · REVISIÓN {snapshot.plan.revision}</p>
                  <h2 className="mt-4 font-serif text-4xl tracking-[-.05em]">{snapshot.plan.title}</h2>
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">{snapshot.plan.summary}</p>
                  <p className="mt-4 text-xs text-quiet">Aprobado el {snapshot.plan.published_at ? new Date(snapshot.plan.published_at).toLocaleDateString("es-MX", {dateStyle:"long", timeZone:"America/Merida"}) : "—"}</p>
                </section>
                <div className="mt-6 space-y-5">
                  {snapshot.plan.phases.map((phase, phaseIndex)=>(
                    <section key={phaseIndex} className={card}>
                      <p className="text-xs uppercase tracking-[.2em] text-champagne">FASE {String(phaseIndex+1).padStart(2,"0")}</p>
                      <h3 className="mt-4 font-serif text-3xl tracking-[-.04em]">{phase.title}</h3>
                      <ul className="mt-6 divide-y divide-line">
                        {phase.items.map((item,index)=>{
                          const key = "phase-"+phaseIndex+"-item-"+index;
                          const read = snapshot.receipts.some(x=>x.item_key===key);
                          return <li key={key} className="flex items-start gap-4 py-5">
                            <span className={"mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border "+(read?"border-champagne bg-champagne/10 text-champagne":"border-line text-quiet")}>
                              {read ? <Check className="h-4 w-4"/> : <Circle className="h-3 w-3"/>}
                            </span>
                            <div className="flex-1">
                              <p className="whitespace-pre-wrap text-sm leading-7 text-bone">{item}</p>
                              {!read ? <form action={acknowledgeCareItem} className="mt-3">
                                <input type="hidden" name="planId" value={snapshot.plan!.id}/>
                                <input type="hidden" name="itemKey" value={key}/>
                                <button type="submit" className="text-xs text-champagne underline underline-offset-4">Marcar como leído</button>
                              </form>:<p className="mt-2 text-xs text-quiet">Leído · no confirma la aplicación del tratamiento</p>}
                            </div>
                          </li>;
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
                <section className={"mt-6 "+card}>
                  <h3 className="font-serif text-3xl">¿Cómo ha evolucionado tu piel?</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">Envía un reporte breve para que el equipo lo revise. Esta función no atiende emergencias ni cambia tu tratamiento automáticamente.</p>
                  <form action={reportCareEvolution} className="mt-6 max-w-3xl space-y-5">
                    <label className="block text-xs text-muted">Estado actual
                      <select name="state" required defaultValue="" className={"mt-2 "+input}>
                        <option disabled value="">Selecciona cómo te encuentras</option>
                        <option value="better">Mejor</option>
                        <option value="same">Sin cambios</option>
                        <option value="worse">Peor</option>
                      </select>
                    </label>
                    <label className="block text-xs text-muted">Cuéntanos brevemente qué ha cambiado
                      <textarea name="message" minLength={3} maxLength={1000} required rows={4} className={"mt-2 "+input} placeholder="Describe qué notaste, cuándo comenzó y si hay ardor u otra molestia."/>
                    </label>
                    <button type="submit" className={cta}>Enviar para revisión</button>
                  </form>
                  {snapshot.followups.length > 0 && <div className="mt-8 border-t border-line pt-6">
                    <h4 className="text-sm font-medium text-bone">Reportes anteriores</h4>
                    <ul className="mt-4 space-y-3">{snapshot.followups.map(report=><li key={report.id} className="rounded-xl border border-line p-4">
                      <p className="text-xs text-muted">{new Date(report.created_at).toLocaleString("es-MX",{timeZone:"America/Merida"})} · {report.review_status==="reviewed"?"Marcado como revisado":"Pendiente de revisión"}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-bone">{report.message}</p>
                    </li>)}</ul>
                  </div>}
                </section>
              </>
            )}
          </>
        )}
        <aside className="mt-6 flex items-start gap-3 rounded-2xl border border-red-900/40 bg-red-950/10 p-5">
          <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-200"/>
          <p className="text-xs leading-6 text-muted">Si presentas dolor ocular, alteración de la visión, dificultad respiratoria o empeoramiento intenso, busca atención médica urgente. No esperes respuesta por este portal.</p>
        </aside>
        {snapshot?.patient.consent_at && (
          <form action={revokeCareConsent} className="mt-7">
            <button type="submit" className="text-xs text-muted underline underline-offset-4 hover:text-bone">
              Retirar consentimiento de uso del portal
            </button>
          </form>
        )}
        <p className="mt-8 text-xs text-quiet">HAUTLAB Private Care · Acceso personal no transferible · <Link href="/aviso-de-privacidad" className="underline underline-offset-4">Privacidad</Link></p>
      </div>
    </main>
  );
}
