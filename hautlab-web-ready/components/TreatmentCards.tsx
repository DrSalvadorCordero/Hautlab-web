const groups = [
  {
    label: "01",
    title: "Medicina estética facial",
    text: "Toxina botulínica, rinomodelación, rellenos y armonización con enfoque conservador."
  },
  {
    label: "02",
    title: "Dermatología clínica",
    text: "Acné, rosácea, manchas, dermatitis, alopecia, uñas y piel sensible."
  },
  {
    label: "03",
    title: "Calidad de piel y soporte",
    text: "Bioestimulación, peelings, textura, poros, cicatrices, estrías y tecnología."
  },
  {
    label: "04",
    title: "Dermatología procedimental",
    text: "Lesiones benignas, verrugas, dermatoscopia y procedimientos focales."
  }
];

export function TreatmentCards() {
  return (
    <section className="section section-muted" id="tratamientos">
      <div className="container treatment-board">
        <div className="treatment-index">
          <p className="section-kicker">Procedimientos</p>
          <h2>Todo dividido por familias médicas.</h2>
          <p>
            La página deja de funcionar como lista larga. Ahora el paciente entiende rápido qué tipo de valoración necesita y por qué no se elige procedimiento sin diagnóstico.
          </p>
          <div className="treatment-links">
            {groups.map((group) => (
              <a href="#consulta" key={group.title}>
                <span>{group.title}</span>
                <span>→</span>
              </a>
            ))}
          </div>
        </div>

        <div className="treatment-matrix">
          {groups.map((group) => (
            <article className="treatment-cell" key={group.title}>
              <small>{group.label}</small>
              <h3>{group.title}</h3>
              <p>{group.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
