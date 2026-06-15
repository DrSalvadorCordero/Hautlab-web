import Image from "next/image";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/siteConfig";

export function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">HAUTLAB · Medicina estética con criterio clínico</p>
          <h1>Precisión médica. Estética contenida.</h1>
          <p className="lead">
            Dermatología clínica, armonización facial y medicina estética avanzada por el Dr. Salvador Cordero para pacientes que buscan verse mejor sin perder identidad.
          </p>

          <div className="pill-row" aria-label="Pilares de atención">
            <span className="pill">Diagnóstico antes que procedimiento</span>
            <span className="pill">Resultados naturales</span>
            <span className="pill">Atención privada</span>
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
              Agendar valoración privada
            </a>
            <a className="button" href="#metodo">
              Conocer el método HAUTLAB
            </a>
          </div>
        </div>

        <aside className="hero-card" aria-label="Resumen clínico">
          <div className="hero-card-label">Dirección médica</div>
          <div className="portrait-frame">
            <Image
              src="/dr-salvador-cordero.svg"
              alt="Dr. Salvador Cordero"
              width={600}
              height={760}
              priority
            />
          </div>
          <div className="hero-meta">
            <strong>{siteConfig.doctorName}</strong>
            <span>{siteConfig.platformName} · {siteConfig.location}</span>
          </div>
          <p className="hero-note">
            Valoración estética: {siteConfig.consultationPrice}. Abonable al procedimiento si se realiza el mismo día y el caso es candidato.
          </p>
        </aside>
      </div>
    </section>
  );
}
