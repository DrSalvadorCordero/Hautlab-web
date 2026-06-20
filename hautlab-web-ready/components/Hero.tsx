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
          "radial-gradient(circle at 86% 18%, rgba(200,179,154,.18), transparent 24%), radial-gradient(circle at 10% 88%, rgba(143,118,94,.13), transparent 24%), linear-gradient(135deg, rgba(255,255,255,.045), transparent 34%), var(--bg)"
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
          aria-label="Sistema clínico HAUTLAB"
          style={{
            position: "relative",
            border: "1px solid rgba(242,238,231,.14)",
            borderRadius: 30,
            minHeight: 430,
            padding: 24,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.022)), radial-gradient(circle at 50% 8%, rgba(200,179,154,.14), transparent 36%)",
            boxShadow: "0 34px 90px rgba(0,0,0,.36)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 18, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".17em", fontSize: 10 }}>
            <span>HAUTLAB</span>
            <span style={{ color: "var(--muted)" }}>Clinical system</span>
          </div>

          <div
            style={{
              position: "relative",
              height: 285,
              margin: "28px 0 22px",
              borderRadius: 26,
              border: "1px solid rgba(242,238,231,.1)",
              overflow: "hidden",
              background:
                "linear-gradient(rgba(242,238,231,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(242,238,231,.045) 1px, transparent 1px), radial-gradient(circle at 50% 50%, rgba(200,179,154,.13), transparent 46%)",
              backgroundSize: "38px 38px, 38px 38px, auto"
            }}
          >
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 190, height: 245, border: "1px solid rgba(200,179,154,.24)", borderRadius: "50%", transform: "translate(-50%,-50%)" }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 270, height: 170, border: "1px solid rgba(200,179,154,.24)", borderRadius: "50%", transform: "translate(-50%,-50%) rotate(-18deg)" }} />
            <div style={{ position: "absolute", left: "50%", top: "15%", width: 1, height: "70%", background: "rgba(242,238,231,.11)" }} />
            <div style={{ position: "absolute", left: "12%", top: "50%", width: "76%", height: 1, background: "rgba(242,238,231,.11)" }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 96, height: 96, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid rgba(200,179,154,.35)", color: "var(--accent)", fontFamily: "Georgia, serif", fontSize: 30, letterSpacing: ".18em", background: "rgba(13,13,12,.72)", backdropFilter: "blur(18px)", transform: "translate(-50%,-50%)" }}>
              SC
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <strong>{siteConfig.doctorName}</strong>
              <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>{siteConfig.platformName} · {siteConfig.location}</p>
            </div>
            <div>
              <strong>{siteConfig.consultationPrice}</strong>
              <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>valoración estética</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
