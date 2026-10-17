import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ClipboardList, LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import { getAdminAccess } from "@/lib/admin-access";
import { ownerCareSnapshot } from "@/lib/server/private-care";
import { CareInvitationIssuer } from "@/components/private-care/care-invitation-issuer";
import {
  archiveCarePlan, createCarePlan, enrollCarePatient, publishCarePlan, reviewCareReport, setCarePatientAccess,
  approveCareEnrollment, rejectCareEnrollment, revokeCareInvitation, approvePreparedCarePlan
} from "@/app/private-care/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Private Care · Panel clínico HAUTLAB",
  robots: { index: false, follow: false, nocache: true }, referrer: "no-referrer",
};

const field = "w-full min-h-11 rounded-xl border border-line bg-background p-3 text-sm text-bone outline-none focus:border-champagne";
const btn = "inline-flex min-h-11 items-center justify-center rounded-full bg-champagne px-5 py-2 text-sm font-medium text-background transition hover:opacity-90";
const outline = "inline-flex min-h-10 items-center justify-center rounded-full border border-line px-4 py-2 text-xs text-bone transition hover:border-champagne";
const panel = "rounded-[1.7rem] border border-line bg-white/[0.035] p-6 sm:p-8";
const inviteUrl = "https://www.hautlabmx.com/private-care/empezar";
const inviteMessage = "Hola, te comparto tu acceso personal a HAUTLAB Private Care. Regístrate con el correo que elijas, verifícalo y envía tu solicitud aquí: " + inviteUrl + ". Yo verificaré tu identidad antes de habilitar tu plan.";
const whatsappInviteUrl = "https://wa.me/?text=" + encodeURIComponent(inviteMessage);

