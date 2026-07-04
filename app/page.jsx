const WHATSAPP = 'https://wa.me/529992809758';

const wa = (message) => `${WHATSAPP}?text=${encodeURIComponent(message)}`;

const procedures = [
  {
    id: 'estetica-facial',
    number: '01',
    title: 'Medicina estética facial',
    text: 'Procedimientos orientados a expresión, estructura, perfil y armonía facial. Se indican de forma conservadora y progresiva.',
    items: [
      ['Toxina botulínica', 'Modulación de líneas dinámicas, expresión de cansancio, tensión muscular y prevención estética.', 'Hola, quiero valoración para toxina botulínica.', 'whatsapp_toxina'],
      ['Rinomodelación', 'Perfil nasal, dorso, radix, punta y proporción facial en pacientes seleccionados.', 'Hola, quiero saber si soy candidato/a a rinomodelación.', 'whatsapp_rino'],
      ['Rellenos faciales', 'Mentón, mandíbula, labios, ojeras o soporte facial cuando existe indicación anatómica.', 'Hola, quiero valoración para rellenos faciales.', 'whatsapp_rellenos'],
      ['Armonización facial', 'Planeación integral del rostro por etapas para evitar resultados bruscos o artificiales.', 'Hola, quiero una valoración facial integral.', 'whatsapp_armonizacion']
    ]
  },
  {
    id: 'dermatologia-clinica',
    number: '02',
    title: 'Dermatología clínica',
    text: 'Diagnóstico y manejo médico de enfermedades inflamatorias, pigmentarias y alteraciones frecuentes de piel.',
    items: [
      ['Acné', 'Control de inflamación, comedones, brotes, piel grasa, manchas residuales y mantenimiento.', 'Hola, quiero consulta dermatológica por acné.', 'whatsapp_acne'],
      ['Rosácea', 'Evaluación de enrojecimiento, brotes, sensibilidad, ardor, pápulas y piel reactiva.', 'Hola, quiero consulta por rosácea o piel sensible.', 'whatsapp_rosacea'],
      ['Melasma y manchas', 'Manejo de pigmentación, daño solar, manchas postinflamatorias y recaídas.', 'Hola, quiero consulta por melasma, manchas o pigmentación.', 'whatsapp_melasma'],
      ['Dermatitis y piel sensible', 'Evaluación de barrera cutánea, irritación, descamación, comezón y brotes recurrentes.', 'Hola, quiero consulta por dermatitis o piel sensible.', 'whatsapp_dermatitis'],
      ['Alopecia y cuero cabelludo', 'Evaluación de caída, densidad, descamación, dermatitis seborreica o cambios del cuero cabelludo.', 'Hola, quiero consulta por alopecia o cuero cabelludo.', 'whatsapp_alopecia'],
      ['Uñas y onicomicosis', 'Evaluación de cambios ungueales, hongos, desprendimiento, engrosamiento o trauma.', 'Hola, quiero consulta por uñas u onicomicosis.', 'whatsapp_unas']
    ]
  },
  {
    id: 'calidad-piel',
    number: '03',
    title: 'Calidad de piel y soporte',
    text: 'Tratamientos enfocados en textura, firmeza, luminosidad, poros, cicatrices, colágeno y envejecimiento cutáneo.',
    items: [
      ['Bioestimulación de colágeno', 'Soporte progresivo, firmeza y calidad de piel cuando existe indicación.', 'Hola, quiero información sobre bioestimulación de colágeno.', 'whatsapp_bioestimulacion'],
      ['Peelings médicos', 'Textura, pigmento, piel grasa, poros, manchas superficiales y mantenimiento cutáneo.', 'Hola, quiero valoración para peeling médico.', 'whatsapp_peeling'],
      ['Microneedling / radiofrecuencia', 'Textura, cicatrices, poros, estrías o calidad de piel según valoración.', 'Hola, quiero valoración para microneedling o radiofrecuencia.', 'whatsapp_rf'],
      ['Láser / tecnología', 'Opciones para pigmento, tatuajes, vascularidad o tratamientos focales según equipo e indicación.', 'Hola, quiero valoración para tratamiento con láser o tecnología.', 'whatsapp_laser'],
      ['Cicatrices y marcas', 'Plan de manejo para marcas de acné, cicatrices, textura irregular o secuelas cutáneas.', 'Hola, quiero valoración por cicatrices o marcas en piel.', 'whatsapp_cicatrices'],
      ['Estrías y textura corporal', 'Valoración de textura, estrías blancas o rojas y opciones progresivas de tratamiento.', 'Hola, quiero valoración por estrías o textura corporal.', 'whatsapp_estrias']
    ]
  },
  {
    id: 'procedimental',
    number: '04',
    title: 'Dermatología procedimental',
    text: 'Procedimientos focales para lesiones, verrugas, uñas, cicatrices o condiciones que requieren intervención en consultorio.',
    items: [
      ['Verrugas y lesiones benignas', 'Valoración de lesiones tratables en consultorio con técnica según localización y diagnóstico.', 'Hola, quiero valoración por verrugas o lesiones en piel.', 'whatsapp_verrugas'],
      ['Cirugía menor dermatológica', 'Procedimientos menores cuando existe diagnóstico, indicación adecuada y condiciones clínicas seguras.', 'Hola, quiero valoración para cirugía menor dermatológica.', 'whatsapp_cirugia_menor'],
      ['Lesiones virales o genitales', 'Evaluación médica, diagnóstico diferencial y plan de tratamiento con privacidad y criterio clínico.', 'Hola, quiero una consulta dermatológica privada.', 'whatsapp_privada'],
      ['Dermatoscopia y diagnóstico', 'Valoración clínica de lesiones pigmentadas, cambios cutáneos o lesiones de evolución dudosa.', 'Hola, quiero valoración dermatológica de una lesión en piel.', 'whatsapp_lesion']
    ]
  }
];

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="nav">
        <a className="wordmark" href="#inicio" aria-label="Inicio HAUTLAB">
          DR. SALVADOR CORDERO <span>|</span> HAUTLAB
        </a>
        <div className="nav-actions">
          <a href="#procedimientos">Procedimientos</a>
          <a href="#metodo">Método</a>
          <a href="#valoracion">Valoración</a>
          <a className="nav-cta" href={wa('Hola, quiero agendar una valoración en HAUTLAB.')} data-event="whatsapp_nav">WhatsApp</a>
        </div>
      </nav>

      <section id="inicio" className="hero section-pad">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Dermatología clínica · Medicina estética</p>
            <h1>Precisión médica.<span>Estética contenida.</span></h1>
            <p className="hero-lead">
              HAUTLAB es la práctica médica del Dr. Salvador Cordero: dermatología clínica, medicina estética y planeación facial con diagnóstico, criterio anatómico y lujo silencioso.
            </p>
            <div className="button-row">
              <a className="btn btn-primary" href={wa('Hola, quiero agendar una valoración en HAUTLAB.')} data-event="whatsapp_hero">Agendar valoración</a>
              <a className="btn btn-secondary" href="#procedimientos">Ver procedimientos</a>
            </div>
            <div className="hero-points">
              <article><strong>Diagnóstico antes de procedimiento</strong><span>Piel, anatomía, movimiento, antecedentes y objetivos.</span></article>
              <article><strong>Estética sobria y proporcional</strong><span>Mejorar sin exagerar ni alterar identidad facial.</span></article>
              <article><strong>Plan médico individualizado</strong><span>Indicación por rostro, piel, tiempos, presupuesto y seguridad.</span></article>
            </div>
          </div>

          <aside className="hero-panel">
            <div className="panel-head">
              <p className="label">Valoración por objetivo</p>
              <h2>El tratamiento se decide después de evaluar.</h2>
              <p>Piel, anatomía, proporción, movimiento, expectativas y margen de seguridad.</p>
            </div>
            <div className="panel-links">
              <a href="#estetica-facial"><strong>Medicina estética facial</strong><span>Toxina, rinomodelación, rellenos y armonización</span></a>
              <a href="#dermatologia-clinica"><strong>Dermatología clínica</strong><span>Acné, rosácea, manchas, dermatitis y piel sensible</span></a>
              <a href="#calidad-piel"><strong>Calidad de piel y soporte</strong><span>Bioestimulación, textura, cicatrices y colágeno</span></a>
              <a href="#procedimental"><strong>Dermatología procedimental</strong><span>Lesiones, verrugas, uñas y procedimientos focales</span></a>
            </div>
            <p className="note">La indicación definitiva se establece únicamente después de valoración médica individual.</p>
          </aside>
        </div>
      </section>

      <section id="procedimientos" className="section-pad intro-section">
        <div className="container">
          <p className="eyebrow">Procedimientos</p>
          <h2 className="section-title">Una cartera médica organizada por objetivo clínico y estético.</h2>
          <p className="section-lead">No se trabaja como menú comercial. Los procedimientos se agrupan por intención médica: estructura, expresión, piel, soporte y tratamiento dermatológico.</p>
          <div className="process-band">
            <article><strong>01 · Diagnóstico</strong><span>Primero se identifica qué problema realmente vale la pena tratar.</span></article>
            <article><strong>02 · Indicación</strong><span>No todo procedimiento es adecuado para todo rostro o piel.</span></article>
            <article><strong>03 · Planeación</strong><span>Se prioriza lo que más mejora el conjunto, no lo más evidente.</span></article>
            <article><strong>04 · Seguimiento</strong><span>Los resultados se evalúan con evolución, cuidados y mantenimiento.</span></article>
          </div>
        </div>
      </section>

      <section className="section-pad catalog-section">
        <div className="container catalog-layout">
          <aside className="catalog-nav">
            <h3>Familias de tratamiento</h3>
            <p>División médica para orientar la valoración. La indicación final depende de consulta presencial.</p>
            <a href="#estetica-facial">Medicina estética facial</a>
            <a href="#dermatologia-clinica">Dermatología clínica</a>
            <a href="#calidad-piel">Calidad de piel y soporte</a>
            <a href="#procedimental">Dermatología procedimental</a>
            <a href="#valoracion">Valoración médica</a>
          </aside>

          <div className="category-stack">
            {procedures.map((category) => (
              <section className="category-card" id={category.id} key={category.id}>
                <div className="category-head">
                  <div>
                    <span className="category-number">{category.number}</span>
                    <h3>{category.title}</h3>
                    <p>{category.text}</p>
                  </div>
                </div>
                <div className="procedure-grid">
                  {category.items.map(([title, text, message, event]) => (
                    <article className="procedure-card" key={title}>
                      <div>
                        <h4>{title}</h4>
                        <p>{text}</p>
                      </div>
                      <a href={wa(message)} data-event={event}>Consultar →</a>
                    </article>
                  ))}
                </div>
                <p className="note small-note">No se recomienda elegir procedimiento sin valoración. La indicación depende de anatomía, antecedentes, expectativas y margen de seguridad.</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section id="metodo" className="section-pad method-section">
        <div className="container">
          <p className="eyebrow">Método HAUTLAB</p>
          <h2 className="section-title">Evaluación por piel, estructura, movimiento y proporción.</h2>
          <p className="section-lead">Un sistema de valoración médica diseñado para decidir qué conviene tratar, qué debe esperar y qué no debe hacerse.</p>
          <div className="method-grid">
            <article><span>01</span><h3>Piel</h3><p>Textura, acné, rosácea, manchas, sensibilidad, barrera cutánea y signos inflamatorios.</p></article>
            <article><span>02</span><h3>Estructura</h3><p>Soporte facial, contornos, proporciones, mentón, mandíbula, nariz y región periocular.</p></article>
            <article><span>03</span><h3>Movimiento</h3><p>Gesticulación, fuerza muscular, líneas dinámicas y equilibrio entre expresión y descanso.</p></article>
            <article><span>04</span><h3>Plan</h3><p>Priorización clínica, tiempos, presupuesto, seguridad y evolución progresiva.</p></article>
          </div>
        </div>
      </section>

      <section id="valoracion" className="section-pad valuation-section">
        <div className="container valuation-grid">
          <div>
            <p className="eyebrow">Valoración médica</p>
            <h2 className="section-title">La consulta define si conviene tratar, esperar o replantear.</h2>
            <p className="section-lead">Durante la valoración se revisan antecedentes, piel, anatomía facial, objetivos, presupuesto, tiempos y posibles contraindicaciones. A partir de eso se propone un plan realista y seguro.</p>
            <div className="price-card"><strong>$1,300 MXN</strong><span>Valoración estética o dermatológica. Abonable al procedimiento si se realiza el mismo día, cuando exista indicación médica.</span></div>
          </div>
          <article className="valuation-card">
            <h3>La valoración incluye</h3>
            <ul>
              <li>Evaluación médica inicial.</li>
              <li>Análisis de piel, proporción y objetivo estético.</li>
              <li>Priorización de tratamientos.</li>
              <li>Explicación de opciones, límites y cuidados.</li>
              <li>Plan sugerido por etapas, si aplica.</li>
            </ul>
            <a className="btn btn-primary" href={wa('Hola, quiero agendar una valoración médica en HAUTLAB.')} data-event="whatsapp_valoracion">Agendar valoración</a>
          </article>
        </div>
      </section>

      <section id="faq" className="section-pad faq-section">
        <div className="container faq-wrap">
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2 className="section-title">Antes de decidir un procedimiento, se define si realmente está indicado.</h2>
          <div className="faq-list">
            <details><summary>¿Puedo agendar directamente un procedimiento?</summary><p>La mayoría de los procedimientos requieren valoración previa. La indicación depende de antecedentes, piel, anatomía, expectativas y margen de seguridad.</p></details>
            <details><summary>¿La valoración se abona al procedimiento?</summary><p>Sí. La valoración tiene costo de $1,300 MXN y puede abonarse al procedimiento si se realiza el mismo día y existe indicación médica.</p></details>
            <details><summary>¿Atienden dermatología clínica además de estética?</summary><p>Sí. HAUTLAB integra dermatología clínica, piel inflamatoria, pigmentación, acné, rosácea, uñas, cuero cabelludo y procedimientos dermatológicos.</p></details>
            <details><summary>¿El resultado busca verse natural?</summary><p>Sí. La línea estética es conservadora, proporcional y progresiva. Se evita exagerar rasgos o indicar procedimientos sin necesidad clara.</p></details>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div><strong>DR. SALVADOR CORDERO | HAUTLAB</strong><p>Dermatología clínica y medicina estética con criterio médico, precisión anatómica y estética contenida.</p></div>
          <div><strong>Contacto</strong><p>WhatsApp: <a href={WHATSAPP} data-event="whatsapp_footer">999 280 9758</a><br />Instagram: <a href="https://www.instagram.com/hautlabmx" data-event="instagram_footer">@hautlabmx</a><br />Web: <a href="https://www.hautlabmx.com">hautlabmx.com</a></p></div>
          <div><strong>Consultorio</strong><p>Calle 43 número 299A x 32A<br />San Ramón Norte<br />C.P. 97117<br />Mérida, Yucatán, México<br /><br /><a href="#terms">Aviso de privacidad</a></p></div>
        </div>
      </footer>

      <section id="terms" className="section-pad terms-section">
        <div className="container terms">
          <h2>Aviso de Privacidad Integral</h2>
          <p>Última actualización: 4 de julio de 2026.</p>
          <p>Dr. Salvador Cordero Romero, responsable de HAUTLAB, con domicilio en Calle 43 número 299A x 32A, San Ramón Norte, C.P. 97117, Mérida, Yucatán, México, es responsable del tratamiento de los datos personales que usted proporcione.</p>
          <h3>Datos personales que podemos recabar</h3>
          <p>Podemos recabar datos de identificación, contacto, edad, sexo, domicilio, fotografías clínicas, antecedentes médicos, padecimientos actuales, medicamentos, alergias, historial dermatológico, datos relacionados con tratamientos médicos o estéticos, así como información necesaria para integrar expediente clínico y brindar atención médica.</p>
          <h3>Finalidades del tratamiento</h3>
          <p>Sus datos personales podrán utilizarse para identificación, contacto, agenda de citas, integración de expediente clínico, valoración médica, indicación de tratamientos, seguimiento, emisión de recetas, facturación, atención de dudas, cumplimiento de obligaciones sanitarias, administrativas, legales y regulatorias.</p>
          <h3>Datos sensibles y fotografías clínicas</h3>
          <p>Algunos datos recabados pueden considerarse datos personales sensibles, especialmente los relacionados con salud, antecedentes médicos, fotografías clínicas y evolución de tratamientos. Las fotografías clínicas podrán utilizarse para diagnóstico, seguimiento, comparación de evolución y documentación del expediente. Cualquier uso con fines académicos, publicitarios, redes sociales o difusión externa requerirá autorización específica adicional.</p>
          <h3>Derechos ARCO</h3>
          <p>Usted puede ejercer sus derechos de acceso, rectificación, cancelación u oposición, así como revocar su consentimiento, enviando una solicitud a <a href="mailto:dr.salvadorcordero@gmail.com">dr.salvadorcordero@gmail.com</a>.</p>
          <h3>Conservación y cambios</h3>
          <p>La información clínica será conservada durante el tiempo necesario para cumplir con la atención médica, seguimiento, expediente clínico y obligaciones legales aplicables. Este aviso podrá modificarse por cambios legales, regulatorios, administrativos o por ajustes en la operación de HAUTLAB.</p>
        </div>
      </section>

      <a className="mobile-cta" href={wa('Hola, quiero agendar una valoración en HAUTLAB.')} data-event="whatsapp_mobile_fixed">Agendar valoración</a>
    </main>
  );
}
