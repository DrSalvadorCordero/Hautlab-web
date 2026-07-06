import type { Metadata } from "next";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Botox en Mérida | Toxina botulínica | Dr. Salvador Cordero | HAUTLAB",
  description: "Aplicación médica de toxina botulínica en Mérida para expresión, arrugas dinámicas y resultados sobrios."
};

const zones = [
  "Frente",
  "Entrecejo",
  "Patas de gallo",
  "Ajustes específicos según movimiento facial"
];

export default function BotoxPage() {
  return (
    <main>
      <section className="hero" style={{ minHeight: "auto", padding: "74px 0 54px", backgroundImage: "linear-gradient(90deg, rgba(11,10,9,.96), rgba(11,10,9,.70)), url('/visuals/skin-macro.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="container split-panel">
          <div>
            <p className="eyebrow">TOXINA BOTULÍNICA EN MÉRIDA</p>
            <h1 style={{ fontSize: "clamp(48px, 7vw, 94px)", lineHeight: .9, letterSpacing: "-.06em" }}>Descansar la expresión. No borrar el rostro.</h1>
            <p className="lead" style={{ maxWidth: 720 }}>Aplicación médica de toxina botulínica para suavizar arrugas dinámicas, controlar fuerza muscular y conservar una expresión natural.</p>
            <div className="hero-actions">
              <a className="button button-primary" href={buildWhatsAppLink("Hola, quiero información sobre Botox / toxina botulínica con el Dr. Salvador Cordero.")} target="_blank" rel="noreferrer">Agendar valoración</a>
              <a className="button" href="/">Volver a HAUTLAB</a>
            </div>
          </div>
          <aside className="panel panel-soft">
            <p className="section-kicker">Tercio superior</p>
            <h2>$3,500 MXN</h2>
            <p className="section-text" style={{ marginTop: 16 }}>Dosis completa según valoración, fuerza muscular y patrón de movimiento.</p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container split-panel">
          <div className="panel panel-soft">
            <p className="section-kicker">Objetivo</p>
            <h2>Resultado fresco, no congelado.</h2>
            <p className="section-text" style={{ marginTop: 20 }}>El objetivo no es quitar toda expresión. Es disminuir contracción excesiva, suavizar líneas y mantener proporción entre cejas, frente y mirada.</p>
          </div>
          <div className="panel">
            <p className="section-kicker">Zonas frecuentes</p>
            <ul className="list-clean">
              {zones.map((zone) => <li key={zone}>{zone}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container section-header" style={{ marginBottom: 0 }}>
          <div>
            <p className="section-kicker">Agenda</p>
            <h2>La dosis se decide en valoración.</h2>
          </div>
          <a className="button button-primary" href={buildWhatsAppLink("Hola, quiero agendar valoración para toxina botulínica.")} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
