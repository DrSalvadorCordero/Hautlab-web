import { Hero } from "@/components/Hero";
import { MethodSection } from "@/components/MethodSection";
import { TreatmentCards } from "@/components/TreatmentCards";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MethodSection />
      <TreatmentCards />

      <section className="section">
        <div className="container split-panel">
          <div className="panel">
            <p className="section-kicker">Consulta</p>
            <h2>La valoración ordena la decisión.</h2>
            <p className="section-text" style={{ marginTop: 24 }}>
              Antes de indicar toxina, relleno, bioestimulación, láser o tratamiento dermatológico, se define si el caso realmente es candidato y qué secuencia aporta más valor.
            </p>
          </div>
          <div className="panel panel-soft">
            <ul className="list-clean">
              <li>Diagnóstico médico-estético inicial.</li>
              <li>Priorización por zonas y capas.</li>
              <li>Plan progresivo según presupuesto y objetivo.</li>
              <li>Comunicación clara de límites, riesgos y expectativas.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container section-header" style={{ marginBottom: 0 }}>
          <div>
            <p className="section-kicker">Agenda</p>
            <h2>Empieza con una valoración privada.</h2>
          </div>
          <div>
            <p className="section-text">
              La consulta estética tiene un costo de $1,300 MXN y puede abonarse al procedimiento si se realiza el mismo día y el caso es candidato.
            </p>
            <div className="section-actions" style={{ marginTop: 24 }}>
              <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
                Agendar por WhatsApp
              </a>
              <a className="button" href="/contacto">
                Ver contacto
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
