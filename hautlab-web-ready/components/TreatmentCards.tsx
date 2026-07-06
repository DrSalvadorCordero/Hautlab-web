const groups = [
  {
    label: "01",
    title: "Medicina estética facial",
    text: "Toxina botulínica, rinomodelación, rellenos y armonización con enfoque conservador.",
    href: "/procedimientos"
  },
  {
    label: "02",
    title: "Dermatología clínica",
    text: "Acné, rosácea, manchas, dermatitis, alopecia, uñas y piel sensible.",
    href: "/dermatologia-clinica"
  },
  {
    label: "03",
    title: "Calidad de piel y soporte",
    text: "Bioestimulación, peelings, textura, poros, cicatrices, estrías y tecnología.",
    href: "/procedimientos"
  },
  {
    label: "04",
    title: "Dermatología procedimental",
    text: "Lesiones benignas, verrugas, dermatoscopia y procedimientos focales.",
    href: "/dermatologia-clinica"
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
            La home muestra la familia. Las páginas internas explican cada procedimiento con intención, precio, límites y agenda.
          </p>
          <div className="treatment-links">
            <a href="/rinomodelacion">Rinomodelación <span>Ver</span></a>
            <a href="/botox">Botox / toxina <span>Ver</span></a>
            <a href="/procedimientos">Ver todo <span>Ver</span></a>
          </div>
          <div
            aria-hidden="true"
            style={{
              minHeight: 220,
              marginTop: 24,
              borderRadius: 28,
              border: "1px solid rgba(242,238,231,.13)",
              backgroundImage: "linear-gradient(90deg, rgba(11,10,9,.58), rgba(11,10,9,.12)), url('/visuals/treatment-room.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 34px 100px rgba(0,0,0,.32)"
            }}
          />
        </div>

        <div className="treatment-matrix">
          {groups.map((group) => (
            <a className="treatment-cell" href={group.href} key={group.title} style={{ display: "block" }}>
              <small>{group.label}</small>
              <h3>{group.title}</h3>
              <p>{group.text}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
