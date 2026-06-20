import { buildWhatsAppLink } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/siteConfig";

export function Hero() {
  return (
    <section
      className="hero"
      style={{
        minHeight: "calc(100svh - 76px)",
        padding: "92px 0 70px",
        background:
          "radial-gradient(circle at 78% 28%, rgba(200,179,154,.2), transparent 28%), radial-gradient(circle at 18% 20%, rgba(143,118,94,.14), transparent 24%), linear-gradient(135deg, rgba(255,255,255,.05), transparent 35%), var(--bg)"
      }}
    >
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">HAUTLAB · Dirección médica Dr. Salvador Cordero</p>
          <h1 style={{ fontSize: "clamp(56px, 7.6vw, 108px)", lineHeight: 0.9, letterSpacing: "-.065em", maxWidth: 980 }}>
            Medicina estética con precisión clínica y estética contenida.
          </h1>
          <p className="lead" style={{ maxWidth: 720 }}>
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
            borderRadius: 34,
            minHeight: 620,
            padding: 28,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.025)), radial-gradient(circle at 50% 10%, rgba(200,179,154,.16), transparent 34%)",
            boxShadow: "0 44px 120px rgba(0,0,0,.42)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 22, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".18em", fontSize: 11 }}>
            <span>HAUTLAB</span>
            <span style={{ color: "var(--muted)" }}>Clinical aesthetic system</span>
          </div>

          <div
            style={{
              position: "relative",
              height: 440,
              margin: "38px 0 28px",
              borderRadius: 30,
              border: "1px solid rgba(242,238,231,.1)",
              overflow: "hidden",
              background:
                "linear-gradient(rgba(242,238,231,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(242,238,231,.045) 1px, transparent 1px), radial-gradient(circle at 50% 50%, rgba(200,179,154,.13), transparent 46%)",
              backgroundSize: "42px 42px, 42px 42px, auto"
            }}
          >
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 270, height: 350, border: "1px solid rgba(200,179,154,.24)", borderRadius: "50%", transform: "translate(-50%,-50%)" }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 380, height: 250, border: "1px solid rgba(200,179,154,.24)", borderRadius: "50%", transform: "translate(-50%,-50%) rotate(-18deg)" }} />
            <div style={{ position: "absolute", left: "50%", top: "13%", width: 1, height: "74%", background: "rgba(242,238,231,.11)" }} />
            <div style={{ position: "absolute", left: "11%", top: "50%", width: "78%", height: 1, background: "rgba(242,238,231,.11)" }} />
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 118, height: 118, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid rgba(200,179,154,.35)", color: "var(--accent)", fontFamily: "Georgia, serif", fontSize: 36, letterSpacing: ".18em", background: "rgba(13,13,12,.72)", backdropFilter: "blur(18px)", transform: "translate(-50%,-50%)" }}>
              SC
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 22 }}>
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
