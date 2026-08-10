"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trackHautlabEvent } from "@/lib/client-analytics";

type CheckoutResponse = {
  checkoutUrl?: string;
  reference?: string;
  testMode?: boolean;
  error?: string;
  message?: string;
};

function checkoutError(payload: CheckoutResponse, status: number) {
  if (status === 429 || payload.error === "rate_limit") {
    return payload.message ?? "Espera unos minutos antes de volver a intentarlo.";
  }
  if (payload.error === "invalid_payload") {
    return "Revisa tu nombre, apellido y correo electrónico.";
  }
  return "No pudimos abrir Mercado Pago en este momento. Intenta de nuevo o solicita apoyo por WhatsApp.";
}

export function MercadoPagoCheckout() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    trackHautlabEvent("payment_begin_checkout", { payment_provider: "mercado_pago", value: 1300, currency: "MXN" });

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/payments/mercado-pago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          email: form.get("email"),
          acceptPrivacy: form.get("acceptPrivacy") === "on"
        })
      });
      const payload = (await response.json().catch(() => ({}))) as CheckoutResponse;
      if (!response.ok || !payload.checkoutUrl || !payload.reference) {
        throw new Error(checkoutError(payload, response.status));
      }

      trackHautlabEvent("payment_checkout_redirect", {
        payment_provider: "mercado_pago",
        test_mode: payload.testMode === true
      });
      window.location.assign(payload.checkoutUrl);
    } catch (checkoutFailure) {
      const message = checkoutFailure instanceof Error ? checkoutFailure.message : "No pudimos iniciar el pago.";
      setError(message);
      setSubmitting(false);
    }
  }

  return (
    <Card id="mercado-pago" className="scroll-mt-28 border-champagne/25 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-champagne">Checkout seguro</p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-bone">Pagar valoración médica</h2>
        </div>
        <div className="rounded-full border border-champagne/25 bg-champagne/10 p-3 text-champagne">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between border-y border-line py-5">
        <div>
          <p className="text-sm text-muted">Valoración médica HAUTLAB</p>
          <p className="mt-1 text-xs text-quiet">Mérida · con cita previa</p>
        </div>
        <p className="text-2xl font-medium tracking-[-0.04em] text-bone">$1,300 MXN</p>
      </div>

      <form className="mt-7 space-y-5" onSubmit={submitCheckout}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-muted">
            <span>Nombre</span>
            <Input name="firstName" autoComplete="given-name" minLength={2} maxLength={80} required disabled={submitting} />
          </label>
          <label className="space-y-2 text-sm text-muted">
            <span>Apellido</span>
            <Input name="lastName" autoComplete="family-name" minLength={2} maxLength={120} required disabled={submitting} />
          </label>
        </div>

        <label className="block space-y-2 text-sm text-muted">
          <span>Correo para el comprobante</span>
          <Input name="email" type="email" autoComplete="email" maxLength={254} required disabled={submitting} />
        </label>

        <label className="flex items-start gap-3 text-sm leading-6 text-muted">
          <input
            className="mt-1 h-4 w-4 shrink-0 accent-[#c8b39a]"
            type="checkbox"
            name="acceptPrivacy"
            required
            disabled={submitting}
          />
          <span>
            Leí el <Link className="text-bone underline decoration-line underline-offset-4" href="/aviso-de-privacidad">aviso de privacidad</Link> y autorizo el uso de estos datos para procesar el pago.
          </span>
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm leading-6 text-red-100" role="alert">
            {error}
          </p>
        ) : null}

        <Button className="w-full" size="lg" type="submit" disabled={submitting} data-event="payment_mercado_pago_checkout">
          {submitting ? (
            <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Preparando pago seguro</>
          ) : (
            <>Continuar en Mercado Pago <ArrowRight className="h-4 w-4" aria-hidden="true" /></>
          )}
        </Button>

        <p className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-quiet">
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          Tus datos de tarjeta se capturan únicamente en Mercado Pago.
        </p>
      </form>
    </Card>
  );
}
