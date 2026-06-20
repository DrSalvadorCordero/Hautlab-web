import { buildWhatsAppLink } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/siteConfig";

export function Hero() {
  return (
    <section
      className="hero"
      style={{
        minHeight: "auto",
        padding: "72px 0 58px",
        background:
          "radial-gradient(circle at 90% 12%, rgba(200,179,154,.14), transparent 24%), radial-gradient(circle at 8% 88%, rgba(143,118,94,.1), transparent 24%), linear-gradient(135deg, rgba(255,255,255,.04), transparent 34%), var(--bg)"
      }}
    >
      <div className="container hero-grid" style={{ alignItems: "center" }}>
        <div>
          <p className="eyebrow">HAUTLAB · Dirección médica Dr. Salvador Cordero</p>
          <h1 style={{ fontSize: "clamp(48px, 7.2vw, 94px)", lineHeight: 0.93, letterSpacing: "-.06em", maxWidth: 850 }}>
            Precisión médica. Estética contenida.
          </h1>
          <p className="lead" style={{ maxWidth: 700 }}>
            Dermatología clínica, armonización facial y medicina estética avanzada para pacientes que buscan verse mejor sin perder identidad.
          </p>

          <div className="pill-row" aria-label="Pilares de atención">
            <span className="pill">Diagnóstico médico-estético</span>
            <span className="pill">Plan por capas</span>
            <span className="pill">Resultados naturales</span>
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
              Agendar valoración privada
            </a>
            <a className="button" href="#metodo">
              Ver método HAUTLAB
            </a>
          </div>
        </div>

        <aside
          aria-label="Resumen HAUTLAB"
          style={{
            border: "1px solid rgba(242,238,231,.14)",
            borderRadius: 30,
            padding: 28,
            background:
              "linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.022)), radial-gradient(circle at 85% 0%, rgba(200,179,154,.16), transparent 34%)",
            boxShadow: "0 34px 90px rgba(0,0,0,.32)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 18, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".17em", fontSize: 10, marginBottom: 58 }}>
            <span>HAUTLAB</span>
            <span style={{ color: "var(--muted)" }}>Private aesthetic dermatology</span>
          </div>

          <div style={{ fontFamily: "Georgia, serif", fontSize: "clamp(42px, 6vw, 78px)", lineHeight: .9, letterSpacing: "-.055em", color: "var(--bone)", marginBottom: 28 }}>
            Clinical<br />aesthetic<br />protocol.
          </div>

          <div style={{ height: 1, background: "rgba(242,238,231,.13)", margin: "0 0 24px" }} />

          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <span style={{ display: "block", color: "var(--quiet)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 6 }}>Dirección médica</span>
              <strong>{siteConfig.doctorName}</strong>
            </div>
            <div>
              <span style={{ display: "block", color: "var(--quiet)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 6 }}>Ubicación</span>
              <strong>{siteConfig.location}</strong>
            </div>
            <div>
              <span style={{ display: "block", color: "var(--quiet)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 6 }}>Valoración estética</span>
              <strong>{siteConfig.consultationPrice}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