export default async function PrivateCareAdminPage({
  searchParams,
}: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const access = await getAdminAccess();
  if (!access.isOwner) redirect("/admin/experiencia");
  const { ok, error } = await searchParams;
  const { patients, plans, followups, requests, invitations, preparedPlans } = await ownerCareSnapshot();
  const patientNames = new Map(patients.map(p => [p.id, p.display_name]));
  const planNames = new Map(plans.map(p => [p.id, p.title]));
  return (
    <div className="space-y-7 pb-16">
      <section className={panel}>
        <p className="text-xs uppercase tracking-[.24em] text-champagne">HAUTLAB Experience · Private Care</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-[-.05em] text-bone sm:text-5xl">Planes bajo tu supervisión.</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">
          Da acceso exclusivamente a una cuenta con correo verificado, prepara indicaciones por fases y
          publícalas únicamente después de revisarlas. Las revisiones crean nuevas versiones.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-champagne"/> Solo propietario</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs text-muted"><LockKeyhole className="h-4 w-4 text-champagne"/> Sin publicación automática</span>
          <Link href="/private-care" className="text-xs text-champagne underline underline-offset-4">Portal del paciente</Link>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a href={whatsappInviteUrl} target="_blank" rel="noopener noreferrer"
            className={btn}>Compartir invitación por WhatsApp</a>
          <Link href="/private-care/empezar" target="_blank" rel="noopener noreferrer"
            className={outline}>Ver la experiencia del paciente</Link>
        </div>
        <p className="mt-3 text-xs leading-6 text-quiet">
          La invitación es genérica: no incluye diagnóstico, expediente ni información clínica.
          El acceso individual se concede solo después de comprobar la identidad.
        </p>
        {ok && <p role="status" className="mt-4 text-sm text-emerald-300">Operación registrada.</p>}
        {error && <p role="alert" className="mt-4 text-sm text-amber-200">{error === "notas_internas" ? "El contenido para el paciente contiene marcas de borrador o notas internas. Sepáralas antes de autorizar." : "Verifica los datos o revisa si el paciente ya existe."}</p>}
      </section>

      <CareInvitationIssuer />

      <section className={panel}>
        <h2 className="text-xl font-medium text-bone">Códigos de activación emitidos</h2>
        <p className="mt-2 text-xs leading-6 text-muted">No se guardan códigos en texto claro. Puedes revocar cualquier invitación no utilizada.</p>
        <div className="mt-5 space-y-3">
          {invitations.length ? invitations.map(invite => {
            const available = !invite.redeemed_at && !invite.revoked_at && new Date(invite.expires_at).getTime() > Date.now();
            return (
              <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4">
                <div>
                  <p className="text-sm font-medium text-bone">{invite.display_name}</p>
                  <p className="mt-1 text-xs text-muted">{invite.redeemed_at ? "Utilizado" : invite.revoked_at ? "Revocado" : available ? "Vigente" : "Expirado"} · Vence {new Date(invite.expires_at).toLocaleString("es-MX", {timeZone: "America/Merida"})}</p>
                </div>
                {available && <form action={revokeCareInvitation}>
                  <input type="hidden" name="invitationId" value={invite.id} />
                  <button type="submit" className={outline}>Revocar código</button>
                </form>}
              </div>
            );
          }) : <p className="text-sm text-muted">Aún no se han emitido códigos.</p>}
        </div>
      </section>

      <section className={panel}>
        <h2 className="text-xl font-medium text-bone">Planes clínicos preparados para invitaciones</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Los borradores están asociados al código de invitación, no a un correo supuesto.
          Lee las indicaciones y apruébalas únicamente si siguen vigentes.
          Si apruebas antes de que el paciente active su cuenta, el sistema publicará
          este plan al verificar el código y registrar su consentimiento.
        </p>
        <div className="mt-6 space-y-5">
          {preparedPlans.length ? preparedPlans.map(prepared => {
            const invitation = invitations.find(item => item.id === prepared.invitation_id);
            const inviteActive = Boolean(invitation && !invitation.redeemed_at && !invitation.revoked_at
              && new Date(invitation.expires_at).getTime() > Date.now());
            return (
              <article key={prepared.id} className="rounded-2xl border border-line bg-background/45 p-5">
                <p className="text-xs uppercase tracking-[.17em] text-champagne">
                  {invitation?.display_name ?? "Invitación privada"} · {prepared.status === "approved" ? "Aprobado por médico" : "Borrador pendiente de revisión"}
                </p>
                <h3 className="mt-3 text-lg font-medium text-bone">{prepared.title}</h3>
                <div className="mt-4 rounded-xl border border-line/80 p-4">
                  <p className="text-xs uppercase tracking-[.15em] text-champagne">Resumen para el paciente</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{prepared.summary}</p>
                </div>
                {prepared.internal_notes && (
                  <details className="mt-3 rounded-xl border border-amber-900/30 p-4">
                    <summary className="cursor-pointer text-xs font-medium uppercase tracking-[.12em] text-amber-200">
                      Notas médicas internas · Solo para ti
                    </summary>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">{prepared.internal_notes}</p>
                    <p className="mt-3 text-xs leading-6 text-quiet">
                      Estas notas no se envían al paciente ni forman parte de su resumen o plan publicado.
                    </p>
                  </details>
                )}
                <ol className="mt-5 space-y-5 border-t border-line pt-5">
                  {prepared.phases.map((phase,i)=>(
                    <li key={i}>
                      <p className="text-sm font-medium text-bone">Fase {i+1}: {phase.title}</p>
                      <ul className="ml-5 mt-2 list-disc space-y-2 text-xs leading-6 text-muted">
                        {phase.items.map((item,j)=><li key={j}>{item}</li>)}
                      </ul>
                    </li>
                  ))}
                </ol>
                {prepared.status === "draft" && inviteActive && (
                  <form action={approvePreparedCarePlan} className="mt-6 space-y-4 border-t border-line pt-5">
                    <input type="hidden" name="preparedPlanId" value={prepared.id}/>
                    <label className="flex items-start gap-3 text-xs leading-6 text-bone">
                      <input type="checkbox" required name="clinicianReviewed" value="confirmado"
                        className="mt-1 h-4 w-4 accent-[#c5a46d]"/>
                      Revisé personalmente todas las indicaciones, confirmé que corresponden
                      al paciente de la invitación y autorizo publicar esta versión cuando active su cuenta.
                    </label>
                    <button type="submit" className={btn}>Revisado: autorizar publicación al activar</button>
                  </form>
                )}
                {prepared.status === "approved" && (
                  <p className="mt-5 text-xs text-emerald-200">
                    Aprobado para su activación. No se hará visible sin verificación de cuenta y consentimiento.
                  </p>
                )}
                {!inviteActive && prepared.status === "draft" && (
                  <p className="mt-4 text-xs text-amber-200">La invitación ya no está disponible. Emite una nueva para preparar otro acceso.</p>
                )}
              </article>
            );
          }) : <p className="text-sm text-muted">No hay planes preparados en espera de activación.</p>}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className={panel}>
          <div className="flex items-center gap-3"><UserPlus className="h-5 w-5 text-champagne"/><h2 className="text-xl font-medium text-bone">1 · Autorizar paciente</h2></div>
          <p className="mt-3 text-sm leading-6 text-muted">Registra únicamente a pacientes que deban recibir acceso. El correo debe coincidir con su cuenta verificada.</p>
          <form action={enrollCarePatient} className="mt-6 space-y-4">
            <label className="block text-xs text-muted">Nombre para mostrar
              <input name="name" required minLength={2} maxLength={120} autoComplete="off" className={"mt-2 "+field} placeholder="Nombre del paciente"/>
            </label>
            <label className="block text-xs text-muted">Correo personal verificado
              <input name="email" required type="email" maxLength={254} autoComplete="off" className={"mt-2 "+field} placeholder="paciente@correo.com"/>
            </label>
            <button className={btn} type="submit">Autorizar acceso</button>
          </form>
        </div>
        <div className={panel}>
          <div className="flex items-center gap-3"><ClipboardList className="h-5 w-5 text-champagne"/><h2 className="text-xl font-medium text-bone">Estado del programa</h2></div>
          <dl className="mt-6 divide-y divide-line text-sm">
            <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Solicitudes pendientes</dt><dd className="text-bone">{requests.filter(x=>x.status==="pending").length}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Pacientes inscritos</dt><dd className="text-bone">{patients.length}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Planes pendientes de aprobación</dt><dd className="text-bone">{plans.filter(x=>x.status==="draft").length}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Planes publicados</dt><dd className="text-bone">{plans.filter(x=>x.status==="published").length}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-muted">Reportes por revisar (últimos 30)</dt><dd className="text-bone">{followups.filter(x=>x.review_status==="new").length}</dd></div>
          </dl>
          <p className="mt-5 text-xs leading-6 text-quiet">Un plan borrador nunca es visible para el paciente. Publicar es una acción clínica explícita.</p>
        </div>
      </section>

      <section className={panel}>
        <div className="flex items-center gap-3">
          <UserPlus className="h-5 w-5 text-champagne"/>
          <h2 className="text-xl font-medium text-bone">Solicitudes de registro verificadas</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          El paciente registra el correo que prefiera y lo verifica en su cuenta. Este registro no
          confirma por sí mismo su identidad clínica. Antes de aprobar, comprueba por un canal
          independiente que es la persona de tu expediente. Ninguna solicitud abre un tratamiento automáticamente.
        </p>
        <div className="mt-6 space-y-4">
          {requests.filter(request=>request.status==="pending").map(request=>(
            <article key={request.id} className="rounded-2xl border border-line bg-background/50 p-5">
              <p className="text-base font-medium text-bone">{request.display_name}</p>
              <p className="mt-2 break-all text-sm text-muted">{request.email}</p>
              <p className="mt-2 text-xs text-quiet">
                Solicitado el {new Date(request.requested_at).toLocaleString("es-MX",{timeZone:"America/Merida"})} · Correo verificado por el proveedor de identidad
              </p>
              <form action={approveCareEnrollment} className="mt-5 flex flex-wrap items-end gap-4">
                <input type="hidden" name="requestId" value={request.id}/>
                <label className="flex max-w-xl items-start gap-3 text-xs leading-6 text-bone">
                  <input required type="checkbox" name="identityChecked" value="confirmado" className="mt-1 h-4 w-4 accent-[#c5a46d]"/>
                  Confirmo haber identificado personalmente al paciente y comprobado su correspondencia con el expediente clínico.
                </label>
                <button type="submit" className={btn}>Autorizar cuenta</button>
              </form>
              <form action={rejectCareEnrollment} className="mt-4">
                <input type="hidden" name="requestId" value={request.id}/>
                <button type="submit" className={outline}>Rechazar solicitud</button>
              </form>
            </article>
          ))}
          {requests.every(request=>request.status!=="pending") && (
            <p className="text-sm text-muted">No hay solicitudes pendientes de revisión.</p>
          )}
        </div>
      </section>

      <section className={panel}>
        <h2 className="text-xl font-medium text-bone">Pacientes con acceso</h2>
        <div className="mt-5 space-y-3">
          {patients.length ? patients.map(patient => (
            <article key={patient.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line p-5">
              <div>
                <h3 className="text-sm font-medium text-bone">{patient.display_name}</h3>
                <p className="mt-1 text-xs text-muted">{patient.email}</p>
                <p className="mt-2 text-xs text-quiet">
                  {patient.status === "active" ? "Acceso permitido" : "Acceso suspendido"} ·
                  {patient.consent_at ? " Consentimiento registrado" : " Consentimiento pendiente"}
                </p>
              </div>
              <form action={setCarePatientAccess}>
                <input name="patientId" type="hidden" value={patient.id} />
                <input name="status" type="hidden" value={patient.status === "active" ? "suspended" : "active"}/>
                <button type="submit" className={outline}>
                  {patient.status === "active" ? "Suspender acceso" : "Restablecer acceso"}
                </button>
              </form>
            </article>
          )) : <p className="text-sm text-muted">Aún no hay pacientes inscritos.</p>}
        </div>
      </section>

      <section className={panel}>
        <h2 className="text-xl font-medium text-bone">2 · Redactar un plan individual</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Cada línea de una fase se convierte en una instrucción. No incluyas información que el paciente no deba consultar.
          Este formulario crea un borrador, no lo publica.
        </p>
        {patients.length ? (
          <form action={createCarePlan} className="mt-7 space-y-5">
            <label className="block text-xs text-muted">Paciente
              <select name="patientId" required className={"mt-2 "+field} defaultValue="">
                <option value="" disabled>Selecciona un paciente</option>
                {patients.filter(p=>p.status==="active").map(p=><option key={p.id} value={p.id}>{p.display_name} · {p.email}</option>)}
              </select>
            </label>
            <label className="block text-xs text-muted">Título clínico
              <input name="title" required maxLength={140} className={"mt-2 "+field} placeholder="Seguimiento de dermatitis facial"/>
            </label>
            <label className="block text-xs text-muted">Resumen aprobado en valoración
              <textarea name="summary" required maxLength={1200} rows={3} className={"mt-2 "+field} placeholder="Objetivo y criterios para adaptar el tratamiento."/>
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              {[1,2,3,4].map(n=>(
                <div key={n} className="rounded-2xl border border-line p-5">
                  <p className="mb-4 text-xs uppercase tracking-[.15em] text-champagne">Fase {n} {n > 2 ? "· opcional" : ""}</p>
                  <label className="block text-xs text-muted">Nombre de la fase
                    <input name={"phase"+n+"Title"} required={n<=2} maxLength={100} className={"mt-2 "+field} placeholder={n===1?"Recuperar barrera cutánea":"Control y seguimiento"}/>
                  </label>
                  <label className="mt-4 block text-xs text-muted">Indicaciones (una por línea)
                    <textarea name={"phase"+n+"Items"} required={n<=2} rows={5} maxLength={6400} className={"mt-2 "+field} placeholder={"Aplicar solamente lo indicado.\nSolicitar revisión ante empeoramiento."}/>
                  </label>
                </div>
              ))}
            </div>
            <button type="submit" className={btn}>Guardar borrador clínico</button>
          </form>
        ) : <p className="mt-6 text-sm text-muted">Autoriza al primer paciente para poder crear un plan.</p>}
      </section>

      <section className={panel}>
        <h2 className="text-xl font-medium text-bone">3 · Revisar y publicar</h2>
        <p className="mt-3 text-sm text-muted">Lee las instrucciones completas antes de aprobar. La siguiente versión reemplaza atómicamente la anterior.</p>
        <div className="mt-6 space-y-4">
          {plans.length ? plans.map(plan=>(
            <article key={plan.id} className="rounded-2xl border border-line bg-background/45 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{patientNames.get(plan.patient_id) ?? "Paciente"} · Versión {plan.revision}</p>
                  <h3 className="mt-1 text-base font-medium text-bone">{plan.title}</h3>
                </div>
                <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">{plan.status==="published"?"Publicado":plan.status==="draft"?"Borrador":"Archivado"}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{plan.summary}</p>
              <ol className="mt-4 space-y-4 border-t border-line pt-4">
                {plan.phases.map((phase,idx)=>(
                  <li key={idx}>
                    <p className="text-sm font-medium text-bone">{idx+1}. {phase.title}</p>
                    <ul className="ml-5 mt-2 list-disc space-y-1 text-xs leading-6 text-muted">
                      {phase.items.map((item,j)=><li key={j}>{item}</li>)}
                    </ul>
                  </li>
                ))}
              </ol>
              {plan.status==="draft" && (
                <form action={publishCarePlan} className="mt-5">
                  <input type="hidden" name="planId" value={plan.id}/>
                  <button type="submit" className={btn}>He revisado y apruebo publicar</button>
                </form>
              )}
              {plan.status==="published" && (
                <form action={archiveCarePlan} className="mt-5">
                  <input type="hidden" name="planId" value={plan.id}/>
                  <button type="submit" className={outline}>Retirar acceso a este plan</button>
                </form>
              )}
            </article>
          )) : <p className="text-sm text-muted">Aún no hay planes.</p>}
        </div>
      </section>

      <section className={panel}>
        <h2 className="flex items-center gap-2 text-xl font-medium text-bone"><CheckCircle2 className="h-5 w-5 text-champagne"/> 4 · Evolución recibida</h2>
        <div className="mt-6 space-y-3">
          {followups.length ? followups.map(item=>(
            <article key={item.id} className="rounded-2xl border border-line p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div><p className="text-sm font-medium text-bone">{patientNames.get(item.patient_id) ?? "Paciente"}</p>
                  <p className="mt-1 text-xs text-muted">{planNames.get(item.plan_id) ?? "Plan"} · {item.reported_state==="better"?"Mejor":item.reported_state==="same"?"Sin cambios":"Peor"} · {new Date(item.created_at).toLocaleString("es-MX",{timeZone:"America/Merida"})}</p></div>
                <span className="text-xs text-muted">{item.review_status==="new"?"Pendiente de revisión":"Revisado"}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-bone">{item.message}</p>
              {item.review_status==="new" && <form action={reviewCareReport} className="mt-4">
                <input name="reportId" type="hidden" value={item.id}/>
                <button className={outline} type="submit">Marcar como revisado</button>
              </form>}
            </article>
          )):<p className="text-sm text-muted">Todavía no hay reportes de evolución.</p>}
        </div>
        <p className="mt-5 text-xs leading-6 text-quiet">Marcar como revisado no equivale a responder al paciente ni a emitir una nueva indicación.</p>
      </section>
    </div>
  );
}
