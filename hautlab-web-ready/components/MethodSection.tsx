const steps = [
  {
    number: "01",
    title: "Evaluar antes de intervenir",
    text: "Lectura clínica del rostro, piel, proporción, movimiento y estructura antes de proponer cualquier procedimiento."
  },
  {
    number: "02",
    title: "Plan por capas",
    text: "Soporte, proporción, movimiento y calidad cutánea se trabajan con prioridades claras, no con procedimientos aislados."
  },
  {
    number: "03",
    title: "Resultado contenido",
    text: "El objetivo no es cambiar el rostro: es optimizarlo con criterio, seguridad y continuidad."
  }
];

export function MethodSection() {
  return (
    <section className="section" id="metodo">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-kicker">Método</p>
            <h2>No se trata de hacer más. Se trata de indicar mejor.</h2>
          </div>
          <p className="section-text">
            Cada plan se construye desde diagnóstico, anatomía, riesgo, expectativa y etapa de tratamiento. La consulta ordena lo que sí conviene tocar, lo que debe esperar y lo que no aporta.
          </p>
        </div>

        <div className="grid-3">
          {steps.map((step) => (
            <article className="card" key={step.number}>
              <div className="card-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
