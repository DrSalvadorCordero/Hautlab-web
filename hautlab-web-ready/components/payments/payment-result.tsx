"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackHautlabEvent } from "@/lib/client-analytics";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type PublicPaymentOrder = {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  product: string;
  testMode: boolean;
  updatedAt: string;
};

type ResultTone = "loading" | "success" | "pending" | "failure" | "support";

function resultContent(status: string): { tone: ResultTone; title: string; description: string } {
  if (status === "approved") {
    return {
      tone: "success",
      title: "Pago confirmado.",
      description: "Tu pago quedó acreditado. Escríbenos para vincularlo con tu cita y confirmar disponibilidad."
    };
  }
  if (["pending", "authorized", "in_process", "in_mediation"].includes(status)) {
    return {
      tone: "pending",
      title: "Pago en validación.",
      description: "Mercado Pago está procesando la operación. Esta página se actualizará automáticamente."
    };
  }
  if (["rejected", "cancelled", "expired", "error"].includes(status)) {
    return {
      tone: "failure",
      title: "El pago no se completó.",
      description: "No se registró un cobro aprobado. Puedes volver a intentarlo o solicitar apoyo por WhatsApp."
    };
  }
  if (["refunded", "charged_back"].includes(status)) {
    return {
      tone: "support",
      title: "La operación requiere seguimiento.",
      description: "El pago tiene un reembolso o contracargo registrado. Contáctanos para revisar el movimiento."
    };
  }
  return {
    tone: "loading",
    title: "Confirmando tu pago…",
    description: "Estamos consultando el estado directamente con Mercado Pago."
  };
}

function ResultIcon({ tone }: { tone: ResultTone }) {
  if (tone === "success") return <CheckCircle2 className="h-8 w-8" aria-hidden="true" />;
  if (tone === "pending") return <Clock3 className="h-8 w-8" aria-hidden="true" />;
  if (tone === "failure" || tone === "support") return <AlertTriangle className="h-8 w-8" aria-hidden="true" />;
  return <LoaderCircle className="h-8 w-8 animate-spin" aria-hidden="true" />;
}

export function PaymentResult({ reference, paymentId }: { reference: string | null; paymentId: string | null }) {
  const [order, setOrder] = useState<PublicPaymentOrder | null>(null);
  const [failed, setFailed] = useState(!reference);
  const trackedReference = useRef<string | null>(null);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let timer: number | null = null;
    let attempts = 0;

    const load = async () => {
      const query = new URLSearchParams({ reference });
      if (paymentId) query.set("payment_id", paymentId);

      try {
        const response = await fetch(`/api/payments/mercado-pago/status?${query}`, { cache: "no-store" });
        if (!response.ok) throw new Error("status_unavailable");
        const payload = (await response.json()) as PublicPaymentOrder;
        if (cancelled) return;
        setOrder(payload);
        setFailed(false);

        if (payload.status === "approved" && trackedReference.current !== payload.reference) {
          trackedReference.current = payload.reference;
          trackHautlabEvent("payment_confirmed", {
            payment_provider: "mercado_pago",
            transaction_id: payload.reference,
            value: payload.amount,
            currency: payload.currency,
            test_mode: payload.testMode
          });
        }

        const shouldPoll = ["created", "preference_created", "pending", "authorized", "in_process"].includes(payload.status);
        attempts += 1;
        if (shouldPoll && attempts < 10) timer = window.setTimeout(load, 2500);
      } catch {
        if (cancelled) return;
        attempts += 1;
        if (attempts < 4) timer = window.setTimeout(load, 2500);
        else setFailed(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [paymentId, reference]);

  const content = failed
    ? { tone: "failure" as const, title: "No pudimos consultar el pago.", description: "Conserva tu comprobante y contáctanos para revisarlo de forma segura." }
    : resultContent(order?.status ?? "created");
  const shortReference = order?.reference.slice(0, 8).toUpperCase() ?? reference?.slice(0, 8).toUpperCase();
  const supportMessage = shortReference
    ? `Hola, quiero confirmar un pago de valoración HAUTLAB. Referencia ${shortReference}.`
    : "Hola, quiero confirmar un pago de valoración HAUTLAB.";

  return (
    <Card className="mx-auto max-w-2xl border-champagne/25 p-7 text-center sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-champagne/25 bg-champagne/10 text-champagne">
        <ResultIcon tone={content.tone} />
      </div>
      <p className="mt-7 text-xs uppercase tracking-[0.2em] text-champagne">Mercado Pago · HAUTLAB</p>
      <h1 className="mt-4 font-serif text-4xl tracking-[-0.055em] text-bone sm:text-5xl">{content.title}</h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">{content.description}</p>

      {order ? (
        <div className="mt-8 grid gap-3 rounded-3xl border border-line bg-white/[0.025] p-5 text-left sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-quiet">Concepto</p>
            <p className="mt-2 text-sm text-bone">{order.product}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-quiet">Importe</p>
            <p className="mt-2 text-sm text-bone">${order.amount.toLocaleString("es-MX")} {order.currency}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-quiet">Referencia</p>
            <p className="mt-2 font-mono text-sm text-bone">{shortReference}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-quiet">Estado verificado</p>
            <p className="mt-2 text-sm capitalize text-bone">{order.status.replaceAll("_", " ")}</p>
          </div>
        </div>
      ) : null}

      {order?.testMode ? (
        <p className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-xs text-amber-100">
          Operación de prueba: no representa un cobro real.
        </p>
      ) : null}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <a href={buildWhatsAppLink(supportMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_payment_confirmation">
            Confirmar por WhatsApp
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/pagos"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Volver a pagos</Link>
        </Button>
      </div>
    </Card>
  );
}
