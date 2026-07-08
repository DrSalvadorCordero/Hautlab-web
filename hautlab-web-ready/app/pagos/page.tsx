import type { Metadata } from "next";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const mercadoPagoLink = "https://mpago.la/2WjpWKf";

export const metadata: Metadata = {
  title: "Pagos | HAUTLAB | Dr. Salvador Cordero",
  description: "Pagos seguros para valoración, apartado o link personalizado de HAUTLAB en Mérida."
};

export default function PagosPage() {
  return (
    <main>
      <section
        className="hero"
        style={{
          minHeight: "auto",
          padding: "74px 0 54px",
          backgroundImage: "linear-gradient(90deg, rgba(11,10,9,.96), rgba(11,10,9,.70)), url('/visuals/clinic-office.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container split-panel">
          <div>
            <p className="eyebrow">PAGOS HAUTLAB</p>
            <h1 style={{ fontSize: "clamp(42px, 5.4vw, 78px)", lineHeight: .92, letterSpacing: "-.06em" }}>
              Pagos seguros y reservaciones.
            </h1>
            <p className="lead" style={{ maxWidth: 720 }}>
              Realiza tu pago de valoración, apartado o solicita un link personalizado para procedimiento.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={mercadoPagoLink} target="_blank" rel="noreferrer">
                Pagar con Mercado Pago
              </a>
              <a className="button" href={buildWhatsAppLink("Hola, ya realicé mi pago en Mercado Pago y quiero enviar mi comprobante.")} target="_blank" rel="noreferrer">
                Enviar comprobante
              </a>
            </div>
          </div>
          <aside className="panel panel-soft">
            <p className="section-kicker">Pago seguro</p>
            <h2>Mercado Pago</h2>
            <p className="section-text" style={{ marginTop: 16 }}>
              Los procedimientos están sujetos a valoración médica. Para montos variables, solicita un link personalizado por WhatsApp.
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container treatment-matrix">
          <a className="treatment-cell" href={mercadoPagoLink} target="_blank" rel="noreferrer" style={{ display: "block" }}>
            <small>Mercado Pago</small>
            <h3>Pagar valoración o apartado</h3>
            <p>Usa el link seguro para completar tu pago y conserva tu comprobante.</p>
          </a>
          <a className="treatment-cell" href={buildWhatsAppLink("Hola, quiero solicitar un link de pago personalizado para HAUTLAB.")} target="_blank" rel="noreferrer" style={{ display: "block" }}>
            <small>WhatsApp</small>
            <h3>Solicitar link personalizado</h3>
            <p>Para procedimientos, paquetes o montos específicos.</p>
          </a>
          <a className="treatment-cell" href={buildWhatsAppLink("Hola, ya realicé mi pago y quiero enviar mi comprobante.")} target="_blank" rel="noreferrer" style={{ display: "block" }}>
            <small>Comprobante</small>
            <h3>Enviar comprobante</h3>
            <p>Comparte tu comprobante para confirmar agenda o seguimiento.</p>
          </a>
          <a className="treatment-cell" href="/" style={{ display: "block" }}>
            <small>HAUTLAB</small>
            <h3>Volver al sitio</h3>
            <p>Regresa a la página principal de HAUTLAB.</p>
          </a>
        </div>
      </section>
    </main>
  );
}
