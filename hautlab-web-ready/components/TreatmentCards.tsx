const treatments = [
  {
    title: "Armonización facial",
    text: "Planificación por estructura, proporción y movimiento. Enfoque natural, médico y progresivo."
  },
  {
    title: "Toxina botulínica",
    text: "Manejo de expresión, prevención de líneas dinámicas y ajuste fino del tercio superior e inferior."
  },
  {
    title: "Rinomodelación",
    text: "Corrección no quirúrgica en casos seleccionados, con valoración anatómica estricta y enfoque de seguridad."
  },
  {
    title: "Bioestimulación",
    text: "Estrategias para soporte, calidad de piel y envejecimiento facial con visión de mediano plazo."
  },
  {
    title: "Dermatología clínica",
    text: "Diagnóstico y tratamiento de piel con criterio médico, seguimiento y documentación clínica."
  },
  {
    title: "Medicina metabólica estética",
    text: "Acompañamiento médico para composición corporal, piel, metabolismo y adherencia clínica."
  }
];

export function TreatmentCards() {
  return (
    <section className="section" id="tratamientos">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-kicker">Tratamientos</p>
            <h2>Servicios organizados por criterio clínico.</h2>
          </div>
          <p className="section-text">
            La indicación correcta depende de diagnóstico, anatomía, objetivos y tolerancia al riesgo. Esta web no reemplaza una consulta médica.
          </p>
        </div>

        <div className="grid-3">
          {treatments.map((treatment) => (
            <article className="card" key={treatment.title}>
              <h3>{treatment.title}</h3>
              <p>{treatment.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
