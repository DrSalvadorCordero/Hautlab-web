const pillars = [
  "Seguridad anatómica",
  "Proporción facial",
  "Técnica contenida",
  "Seguimiento clínico",
  "Discreción estética"
];

export function ExperienceSection() {
  return (
    <section className="section experience-section" id="enfoque">
      <div className="container experience-grid">
        <div className="quote-panel">
          <p className="section-kicker">Enfoque</p>
          <h2>Una experiencia estética diseñada para verse natural, no evidente.</h2>
          <p className="section-text" style={{ marginTop: 24 }}>
            El objetivo no es transformar el rostro en una tendencia. Es leer estructura, piel y movimiento para mejorar con precisión, respeto por la identidad y límites claros.
          </p>
        </div>

        <div className="panel panel-soft">
          <p className="quote-mark">“El mejor resultado no cambia tu expresión: la refina.”</p>
          <div className="pillar-list">
            {pillars.map((pillar) => (
              <span key={pillar}>{pillar}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
