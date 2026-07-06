import { Hero } from "@/components/Hero";
import { TreatmentCards } from "@/components/TreatmentCards";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const visualStyle = (image: string) => ({
  minHeight: 330,
  borderRadius: 32,
  border: "1px solid rgba(242,238,231,.13)",
  backgroundImage: `linear-gradient(90deg, rgba(11,10,9,.62), rgba(11,10,9,.12)), url('${image}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  boxShadow: "0 34px 100px rgba(0,0,0,.32)"
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <TreatmentCards />

      <section className="section" id="piel">
        <div className="container split-panel">
          <div className="panel panel-soft">
            <p className="section-kicker">Calidad de piel</p>
            <h2>No todo rostro necesita más volumen.</h2>
            <p className="section-text" style={{ marginTop: 22 }}>
              A veces el cambio correcto está en textura, inflamación, pigmento, barrera cutánea, colágeno y luz de piel. Primero se diagnostica; después se elige el procedimiento.
            </p>
          </div>
          <div aria-hidden="true" style={visualStyle("/visuals/skin-macro.webp")} />
        </div>
      </section>

      <section className="section" id="metodo">
        <div className="container split-panel">
          <div aria-hidden="true" style={visualStyle("/visuals/clinic-office.webp")} />
          <div className="compact-consult">
            <div>
              <p className="section-kicker">Método HAUTLAB</p>
              <h2>Primero diagnóstico. Después procedimiento.</h2>
              <p>
                La valoración define si conviene tratar, esperar, priorizar o replantear. Se evalúa piel, anatomía, proporción, movimiento, antecedentes y expectativas.
              </p>
            </div>
            <a className="button button-primary" href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
              Agendar valoración
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
