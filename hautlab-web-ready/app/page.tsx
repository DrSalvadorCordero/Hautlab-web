import { Hero } from "@/components/Hero";
import { TreatmentCards } from "@/components/TreatmentCards";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TreatmentCards />

      <section className="section" id="metodo">
        <div className="container compact-consult">
          <div>
            <p className="section-kicker">Método HAUTLAB</p>
            <h2>Primero diagnóstico. Después procedimiento.</h2>
            <p>
              La valoración define si conviene tratar, esperar, priorizar o replantear. Se evalúa piel, anatomía, proporción, movimiento, antecedentes y expectativas.
            </p>
          </div>
          <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
            Agendar valoración
          </a>
        </div>
      </section>
    </>
  );
}
