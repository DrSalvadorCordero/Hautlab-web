import type { Metadata } from "next";
import { ArrowRight, CreditCard, MessageCircle, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { paymentOptions } from "@/data/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Pagos seguros | HAUTLAB + Dr. Salvador Cordero",
  description: "Pagos seguros para valoración, apartado o link personalizado de HAUTLAB en Mérida."
};

export default function PagosPage() {
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
              Realiza tu pago de valoración, apartado o solicita un link personalizado para procedimiento. Los procedimientos están sujetos a valoración médica previa.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {paymentOptions.map((option) => (
                <Button key={option.label} asChild size="lg" variant={option.label === "Stripe" ? "default" : "outline"}>
                  <a href={option.href} target="_blank" rel="noreferrer">
                    Pagar con {option.label} <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <Card className="p-7">
            <CreditCard className="mb-6 h-7 w-7 text-champagne" />
            <p className="text-xs uppercase tracking-[0.18em] text-champagne">Importante</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-bone">Pago seguro, indicación médica.</h2>
            <p className="mt-5 text-sm leading-7 text-muted">
              Si el monto depende del procedimiento, solicita un link personalizado antes de pagar.
            </p>
          </Card>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-4 md:grid-cols-2 lg:grid-cols-4">
          {paymentOptions.map((option) => {
            const Icon = option.icon;
            return (
              <a key={option.label} href={option.href} target="_blank" rel="noreferrer">
                <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-champagne/40">
                  <Icon className="mb-8 h-6 w-6 text-champagne" />
                  <p className="text-xs uppercase tracking-[0.18em] text-champagne">{option.label}</p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">Pagar con {option.label}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">Pago seguro. Conserva tu comprobante y envíalo por WhatsApp.</p>
                </Card>
              </a>
            );
          })}

          <a href={buildWhatsAppLink("Hola, quiero solicitar un link de pago personalizado para HAUTLAB.")} target="_blank" rel="noreferrer">
            <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-champagne/40">
              <MessageCircle className="mb-8 h-6 w-6 text-champagne" />
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">WhatsApp</p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">Solicitar link personalizado</h3>
              <p className="mt-4 text-sm leading-7 text-muted">Para procedimientos, paquetes o montos específicos.</p>
            </Card>
          </a>

          <a href={buildWhatsAppLink("Hola, ya realicé mi pago y quiero enviar mi comprobante.")} target="_blank" rel="noreferrer">
            <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-champagne/40">
              <ReceiptText className="mb-8 h-6 w-6 text-champagne" />
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Comprobante</p>
              <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-bone">Enviar comprobante</h3>
              <p className="mt-4 text-sm leading-7 text-muted">Comparte tu comprobante para confirmar agenda o seguimiento.</p>
            </Card>
          </a>
        </div>
      </section>
    </main>
  );
}
