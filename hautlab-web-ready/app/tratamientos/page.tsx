import { TreatmentCards } from "@/components/TreatmentCards";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata = {
  title: "Tratamientos | Dr. Salvador Cordero",
  description: "Tratamientos de dermatología clínica, medicina estética y armonización facial."
};

export default function TreatmentsPage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <p className="section-kicker">Tratamientos</p>
          <h1 style={{ fontSize: "clamp(44px, 6vw, 76px)", maxWidth: 920 }}>
            Medicina estética con estructura clínica, no con catálogo genérico.
          </h1>
          <p className="lead">
            Los servicios se indican después de valorar anatomía, piel, edad biológica, expresión, proporción y expectativa. No todo rostro necesita lo mismo.
          </p>
          <a className="button button-primary" href={buildWhatsAppLink("Hola, quiero saber si soy candidato/a para un tratamiento con el Dr. Salvador Cordero.")} target="_blank" rel="noreferrer">
            Consultar candidatura
          </a>
        </div>
      </section>
      <TreatmentCards />
    </>
  );
}
