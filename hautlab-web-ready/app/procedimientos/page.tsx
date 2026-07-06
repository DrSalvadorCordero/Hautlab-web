import type { Metadata } from "next";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Procedimientos | HAUTLAB | Dr. Salvador Cordero",
  description: "Procedimientos de dermatología clínica y medicina estética en HAUTLAB Mérida."
};

const procedures = [
  { title: "Rinomodelación", href: "/rinomodelacion", text: "Proporción nasal con ácido hialurónico cuando el caso es candidato." },
  { title: "Botox / toxina botulínica", href: "/botox", text: "Control de movimiento y arrugas dinámicas con resultado sobrio." },
  { title: "Dermatología clínica", href: "/dermatologia-clinica", text: "Acné, rosácea, manchas, dermatitis, alopecia, uñas y piel sensible." }
];

export default function ProcedimientosPage() {
  return (
    <main>
      <section className="hero" style={{ minHeight: "auto", padding: "74px 0 54px", backgroundImage: "linear-gradient(90deg, rgba(11,10,9,.96), rgba(11,10,9,.70)), url('/visuals/treatment-room.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="container">
          <p className="eyebrow">PROCEDIMIENTOS HAUTLAB</p>
          <h1 style={{ fontSize: "clamp(48px, 7vw, 94px)", lineHeight: .9, letterSpacing: "-.06em", maxWidth: 980 }}>Tratamientos divididos por intención médica.</h1>
          <p className="lead" style={{ maxWidth: 760 }}>Cada ruta explica indicación, objetivo, límites y forma de agenda. La decisión final se toma después de valoración.</p>
        </div>
      </section>

      <section className="section">
        <div className="container treatment-matrix">
          {procedures.map((item) => (
            <a className="treatment-cell" key={item.href} href={item.href} style={{ display: "block" }}>
              <small>Ver ruta</small>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="container section-header" style={{ marginBottom: 0 }}>
          <div>
            <p className="section-kicker">Agenda</p>
            <h2>No sabes cuál elegir: empieza por valoración.</h2>
          </div>
          <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
