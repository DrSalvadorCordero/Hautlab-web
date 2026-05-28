import { LeadForm } from "@/components/LeadForm";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Contacto | Dr. Salvador Cordero",
  description: "Agenda valoración privada con el Dr. Salvador Cordero."
};

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container split-panel">
        <div>
          <p className="section-kicker">Contacto</p>
          <h1 style={{ fontSize: "clamp(44px, 6vw, 76px)" }}>Agenda una valoración privada.</h1>
          <p className="lead">
            Comparte brevemente qué te interesa revisar. El primer paso correcto es valorar si el tratamiento tiene indicación real.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
              Abrir WhatsApp
            </a>
          </div>
        </div>
        <div className="panel">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
