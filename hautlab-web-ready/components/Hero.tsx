import Image from "next/image";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/siteConfig";

export function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">Dermatología clínica · Medicina estética avanzada</p>
          <h1>Precisión médica. Estética contenida.</h1>
          <p className="lead">
            Evaluación dermatológica y armonización facial para pacientes que buscan verse mejor sin perder identidad.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
              Agendar valoración privada
            </a>
            <a className="button" href="#metodo">
              Conocer el método
            </a>
          </div>
        </div>

        <aside className="hero-card" aria-label="Resumen clínico">
          <div className="portrait-frame">
            <Image
              src="/dr-salvador-cordero.svg"
              alt="Dr. Salvador Cordero"
              width={600}
              height={760}
              priority
            />
          </div>
          <p className="hero-note">
            {siteConfig.location}. Valoración estética: {siteConfig.consultationPrice}, abonable al procedimiento si se realiza el mismo día y el caso es candidato.
          </p>
        </aside>
      </div>
    </section>
  );
}
