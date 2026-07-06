import { buildWhatsAppLink } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/siteConfig";

export function Hero() {
  return (
    <section
      className="hero"
      style={{
        minHeight: "calc(100svh - 72px)",
        padding: "42px 0 34px",
        backgroundImage: "linear-gradient(90deg, rgba(11,10,9,.96) 0%, rgba(11,10,9,.82) 43%, rgba(11,10,9,.38) 100%), url('/visuals/hero-architecture.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="container hero-grid" style={{ alignItems: "center" }}>
        <div>
          <p className="eyebrow">DR. SALVADOR CORDERO | HAUTLAB</p>
          <h1 style={{ fontSize: "clamp(50px, 7.6vw, 98px)", lineHeight: 0.92, letterSpacing: "-.06em", maxWidth: 880 }}>
            Precisión médica. Estética contenida.
          </h1>
          <p className="lead" style={{ maxWidth: 720 }}>
            Dermatología clínica y medicina estética en Mérida con diagnóstico, proporción facial y criterio anatómico.
          </p>
          <div className="pill-row" aria-label="Pilares de atención">
            <span className="pill">Diagnóstico primero</span>
            <span className="pill">Procedimientos por indicación</span>
            <span className="pill">Resultados sobrios</span>
          </div>
          <div className="hero-actions">
            <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">Agendar valoración privada</a>
            <a className="button" href="#tratamientos">Ver procedimientos</a>
          </div>
        </div>
        <aside aria-label="Resumen HAUTLAB" className="panel panel-soft" style={{ backdropFilter: "blur(18px)", borderColor: "rgba(200,179,154,.26)" }}>
          <p className="section-kicker">Valoración médica</p>
          <h2>Primero se evalúa. Después se decide.</h2>
          <p className="section-text" style={{ marginTop: 18 }}>
            Piel, anatomía, movimiento, antecedentes, objetivos y margen de seguridad definen el plan.
          </p>
          <div className="pillar-list" style={{ marginTop: 24 }}>
            <span>{siteConfig.doctorName}</span>
            <span>Mérida, Yucatán</span>
            <span>{siteConfig.consultationPrice}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
