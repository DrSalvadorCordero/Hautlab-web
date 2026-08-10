import type { Metadata } from "next";
import { ArrowRight, CreditCard, MessageCircle, ReceiptText, ShieldCheck, Stethoscope } from "lucide-react";
import { MercadoPagoCheckout } from "@/components/payments/mercado-pago-checkout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { paymentOptions } from "@/data/site";
import { getActivePaymentMode } from "@/lib/payments/mercado-pago";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const paymentsUrl = `${siteConfig.url}/pagos`;

export const metadata: Metadata = {
  title: "Pagos seguros | HAUTLAB + Dr. Salvador Cordero",
  description: "Paga en línea tu valoración médica HAUTLAB o solicita un enlace personalizado para otro concepto.",
  alternates: { canonical: paymentsUrl },
  openGraph: {
    title: "Pagos seguros | HAUTLAB",
    description: "Checkout seguro para valoración médica y opciones de pago de HAUTLAB Mérida.",
    url: paymentsUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Pagos seguros | HAUTLAB",
    description: "Pago de valoración médica y reservaciones HAUTLAB Mérida."
  }
};

async function mercadoPagoCheckoutIsVisible() {
  if (process.env.VERCEL_ENV !== "production") return true;

  try {
    return (await getActivePaymentMode()) === "production";
  } catch {
    return false;
  }
}

export default async function PagosPage() {
  const stripe = paymentOptions[0];
  const showMercadoPagoCheckout = await mercadoPagoCheckoutIsVisible();
  const paymentSupportUrl = buildWhatsAppLink("Hola, quiero solicitar un link de pago personalizado para HAUTLAB.");

  return (
    <main>
      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1fr_.9fr] lg:items-end">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.24em] text-champagne">Pagos HAUTLAB</p>
            <h1 className="font-serif text-[clamp(3rem,7vw,6.2rem)] leading-[.9] tracking-[-.065em] text-bone">
              Pagos seguros y reservaciones.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
              {showMercadoPagoCheckout
                ? "Paga tu valoración médica de $1,300 MXN con Mercado Pago. Para procedimientos, paquetes o montos distintos, solicita primero un enlace personalizado."
                : "Paga de forma segura con el enlace indicado por el equipo. Para una valoración, procedimiento o monto específico, solicita primero tu enlace personalizado."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {showMercadoPagoCheckout ? (
                <Button asChild size="lg">
                  <a href="#mercado-pago" data-event="payment_mercado_pago_hero">
                    Pagar valoración <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <a href={paymentSupportUrl} target="_blank" rel="noreferrer" data-event="whatsapp_payment_link">
                    Solicitar enlace <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              )}
              {stripe ? (
                <Button asChild size="lg" variant="outline">
                  <a href={stripe.href} target="_blank" rel="noreferrer" data-event="payment_stripe_hero">
                    Pagar con Stripe
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          <Card className="p-7">
            <CreditCard className="mb-6 h-7 w-7 text-champagne" aria-hidden="true" />
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Importante</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-bone">Pago seguro, indicación médica.</h2>
            <p className="mt-5 text-sm leading-7 text-muted">
              El pago confirma el anticipo, no una fecha automática. El equipo valida disponibilidad y vincula el comprobante con tu cita.
            </p>
          </Card>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[1.05fr_.8fr] lg:items-start">
          {showMercadoPagoCheckout ? (
            <MercadoPagoCheckout />
          ) : (
            <Card className="p-7 sm:p-8">
              <MessageCircle className="mb-7 h-7 w-7 text-champagne" aria-hidden="true" />
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Pago asistido</p>
              <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-bone">Solicita tu enlace seguro.</h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                El equipo confirma el concepto y el monto antes de compartirte el enlace correcto para pagar.
              </p>
              <Button asChild className="mt-7" size="lg">
                <a href={paymentSupportUrl} target="_blank" rel="noreferrer" data-event="whatsapp_payment_link">
                  Solicitar por WhatsApp <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </Card>
          )}

          <div className="space-y-4">
            <Card className="p-7">
              <Stethoscope className="mb-7 h-7 w-7 text-champagne" aria-hidden="true" />
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Qué estás pagando</p>
              <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-bone">Valoración médica individual.</h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                Incluye la valoración clínica inicial. Los estudios, medicamentos o procedimientos posteriores dependen del diagnóstico y se cotizan por separado.
              </p>
            </Card>

            <Card className="p-7">
              <ShieldCheck className="mb-7 h-7 w-7 text-champagne" aria-hidden="true" />
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Protección</p>
              <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-bone">HAUTLAB no recibe datos de tarjeta.</h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                El cobro se completa en el entorno de Mercado Pago. HAUTLAB conserva únicamente la referencia, el concepto y el estado necesarios para conciliarlo.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-soft py-20 lg:py-24">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="mb-9 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Otras opciones</p>
            <h2 className="mt-4 font-serif text-4xl tracking-[-0.055em] text-bone">Elige según el concepto.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stripe ? (
              <a href={stripe.href} target="_blank" rel="noreferrer" data-event="payment_stripe_card" className="rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-champagne">
                <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-champagne/40">
                  <stripe.icon className="mb-8 h-6 w-6 text-champagne" aria-hidden="true" />
                  <p className="text-xs uppercase tracking-[0.18em] text-champagne">Stripe</p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">Pago alternativo</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">Utiliza el enlace seguro de Stripe si esa es tu opción indicada.</p>
                </Card>
              </a>
            ) : null}

            <a href={paymentSupportUrl} target="_blank" rel="noreferrer" data-event="whatsapp_payment_link" className="rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-champagne">
              <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-champagne/40">
                <MessageCircle className="mb-8 h-6 w-6 text-champagne" aria-hidden="true" />
                <p className="text-xs uppercase tracking-[0.18em] text-champagne">WhatsApp</p>
                <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">Link personalizado</h3>
                <p className="mt-4 text-sm leading-7 text-muted">Para procedimientos, paquetes o montos específicos previamente indicados.</p>
              </Card>
            </a>

            <a href={buildWhatsAppLink("Hola, ya realicé mi pago y quiero enviar mi comprobante.")} target="_blank" rel="noreferrer" data-event="whatsapp_payment_receipt" className="rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-champagne">
              <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-champagne/40">
                <ReceiptText className="mb-8 h-6 w-6 text-champagne" aria-hidden="true" />
                <p className="text-xs uppercase tracking-[0.18em] text-champagne">Comprobante</p>
                <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">Enviar comprobante</h3>
                <p className="mt-4 text-sm leading-7 text-muted">Comparte tu referencia para confirmar agenda o solicitar seguimiento.</p>
              </Card>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
