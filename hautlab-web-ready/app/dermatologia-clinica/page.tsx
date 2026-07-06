import type { Metadata } from "next";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Dermatología clínica en Mérida | Dr. Salvador Cordero | HAUTLAB",
  description: "Consulta de dermatología clínica en Mérida para acné, rosácea, dermatitis, manchas, alopecia, uñas y piel sensible."
};

const conditions = [
  "Acné y secuelas",
  "Rosácea y piel sensible",
  "Melasma, manchas y pigmento",
  "Dermatitis, descamación e inflamación",
  "Alopecia y problemas de cuero cabelludo",
  "Uñas, verrugas y lesiones focales"
];

export default function DermatologiaClinicaPage() {
  return (
    <main>
      <section className="hero" style={{ minHeight: "auto", padding: "74px 0 54px", backgroundImage: "linear-gradient(90deg, rgba(11,10,9,.96), rgba(11,10,9,.70)), url('/visuals/clinic-office.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="container split-panel">
          <div>
            <p className="eyebrow">DERMATOLOGÍA CLÍNICA EN MÉRIDA</p>
            <h1 style={{ fontSize: "clamp(48px, 7vw, 94px)", lineHeight: .9, letterSpacing: "-.06em" }}>Diagnóstico antes que rutina.</h1>
            <p className="lead" style={{ maxWidth: 720 }}>Consulta médica para entender qué le pasa a la piel y elegir tratamiento con secuencia, prioridad y seguimiento.</p>
            <div className="hero-actions">
              <a className="button button-primary" href={buildWhatsAppLink("Hola, quiero agendar consulta dermatológica con el Dr. Salvador Cordero.")} target="_blank" rel="noreferrer">Agendar consulta</a>
              <a className="button" href="/">Volver a HAUTLAB</a>
            </div>
          </div>
          <aside className="panel panel-soft">
            <p className="section-kicker">Consulta</p>
            <h2>$1,300 MXN</h2>
            <p className="section-text" style={{ marginTop: 16 }}>Incluye evaluación médica, orientación diagnóstica y plan inicial según el caso.</p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container split-panel">
          <div className="panel panel-soft">
            <p className="section-kicker">Enfoque</p>
            <h2>Tratar piel requiere orden.</h2>
            <p className="section-text" style={{ marginTop: 20 }}>No todo se resuelve con una crema. Se valora evolución, hábitos, detonantes, tratamientos previos, tolerancia, barrera cutánea y objetivos reales.</p>
          </div>
          <div className="panel">
            <p className="section-kicker">Motivos frecuentes</p>
            <ul className="list-clean">
              {conditions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container section-header" style={{ marginBottom: 0 }}>
          <div>
            <p className="section-kicker">Agenda</p>
            <h2>Consulta privada en Mérida.</h2>
          </div>
          <a className="button button-primary" href={buildWhatsAppLink("Hola, quiero agendar consulta dermatológica.")} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
