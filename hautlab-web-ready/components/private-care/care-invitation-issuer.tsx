"use client";

import { useActionState } from "react";
import { useState } from "react";
import { issueCareInvitation, type CareInvitationResult } from "@/app/private-care/actions";

const initial: CareInvitationResult = { code: null, error: null };

export function CareInvitationIssuer() {
  const [state, action, pending] = useActionState(issueCareInvitation, initial);
  const [copied, setCopied] = useState(false);
  const message = state.code
    ? "HAUTLAB Private Care: registra tu correo en https://hautlabmx.com/private-care/empezar y usa este código personal (vigente 48 horas, de un solo uso): " + state.code
    : "";
  return (
    <div className="rounded-[1.7rem] border border-line bg-white/[0.035] p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[.24em] text-champagne">Activación sin aprobación posterior</p>
      <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">Invitación de un solo uso.</h2>
      <p className="mt-4 text-sm leading-7 text-muted">
        Después de identificar al paciente por su expediente y un canal clínico previamente registrado,
        genera un código válido por 48 horas. Entrégalo solo a ese paciente.
        Se activará automáticamente cuando verifique su propio correo e introduzca el código.
      </p>
      <form action={action} className="mt-6 grid max-w-lg gap-4">
        <label className="block text-xs text-muted">
          Nombre como aparece en el expediente
          <input name="displayName" minLength={2} maxLength={120} required
            placeholder="Nombre completo"
            className="mt-2 w-full min-h-12 rounded-xl border border-line bg-background px-4 py-3 text-sm text-bone focus:border-champagne"/>
        </label>
        <label className="flex items-start gap-3 text-xs leading-6 text-muted">
          <input name="verifiedClinically" value="confirmado" type="checkbox" required className="mt-1 accent-[#c5a46d]" />
          Confirmo que comprobé la identidad y que entregaré el código exclusivamente
          al contacto que ya consta en el expediente, o personalmente.
        </label>
        <button type="submit" disabled={pending}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-champagne px-6 py-3 text-sm font-medium text-background disabled:opacity-60">
          {pending ? "Generando…" : "Generar código de activación"}
        </button>
      </form>
      {state.error && <p role="alert" className="mt-4 text-sm text-amber-200">{state.error}</p>}
      {state.code && (
        <div className="mt-6 rounded-2xl border border-champagne/40 bg-background p-5">
          <p className="text-xs font-medium uppercase tracking-[.18em] text-champagne">Código generado · mostrar una sola vez</p>
          <p className="mt-4 break-all font-mono text-sm leading-7 tracking-[.08em] text-bone">{state.code}</p>
          <p className="mt-3 text-xs leading-6 text-muted">
            Caduca a las 48 horas. Se invalida al utilizarse. No lo publiques ni lo envíes a un grupo.
          </p>
          <button type="button" onClick={() => {
            if (typeof navigator !== "undefined" && navigator.clipboard) {
              void navigator.clipboard.writeText(message).then(() => setCopied(true)).catch(() => setCopied(false));
            }
          }} className="mt-4 rounded-full border border-line px-5 py-3 text-xs text-bone hover:border-champagne">
            {copied ? "Mensaje copiado" : "Copiar invitación para WhatsApp"}
          </button>
        </div>
      )}
    </div>
  );
}
