"use client";

import { useActionState } from "react";
import { claimCareInvitation, type CareActivationResult } from "@/app/private-care/actions";

const initial: CareActivationResult = { error: null };

export function CareActivationForm() {
  const [state, action, pending] = useActionState(claimCareInvitation, initial);
  return (
    <form action={action} className="mt-7 space-y-5">
      <label className="block text-xs text-muted">
        Código personal recibido de HAUTLAB
        <input name="code" required autoComplete="off" minLength={48} maxLength={90}
          spellCheck={false} autoCapitalize="off" type="text"
          placeholder="Pega aquí tu código"
          className="mt-2 w-full min-h-12 rounded-xl border border-line bg-background px-4 py-3 font-mono text-sm text-bone focus:border-champagne" />
      </label>
      <label className="flex items-start gap-3 text-xs leading-6 text-muted">
        <input type="checkbox" name="privacy" value="acepto" required className="mt-1 accent-[#c5a46d]"/>
        Acepto utilizar mi correo verificado y mi identificador de cuenta para activar este
        espacio privado. Después revisaré el consentimiento de seguimiento clínico.
      </label>
      {state.error && <p role="alert" className="text-sm text-amber-200">{state.error}</p>}
      <button disabled={pending} type="submit"
        className="inline-flex min-h-12 items-center rounded-full bg-champagne px-6 py-3 text-sm font-medium text-background disabled:opacity-60">
        {pending ? "Validando…" : "Activar mi acceso"}
      </button>
    </form>
  );
}
