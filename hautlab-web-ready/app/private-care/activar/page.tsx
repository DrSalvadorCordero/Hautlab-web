import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, LockKeyhole } from "lucide-react";
import { CareActivationForm } from "@/components/private-care/care-activation-form";
import { getPrivateCarePatient, verifiedCareIdentity } from "@/lib/server/private-care";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function ActivatePrivateCare() {
  const identity = await verifiedCareIdentity();
  if (!identity) redirect("/private-care/iniciar-sesion");
  const current = await getPrivateCarePatient();
  if (current) redirect("/private-care");
  return (
    <main id="contenido-principal" className="min-h-[80svh] bg-background px-4 py-16 text-bone">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-line bg-white/[.035] p-7 sm:p-10">
        <p className="text-xs uppercase tracking-[.24em] text-champagne">HAUTLAB · Private Care</p>
        <LockKeyhole className="mt-6 h-7 w-7 text-champagne" aria-hidden="true"/>
        <h1 className="mt-5 font-serif text-4xl tracking-[-.04em]">Activa tu espacio privado.</h1>
        <p className="mt-5 text-sm leading-7 text-muted">
          Tu correo ya está verificado. Si HAUTLAB te entregó un código personal,
          introdúcelo para activar tu cuenta sin esperar una aprobación adicional.
        </p>
        <p className="mt-4 rounded-xl border border-line bg-background p-4 text-xs text-bone">
          Cuenta verificada: {identity.email}
        </p>
        <CareActivationForm/>
        <div className="mt-8 flex items-start gap-3 border-t border-line pt-5">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-champagne" aria-hidden="true"/>
          <p className="text-xs leading-6 text-muted">
            Tu código es personal, de un solo uso y válido 48 horas. Recibirlo solo es posible
            si previamente verificaste tu identidad con el equipo clínico.
            La activación no sustituye el consentimiento para consultar indicaciones médicas.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-5 text-xs">
          <Link href="/private-care/solicitar" className="text-champagne underline underline-offset-4">
            No tengo código · Solicitar verificación
          </Link>
          <Link href="/aviso-de-privacidad" className="text-muted underline underline-offset-4">
            Aviso de privacidad
          </Link>
        </div>
      </div>
    </main>
  );
}