import { buildWhatsAppLink } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/siteConfig";

export function Hero() {
  return (
    <section className="hero hero-lab">
      <div className="container hero-grid">
        <div className="hero-copy-lab">
          <p className="eyebrow">HAUTLAB · Dirección médica Dr. Salvador Cordero</p>
          <h1>Medicina estética con precisión clínica y estética contenida.</h1>
          <p className="lead">
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

        <aside className="lab-hero-card" aria-label="Sistema clínico HAUTLAB">
          <div className="lab-card-header">
            <span>HAUTLAB</span>
            <span>Clinical aesthetic system</span>
          </div>
          <div className="lab-orbital">
            <div className="orbital-ring ring-one" />
            <div className="orbital-ring ring-two" />
            <div className="orbital-ring ring-three" />
            <div className="orbital-axis axis-v" />
            <div className="orbital-axis axis-h" />
            <div className="orbital-point p1" />
            <div className="orbital-point p2" />
            <div className="orbital-point p3" />
            <div className="orbital-point p4" />
            <div className="orbital-monogram">SC</div>
          </div>
          <div className="lab-card-footer">
            <div>
              <strong>{siteConfig.doctorName}</strong>
              <p>{siteConfig.platformName} · {siteConfig.location}</p>
            </div>
            <div>
              <strong>{siteConfig.consultationPrice}</strong>
              <p>valoración estética</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
