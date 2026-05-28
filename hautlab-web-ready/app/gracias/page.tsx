import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Gracias | Dr. Salvador Cordero",
  description: "Gracias por contactar al consultorio del Dr. Salvador Cordero."
};

export default function ThanksPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <p className="section-kicker">Solicitud recibida</p>
        <h1 style={{ fontSize: "clamp(44px, 6vw, 76px)" }}>Gracias. El siguiente paso es confirmar tu valoración.</h1>
        <p className="lead">
          Para acelerar la atención, abre WhatsApp y comparte tu motivo de consulta, horarios disponibles y, si aplica, fotografías con buena luz.
        </p>
        <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
          Continuar por WhatsApp
        </a>
      </div>
    </section>
  );
}
