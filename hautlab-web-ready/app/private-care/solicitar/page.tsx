import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { getCareAccessRequest, getPrivateCarePatient } from "@/lib/server/private-care";
import { requestCareEnrollment } from "@/app/private-care/actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const box = "mx-auto max-w-xl rounded-[2rem] border border-line bg-white/[0.035] p-7 sm:p-10";
export default async function RequestPatientCare() {
  const existing = await getPrivateCarePatient();
  if (existing) redirect("/private-care");
  const enrollment = await getCareAccessRequest();
  if (!enrollment) redirect("/private-care/iniciar-sesion");
  const request = enrollment.request;
  return (
    <main id="contenido-principal" className="min-h-[80svh] bg-background px-4 py-16 text-bone">
      <section className={box}>
        <p className="text-xs uppercase tracking-[.24em] text-champagne">HAUTLAB · Private Care</p>
        <LockKeyhole className="mt-6 h-7 w-7 text-champagne" aria-hidden="true" />
        {request?.status === "pending" ? (
          <>
            <h1 className="mt-5 font-serif text-4xl">Tu solicitud está en revisión.</h1>
            <p className="mt-5 text-sm leading-7 text-muted">
              Tu correo ya está verificado. HAUTLAB confirmará tu identidad con el expediente
              antes de autorizar tu acceso. No es necesario solicitarlo nuevamente.
            </p>
          </>
        ) : request?.status === "approved" ? (
          <>
            <h1 className="mt-5 font-serif text-4xl">Solicitud aprobada.</h1>
            <p className="mt-5 text-sm leading-7 text-muted">Tu cuenta está autorizada. Accede a tu espacio individual.</p>
            <Link href="/private-care" className="mt-6 inline-flex rounded-full bg-champagne px-6 py-3 text-sm font-medium text-background">Abrir mi espacio</Link>
          </>
        ) : request?.status === "rejected" ? (
          <>
            <h1 className="mt-5 font-serif text-4xl">Se necesita verificar tu identidad.</h1>
            <p className="mt-5 text-sm leading-7 text-muted">Comunícate directamente con HAUTLAB para comprobar tu registro. No se ha habilitado ningún expediente.</p>
          </>
        ) : (
          <>
            <h1 className="mt-5 font-serif text-4xl">Solicita tu acceso exclusivo.</h1>
            <p className="mt-5 text-sm leading-7 text-muted">
              Tu correo verificado es <strong className="text-bone">{enrollment.identity.email}</strong>.
              HAUTLAB revisará la solicitud antes de permitirte consultar indicaciones médicas.
            </p>
            <form action={requestCareEnrollment} className="mt-7 space-y-5">
              <label className="block text-xs text-muted">
                Nombre completo como aparece en tu expediente
                <input name="displayName" required minLength={2} maxLength={120} autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-line bg-background p-3 text-sm text-bone outline-none focus:border-champagne" />
              </label>
              <label className="flex items-start gap-3 text-xs leading-6 text-muted">
                <input type="checkbox" name="privacy" value="acepto" required className="mt-1 accent-[#c5a46d]" />
                Solicito acceso y acepto que mi nombre, correo verificado e identificador de cuenta
                se usen para validar esta solicitud. He leído el
                <Link href="/aviso-de-privacidad" className="ml-1 text-bone underline" target="_blank" rel="noreferrer">aviso de privacidad</Link>.
              </label>
              <button type="submit" className="inline-flex rounded-full bg-champagne px-6 py-3 text-sm font-medium text-background">
                Enviar solicitud
              </button>
            </form>
          </>
        )}
        <div className="mt-8 flex items-start gap-3 border-t border-line pt-5 text-xs leading-6 text-quiet">
          <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-champagne" />
          Verificar el correo no implica autorización clínica. La identidad debe confirmarse por el profesional.
        </div>
        <Link href="/private-care" className="mt-6 inline-flex text-xs text-champagne underline underline-offset-4">Volver a Private Care</Link>
      </section>
    </main>
  );
}
