import type { Metadata } from "next";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Rinomodelación en Mérida | Dr. Salvador Cordero | HAUTLAB",
  description: "Rinomodelación médica en Mérida con valoración anatómica, enfoque conservador y resultados sobrios."
};

const bullets = [
  "Valoración de dorso, punta, piel, soporte y proporción facial.",
  "Indicación solo si el caso es candidato y el margen de seguridad es adecuado.",
  "Enfoque conservador: corregir proporción, no agrandar la nariz.",
  "Plan progresivo con revisión y criterio médico."
];

export default function RinomodelacionPage() {
  return (
    <main>
      <section className="hero" style={{ minHeight: "auto", padding: "74px 0 54px", backgroundImage: "linear-gradient(90deg, rgba(11,10,9,.96), rgba(11,10,9,.70)), url('/visuals/hero-architecture.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="container split-panel">
          <div>
            <p className="eyebrow">RINOMODELACIÓN EN MÉRIDA</p>
            <h1 style={{ fontSize: "clamp(48px, 7vw, 94px)", lineHeight: .9, letterSpacing: "-.06em" }}>Nariz más armónica. Sin parecer intervenida.</h1>
            <p className="lead" style={{ maxWidth: 720 }}>Procedimiento médico con ácido hialurónico para mejorar dorso, punta y transición nasal cuando el caso es candidato.</p>
            <div className="hero-actions">
              <a className="button button-primary" href={buildWhatsAppLink("Hola, quiero información sobre rinomodelación con el Dr. Salvador Cordero.")} target="_blank" rel="noreferrer">Agendar valoración</a>
              <a className="button" href="/">Volver a HAUTLAB</a>
            </div>
          </div>
          <aside className="panel panel-soft">
            <p className="section-kicker">Desde</p>
            <h2>$5,500 MXN</h2>
            <p className="section-text" style={{ marginTop: 16 }}>Incluye valoración, aplicación, revisión y retoque cuando esté indicado. Preferencial contado sujeto a disponibilidad.</p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container split-panel">
          <div className="panel panel-soft">
            <p className="section-kicker">Criterio</p>
            <h2>No todas las narices deben rellenarse.</h2>
            <p className="section-text" style={{ marginTop: 20 }}>La decisión depende de anatomía, vascularidad, tipo de piel, antecedentes y objetivo. Si la indicación no es segura o no dará un resultado elegante, no se fuerza el procedimiento.</p>
          </div>
          <div className="panel">
            <p className="section-kicker">Se evalúa</p>
            <ul className="list-clean">
              {bullets.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container section-header" style={{ marginBottom: 0 }}>
          <div>
            <p className="section-kicker">Agenda</p>
            <h2>Empieza con valoración médica.</h2>
          </div>
          <a className="button button-primary" href={buildWhatsAppLink("Hola, quiero agendar valoración para rinomodelación.")} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
