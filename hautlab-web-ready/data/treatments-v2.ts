import type { TreatmentPageContent } from "@/components/treatments/treatment-page-layout";

const review = (sources: Array<{ label: string; href: string }>) => ({
  author: "Dr. Salvador Cordero Romero",
  professionalTitle: "Médico Cirujano",
  practiceArea: "Dermatología Clínica y Estética",
  license: "Cédula Profesional 11804418",
  reviewedAt: "23 de julio de 2026",
  sources
});

const common = {
  breadcrumbs: [{ label: "Inicio", href: "/" }, { label: "Procedimientos", href: "/procedimientos" }],
  image: "/visuals/skin-macro.webp",
  imageAlt: "Visual editorial HAUTLAB",
  expectations: [
    { label: "Valoración", value: "Necesaria antes de indicar tratamiento." },
    { label: "Recuperación", value: "Variable según técnica y respuesta individual." },
    { label: "Seguimiento", value: "Se define según evolución clínica." }
  ]
};

export const treatmentsV2: Record<string, TreatmentPageContent> = {
  rinomodelacion: {
    ...common,
    image: "/visuals/hero-architecture.webp",
    imageAlt: "Composición editorial que representa proporción y estructura facial",
    eyebrow: "Diseño facial",
    title: "Rinomodelación",
    summary: "Corrección visual de proporciones nasales con enfoque conservador y valoración anatómica previa.",
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: ["La rinomodelación utiliza ácido hialurónico para modificar transiciones, proyección y soporte visual de la nariz sin cirugía.", "No busca aumentar por aumentar, sino mejorar lectura frontal y lateral cuando la anatomía lo permite."],
    indications: ["Irregularidades leves del dorso", "Punta con soporte limitado", "Transiciones poco armónicas"],
    notIndicated: ["Riesgo anatómico alto", "Expectativas irreales", "Casos que requieren cirugía"],
    hautlabApproach: ["Se analiza la relación nariz, labios, mentón y tercio medio antes de indicar producto.", "La prioridad es conservar identidad y evitar una nariz sobreproyectada."],
    clinicalDetails: {
      evaluation: [
        "Anatomía nasal, grosor de piel, vascularización visible y proporción con labios, mentón y tercio medio.",
        "Antecedentes de rellenos, cirugía, traumatismos, hilos, implantes o complicaciones previas.",
        "Objetivo real del paciente y límites de lo que puede corregirse sin cirugía."
      ],
      recovery: [
        "Inflamación, sensibilidad y pequeños hematomas pueden modificar la lectura inicial durante los primeros días.",
        "El resultado inmediato no se considera definitivo hasta que descienden inflamación y edema.",
        "La revisión permite valorar integración, simetría y si existe indicación real de retoque."
      ],
      risks: [
        "Asimetría, edema, dolor, hematoma, irregularidad, infección, nódulos o reacción inflamatoria.",
        "La inyección intravascular puede comprometer piel y tejidos; aunque es infrecuente, puede causar necrosis.",
        "Las complicaciones visuales o neurológicas son raras, graves y potencialmente permanentes."
      ],
      alternatives: [
        "No intervenir cuando el margen de seguridad o el beneficio esperado son insuficientes.",
        "Valorar cirugía cuando el objetivo requiere reducción, corrección funcional o modificación estructural.",
        "Trabajar proporción de mentón o perfil cuando la nariz no es el único punto que explica el desbalance."
      ],
      warningSigns: [
        "Dolor intenso o progresivo, piel pálida, moteada, grisácea o con coloración que se extiende.",
        "Pérdida súbita de visión, visión borrosa nueva, caída del párpado, debilidad, dificultad para hablar o cefalea neurológica.",
        "Fiebre, secreción, aumento rápido de enrojecimiento o inflamación que empeora."
      ]
    },
    expectations: [
      { label: "Sesión", value: "Se realiza únicamente después de confirmar candidatura anatómica." },
      { label: "Recuperación", value: "Inflamación y hematomas leves son posibles; la evolución se revisa." },
      { label: "Resultado", value: "Inmediato pero no definitivo hasta que desciende la inflamación." }
    ],
    investment: { label: "$5,500 MXN", note: "Incluye valoración, aplicación, revisión y retoque cuando esté indicado. La cantidad de producto y la viabilidad del procedimiento se confirman durante la valoración." },
    faq: [{ question: "¿La rinomodelación sustituye una cirugía?", answer: "No. Puede mejorar proporciones en casos seleccionados, pero no resuelve todos los problemas estructurales." }, { question: "¿El resultado es inmediato?", answer: "El cambio suele apreciarse de inmediato, aunque la inflamación inicial puede modificar temporalmente la lectura del resultado." }],
    related: [
      { label: "Mentón", href: "/procedimientos/menton" },
      { label: "Armonización facial", href: "/procedimientos/armonizacion-facial" },
      { label: "Labios", href: "/procedimientos/labios" },
      { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" }
    ],
    whatsappMessage: "Hola, quiero agendar valoración para rinomodelación.",
    medicalReview: review([
      {
        label: "FDA · Dermal Fillers (Soft Tissue Fillers): riesgos, indicaciones y seguridad",
        href: "https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/dermal-fillers-soft-tissue-fillers"
      },
      {
        label: "FDA · Dermal Filler Do’s and Don’ts",
        href: "https://www.fda.gov/consumers/consumer-updates/dermal-filler-dos-and-donts-wrinkles-lips-and-more"
      }
    ])
  },
  "toxina-botulinica": {
    ...common,
    eyebrow: "Expresión facial",
    title: "Toxina botulínica",
    summary: "Modulación de fuerza muscular para suavizar líneas dinámicas sin borrar la expresión.",
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: ["La toxina botulínica reduce temporalmente la contracción de músculos específicos.", "El objetivo no es inmovilizar el rostro, sino equilibrar movimiento, tensión y expresión."],
    indications: ["Entrecejo marcado", "Líneas dinámicas de frente", "Patas de gallo"],
    notIndicated: ["Expectativa de rostro totalmente inmóvil", "Alteraciones neuromusculares sin valoración", "Embarazo o lactancia"],
    hautlabApproach: ["La dosis se decide según fuerza, asimetría y patrón de movimiento.", "Se conserva expresión y se evita uniformar todos los rostros con el mismo mapa."],
    clinicalDetails: {
      evaluation: [
        "Patrón de movimiento, fuerza muscular, asimetrías en reposo y durante la gesticulación.",
        "Antecedentes de toxina, respuesta, duración, efectos adversos y tratamientos recientes.",
        "Enfermedades neuromusculares, medicamentos relevantes, embarazo, lactancia e infección en zonas de aplicación."
      ],
      recovery: [
        "Puede existir dolor localizado, hematoma o cefalea transitoria.",
        "El efecto aparece de forma progresiva; no se juzga el resultado final en las primeras horas.",
        "La revisión se programa cuando el efecto ya puede valorarse de forma estable."
      ],
      risks: [
        "Asimetría, ceja o párpado descendido, sonrisa alterada, ojo seco o resultado insuficiente/excesivo.",
        "Los productos de toxina no son intercambiables unidad por unidad.",
        "La difusión del efecto puede producir debilidad, dificultad para hablar, deglutir o respirar; requiere atención inmediata."
      ],
      alternatives: [
        "No tratar si las líneas son estáticas, el objetivo no depende principalmente de movimiento o el riesgo supera el beneficio.",
        "Manejo de calidad de piel cuando textura, fotodaño o deshidratación son el componente predominante.",
        "Plan combinado por etapas cuando estructura, piel y movimiento participan en la expresión."
      ],
      warningSigns: [
        "Dificultad para respirar, tragar o hablar; debilidad generalizada o visión doble.",
        "Inflamación intensa, ronchas generalizadas o síntomas de reacción alérgica.",
        "Alteración ocular o facial progresiva que no corresponde al efecto explicado."
      ]
    },
    expectations: [
      { label: "Inicio", value: "El efecto aparece gradualmente durante los primeros días." },
      { label: "Revisión", value: "Se valora cuando el efecto se estabiliza, no de forma inmediata." },
      { label: "Duración", value: "Es temporal y varía según dosis, zona, fuerza y respuesta individual." }
    ],
    investment: { label: "$3,500 MXN · tercio superior", note: "La dosis se ajusta a fuerza muscular, patrón de movimiento y objetivos. Otras zonas se cotizan después de valoración." },
    faq: [{ question: "¿Cuándo empieza a notarse?", answer: "El efecto aparece de forma progresiva durante los primeros días y se estabiliza después." }, { question: "¿Qué pasa si dejo de aplicarla?", answer: "El movimiento regresa gradualmente; no empeora el rostro por suspenderla." }],
    related: [
      { label: "Armonización facial", href: "/procedimientos/armonizacion-facial" },
      { label: "Ojeras", href: "/procedimientos/ojeras" },
      { label: "Rinomodelación", href: "/procedimientos/rinomodelacion" },
      { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" }
    ],
    whatsappMessage: "Hola, quiero agendar valoración para toxina botulínica.",
    medicalReview: review([
      {
        label: "FDA · BOTOX Cosmetic: información de prescripción 2024",
        href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/103000s5316s5319s5323s5326s5331lbl.pdf"
      },
      {
        label: "FDA · Alerta sobre productos de toxina botulínica y riesgos",
        href: "https://www.fda.gov/news-events/press-announcements/fda-warns-companies-over-illegal-marketing-botox-and-related-products"
      }
    ])
  },
  labios: {
    ...common,
    eyebrow: "Diseño facial",
    title: "Labios",
    summary: "Definición, soporte e hidratación visual sin perder proporción ni identidad.",
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: ["El tratamiento con ácido hialurónico puede mejorar borde, proyección, simetría y soporte labial.", "No todos los labios requieren volumen; a veces el objetivo es estructura y transición."],
    indications: ["Asimetría", "Pérdida de definición", "Soporte insuficiente"],
    notIndicated: ["Inflamación activa", "Tendencia a resultados exagerados", "Expectativas incompatibles con la anatomía"],
    hautlabApproach: ["Se evalúa sonrisa, perfil, dientes, mentón y relación con la nariz.", "La forma se prioriza sobre el volumen aislado."],
    investment: { label: "Cotización individual", note: "La inversión depende del producto, la cantidad requerida y el objetivo anatómico. Se confirma después de valoración para evitar vender volumen sin indicación." },
    faq: [{ question: "¿Siempre aumenta mucho el tamaño?", answer: "No. Puede trabajarse definición o soporte sin buscar un aumento evidente." }, { question: "¿Cuánto dura?", answer: "La duración depende del producto, metabolismo, técnica y movilidad de la zona." }],
    related: [{ label: "Rinomodelación", href: "/procedimientos/rinomodelacion" }, { label: "Mentón", href: "/procedimientos/menton" }],
    whatsappMessage: "Hola, quiero agendar valoración para labios."
  },
  ojeras: {
    ...common,
    eyebrow: "Diseño facial",
    title: "Ojeras",
    summary: "Valoración de hundimiento, pigmento, bolsas y calidad cutánea antes de decidir si conviene relleno u otra estrategia.",
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: ["La ojera no es una sola entidad. Puede depender de hundimiento, pigmento, vascularidad, bolsas, laxitud o una combinación de factores.", "El ácido hialurónico solo resulta útil cuando el componente anatómico y la calidad de la piel permiten una corrección contenida."],
    indications: ["Surco marcado con anatomía favorable", "Transición párpado-mejilla deprimida", "Aspecto cansado relacionado con pérdida de soporte"],
    notIndicated: ["Bolsas predominantes", "Edema frecuente", "Piel muy fina o riesgo de irregularidad"],
    hautlabApproach: ["Se diferencia primero volumen, pigmento, vascularidad y laxitud.", "No se rellena una ojera únicamente porque se vea oscura; en ciertos casos conviene no colocar producto."],
    investment: { label: "Cotización individual", note: "La valoración define si el problema requiere relleno, calidad de piel, manejo de pigmento o referencia para otra alternativa." },
    faq: [{ question: "¿Toda ojera se puede rellenar?", answer: "No. Las bolsas, el edema y ciertos tipos de pigmentación pueden hacer que el relleno no sea la opción correcta." }, { question: "¿Puede verse azulado o irregular?", answer: "Sí, existe riesgo de visibilidad, edema o irregularidad, especialmente si la anatomía o el producto no son adecuados." }],
    related: [{ label: "Toxina botulínica", href: "/procedimientos/toxina-botulinica" }, { label: "Melasma", href: "/procedimientos/melasma" }],
    whatsappMessage: "Hola, quiero agendar valoración para ojeras."
  },
  menton: {
    ...common,
    image: "/visuals/hero-architecture.webp",
    imageAlt: "Composición editorial sobre estructura y perfil facial",
    eyebrow: "Diseño facial",
    title: "Mentón",
    summary: "Evaluación de proyección y proporción del tercio inferior para equilibrar perfil y lectura frontal.",
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: ["El tratamiento del mentón puede utilizar ácido hialurónico para modificar proyección, longitud visual, soporte y transición con mandíbula y labios.", "Su indicación depende de la estructura completa del perfil, no de observar el mentón de forma aislada."],
    indications: ["Proyección limitada", "Asimetría leve", "Desbalance entre nariz, labios y tercio inferior"],
    notIndicated: ["Problemas óseos que requieren cirugía", "Expectativas de cambio estructural extremo", "Inflamación o infección activa"],
    hautlabApproach: ["Se analiza perfil, cierre labial, sonrisa, nariz y mandíbula antes de indicar volumen.", "La meta es mejorar equilibrio, no crear un mentón excesivamente largo o proyectado."],
    investment: { label: "Cotización individual", note: "El monto depende del producto, cantidad y complejidad anatómica. Se define después de valorar el perfil completo." },
    faq: [{ question: "¿Un mentón más proyectado siempre mejora el perfil?", answer: "No. La proyección debe guardar relación con nariz, labios, mandíbula y altura facial." }, { question: "¿Se puede combinar con rinomodelación?", answer: "En casos seleccionados sí, porque ambos puntos modifican la lectura del perfil. La indicación se decide de forma conjunta." }],
    related: [{ label: "Rinomodelación", href: "/procedimientos/rinomodelacion" }, { label: "Labios", href: "/procedimientos/labios" }],
    whatsappMessage: "Hola, quiero agendar valoración para mentón."
  },
  acne: {
    ...common,
    image: "/visuals/clinic-office.webp",
    imageAlt: "Ambiente de valoración médica privada para acné",
    eyebrow: "Condiciones de piel",
    title: "Acné",
    summary: "Plan médico progresivo para controlar inflamación, brotes, pigmento y secuelas.",
    category: { label: "Condiciones de piel", href: "/tratamientos/dermatologia-clinica" },
    definition: ["El acné es una condición inflamatoria multifactorial que puede afectar rostro, pecho y espalda.", "El tratamiento depende del tipo de lesión, severidad, antecedentes y tolerancia de la piel."],
    indications: ["Brotes persistentes", "Comedones", "Inflamación", "Manchas y cicatrices"],
    notIndicated: ["Automedicación sin diagnóstico", "Cambios constantes de rutina", "Procedimientos agresivos con inflamación activa"],
    hautlabApproach: ["Se ordena primero la inflamación y la barrera cutánea.", "Las secuelas se tratan después de controlar la actividad."],
    clinicalDetails: {
      evaluation: [
        "Tipo de lesión, severidad, distribución, duración, cicatrices y pigmentación residual.",
        "Productos y medicamentos usados, respuesta previa, tolerancia cutánea y adherencia real.",
        "Factores hormonales o sistémicos cuando la historia clínica justifica ampliar el estudio."
      ],
      recovery: [
        "El control es progresivo y suele requerir ajustes; cambiar el plan antes de tiempo dificulta valorar respuesta.",
        "Algunos tratamientos producen resequedad, irritación o una fase inicial de adaptación.",
        "Las cicatrices se abordan después de controlar suficientemente la actividad inflamatoria."
      ],
      risks: [
        "La automedicación puede aumentar irritación, manchas, resistencia antimicrobiana o retrasar el tratamiento correcto.",
        "Los efectos adversos dependen del tratamiento indicado y deben explicarse antes de iniciarlo.",
        "Procedimientos agresivos sobre acné activo pueden aumentar inflamación y riesgo de cicatriz o pigmentación."
      ],
      alternatives: [
        "Tratamiento tópico, sistémico o combinado según severidad y características del paciente.",
        "Procedimientos complementarios seleccionados, sin sustituir el control médico de la actividad.",
        "Mantenimiento individualizado para disminuir recaídas después del control inicial."
      ],
      warningSigns: [
        "Nódulos dolorosos, cicatrización rápida, brote súbito intenso o afectación extensa de pecho y espalda.",
        "Cambios marcados del estado de ánimo, síntomas sistémicos o reacción importante durante un tratamiento.",
        "Embarazo o posibilidad de embarazo antes de usar medicamentos contraindicados."
      ]
    },
    expectations: [
      { label: "Diagnóstico", value: "Se clasifica el patrón antes de elegir tratamiento." },
      { label: "Respuesta", value: "El control es gradual y requiere constancia y seguimiento." },
      { label: "Secuelas", value: "Manchas y cicatrices se tratan después de controlar brotes activos." }
    ],
    investment: { label: "Consulta inicial $1,300 MXN", note: "Los medicamentos, estudios o procedimientos posteriores se indican y cotizan únicamente cuando el diagnóstico y la evolución lo justifican." },
    faq: [{ question: "¿El acné requiere estudios?", answer: "En algunos casos sí, según edad, patrón, síntomas asociados y antecedentes." }, { question: "¿Cuándo se tratan las cicatrices?", answer: "Cuando el acné activo está suficientemente controlado para no seguir generando nuevas lesiones." }],
    related: [
      { label: "Cicatrices de acné", href: "/procedimientos/cicatrices-acne" },
      { label: "Peelings médicos", href: "/procedimientos/peelings-medicos" },
      { label: "Rosácea", href: "/procedimientos/rosacea" },
      { label: "Dermatología clínica", href: "/tratamientos/dermatologia-clinica" }
    ],
    whatsappMessage: "Hola, quiero agendar valoración por acné.",
    medicalReview: review([
      {
        label: "American Academy of Dermatology · Guía clínica de acné",
        href: "https://www.aad.org/member/clinical-quality/guidelines/acne"
      },
      {
        label: "American Academy of Dermatology · Diagnóstico y tratamiento del acné",
        href: "https://www.aad.org/public/diseases/acne/derm-treat/treat"
      }
    ])
  },
  "cicatrices-acne": {
    ...common,
    image: "/visuals/skin-macro.webp",
    imageAlt: "Macro editorial de textura cutánea",
    eyebrow: "Piel y textura",
    title: "Cicatrices de acné",
    summary: "Plan por etapas para mejorar textura, bordes y profundidad después de controlar el acné activo.",
    category: { label: "Piel y textura", href: "/tratamientos/calidad-de-piel-y-soporte" },
    definition: ["Las cicatrices de acné pueden ser hundidas, elevadas, estrechas, anchas o mixtas, y no responden igual a una sola técnica.", "Su tratamiento suele requerir combinar procedimientos y evaluar la respuesta entre sesiones."],
    indications: ["Cicatrices atróficas estables", "Textura irregular", "Secuelas después de controlar brotes activos"],
    notIndicated: ["Acné inflamatorio no controlado", "Expectativa de borrar toda cicatriz", "Procedimientos intensos sin preparación de la piel"],
    hautlabApproach: ["Se clasifica el tipo de cicatriz antes de elegir tecnología o técnica.", "El objetivo es mejorar sombras y textura de forma progresiva, no prometer una piel completamente lisa."],
    clinicalDetails: {
      evaluation: [
        "Actividad del acné, tendencia a pigmentación, tipo de cicatriz y profundidad predominante.",
        "Presencia de cicatrices rolling, boxcar, ice-pick, elevadas o combinadas.",
        "Fototipo, medicamentos, procedimientos previos y tiempo disponible para recuperación."
      ],
      recovery: [
        "La recuperación cambia según la combinación indicada y puede incluir edema, enrojecimiento, costras o descamación.",
        "La remodelación de colágeno es progresiva y no se evalúa únicamente durante los primeros días.",
        "Con frecuencia se requieren varias sesiones y técnicas diferentes."
      ],
      risks: [
        "Hiperpigmentación o hipopigmentación, eritema persistente, infección, brote de acné o nueva cicatriz.",
        "Una técnica inadecuada para el tipo de cicatriz puede producir poco beneficio con recuperación innecesaria.",
        "No existe un procedimiento único capaz de borrar todas las cicatrices."
      ],
      alternatives: [
        "Subcisión, técnicas focales, peelings, microneedling, radiofrecuencia fraccionada u otras estrategias según el patrón.",
        "Camuflaje cosmético y fotoprotección mientras se controla actividad o pigmentación.",
        "No intervenir hasta que el acné activo y la barrera cutánea estén suficientemente estables."
      ],
      warningSigns: [
        "Dolor creciente, secreción, fiebre, ampollas extensas o enrojecimiento que se expande después de un procedimiento.",
        "Pigmentación intensa o zonas pálidas que aparecen de forma progresiva.",
        "Reactivación importante de acné, herpes u otra infección."
      ]
    },
    expectations: [
      { label: "Primero", value: "El acné activo debe estar controlado antes de tratar secuelas." },
      { label: "Plan", value: "La técnica se elige por tipo de cicatriz, no por tendencia." },
      { label: "Evolución", value: "La mejoría es gradual y suele requerir sesiones combinadas." }
    ],
    investment: { label: "Valoración inicial $1,300 MXN", note: "El costo por sesión depende de la combinación indicada, extensión de la zona y número de sesiones. Se cotiza después de clasificar las cicatrices." },
    faq: [{ question: "¿Se pueden eliminar por completo?", answer: "No siempre. El objetivo realista es mejorar profundidad, bordes, textura y visibilidad." }, { question: "¿Cuántas sesiones se necesitan?", answer: "Depende del tipo de cicatriz, técnica elegida y respuesta individual; suele plantearse un proceso por etapas." }],
    related: [
      { label: "Acné", href: "/procedimientos/acne" },
      { label: "Peelings médicos", href: "/procedimientos/peelings-medicos" },
      { label: "Piel y textura", href: "/tratamientos/calidad-de-piel-y-soporte" },
      { label: "Skin booster", href: "/procedimientos/skin-booster" }
    ],
    whatsappMessage: "Hola, quiero agendar valoración para cicatrices de acné.",
    medicalReview: review([
      {
        label: "American Academy of Dermatology · Consulta y tratamiento de cicatrices de acné",
        href: "https://www.aad.org/public/diseases/acne/derm-treat/scars/treatment"
      },
      {
        label: "American Academy of Dermatology · Tratamiento médico del acné",
        href: "https://www.aad.org/public/diseases/acne/derm-treat/treat"
      }
    ])
  },
  melasma: {
    ...common,
    eyebrow: "Piel y pigmento",
    title: "Melasma",
    summary: "Control progresivo del pigmento con diagnóstico, fotoprotección y tratamiento combinado.",
    category: { label: "Condiciones de piel", href: "/tratamientos/dermatologia-clinica" },
    definition: ["El melasma es una alteración crónica del pigmento influida por radiación, hormonas, inflamación y predisposición individual.", "No se trata como una mancha aislada ni con una sola sesión."],
    indications: ["Pigmentación facial simétrica", "Recaídas frecuentes", "Respuesta parcial a cremas"],
    notIndicated: ["Promesas de eliminación definitiva", "Procedimientos intensos sin preparar la piel", "Falta de fotoprotección"],
    hautlabApproach: ["Se prioriza control sostenido y reducción de recaídas.", "La intensidad del tratamiento se adapta al fototipo y sensibilidad."],
    clinicalDetails: {
      evaluation: [
        "Distribución, tonalidad, evolución, embarazo, hormonas, exposición solar y productos irritantes.",
        "Diagnósticos diferenciales cuando la pigmentación es unilateral, atípica o acompañada de otros cambios.",
        "Fototipo, sensibilidad, tratamientos previos y capacidad real de mantener fotoprotección."
      ],
      recovery: [
        "La mejoría es gradual y las recaídas son posibles incluso después de una buena respuesta.",
        "La fotoprotección y el mantenimiento forman parte del tratamiento, no son recomendaciones accesorias.",
        "Los procedimientos se espacian y ajustan según tolerancia y estabilidad del pigmento."
      ],
      risks: [
        "Irritación, dermatitis, rebote pigmentario o hiperpigmentación postinflamatoria.",
        "El uso indiscriminado de mezclas, esteroides o despigmentantes puede adelgazar o sensibilizar la piel.",
        "Láseres, peelings u otras energías mal indicadas pueden empeorar el pigmento."
      ],
      alternatives: [
        "Fotoprotección, tratamiento tópico y mantenimiento individualizado.",
        "Procedimientos seleccionados solo cuando el fototipo, la barrera y la estabilidad lo permiten.",
        "Observación o corrección cosmética cuando el riesgo de irritación supera el beneficio esperado."
      ],
      warningSigns: [
        "Pigmentación de aparición súbita, unilateral, con inflamación, descamación marcada o cambio de una lesión específica.",
        "Ardor intenso, ampollas, costras o empeoramiento rápido después de un producto o procedimiento.",
        "Uso prolongado de fórmulas no identificadas o productos que provocan adelgazamiento visible de la piel."
      ]
    },
    expectations: [
      { label: "Objetivo", value: "Controlar y aclarar progresivamente; no prometer eliminación definitiva." },
      { label: "Base", value: "Fotoprotección y mantenimiento sostenido." },
      { label: "Procedimientos", value: "Solo cuando fototipo, sensibilidad y estabilidad lo permiten." }
    ],
    investment: { label: "Consulta inicial $1,300 MXN", note: "El plan puede incluir tratamiento domiciliario y procedimientos seleccionados. La inversión total depende de sensibilidad, fototipo y evolución." },
    faq: [{ question: "¿Se elimina para siempre?", answer: "No suele hablarse de curación definitiva; el objetivo es controlarlo y reducir recaídas." }, { question: "¿El láser siempre ayuda?", answer: "No. En ciertos casos puede empeorar el pigmento si se usa sin indicación adecuada." }],
    related: [
      { label: "Peelings médicos", href: "/procedimientos/peelings-medicos" },
      { label: "Rosácea", href: "/procedimientos/rosacea" },
      { label: "Hollywood Peel", href: "/procedimientos/hollywood-peel" },
      { label: "Dermatología clínica", href: "/tratamientos/dermatologia-clinica" }
    ],
    whatsappMessage: "Hola, quiero agendar valoración por melasma.",
    medicalReview: review([
      {
        label: "American Academy of Dermatology · Diagnóstico y tratamiento del melasma",
        href: "https://www.aad.org/public/diseases/a-z/melasma-treatment"
      },
      {
        label: "American Academy of Dermatology · Melasma: cuidados y prevención de recaídas",
        href: "https://www.aad.org/public/diseases/a-z/melasma-self-care"
      }
    ])
  },
  rosacea: {
    ...common,
    eyebrow: "Condiciones de piel",
    title: "Rosácea",
    summary: "Control de enrojecimiento, sensibilidad, brotes e irritación mediante un plan adaptado a desencadenantes y barrera cutánea.",
    category: { label: "Condiciones de piel", href: "/tratamientos/dermatologia-clinica" },
    definition: ["La rosácea es una condición inflamatoria crónica que puede producir enrojecimiento, vasos visibles, ardor, sensibilidad y lesiones similares al acné.", "Su intensidad fluctúa y puede empeorar con calor, sol, alcohol, alimentos, estrés o productos irritantes."],
    indications: ["Enrojecimiento persistente", "Ardor o sensibilidad", "Brotes inflamatorios recurrentes"],
    notIndicated: ["Rutinas agresivas", "Uso indiscriminado de exfoliantes", "Procedimientos con la barrera muy alterada"],
    hautlabApproach: ["Se estabiliza primero la barrera y se identifican desencadenantes relevantes.", "La tecnología o los procedimientos se consideran después, cuando la piel permite intervenir con menor riesgo de irritación."],
    investment: { label: "Consulta inicial $1,300 MXN", note: "El tratamiento domiciliario y cualquier procedimiento complementario se definen según subtipo, sensibilidad y evolución." },
    faq: [{ question: "¿La rosácea se cura?", answer: "Suele manejarse como una condición crónica. El objetivo es reducir síntomas, brotes y frecuencia de recaídas." }, { question: "¿Se puede confundir con acné?", answer: "Sí. Algunas variantes producen pápulas y pústulas, pero el tratamiento y la tolerancia cutánea son diferentes." }],
    related: [{ label: "Acné", href: "/procedimientos/acne" }, { label: "Melasma", href: "/procedimientos/melasma" }],
    whatsappMessage: "Hola, quiero agendar valoración por rosácea."
  },
  alopecia: {
    ...common,
    image: "/visuals/clinic-office.webp",
    imageAlt: "Ambiente de consulta para valoración de caída de cabello",
    eyebrow: "Condiciones de piel",
    title: "Caída de cabello y alopecia",
    summary: "Evaluación del patrón de caída, cuero cabelludo, antecedentes y posibles factores asociados antes de indicar tratamiento.",
    category: { label: "Condiciones de piel", href: "/tratamientos/dermatologia-clinica" },
    definition: ["La caída de cabello puede deberse a múltiples causas: patrón hereditario, efluvio, inflamación, alteraciones del cuero cabelludo, medicamentos o factores sistémicos.", "Distinguir el patrón es fundamental porque no todos los casos responden al mismo tratamiento."],
    indications: ["Aumento reciente de caída", "Disminución de densidad", "Entradas o coronilla progresivas", "Síntomas en cuero cabelludo"],
    notIndicated: ["Suplementos sin diagnóstico", "Promesas de recuperación completa", "Procedimientos antes de identificar el tipo de caída"],
    hautlabApproach: ["Se revisan temporalidad, patrón, antecedentes, medicamentos y estado del cuero cabelludo.", "Los estudios se solicitan solo cuando la historia y la exploración sugieren que aportarán información útil."],
    clinicalDetails: {
      evaluation: [
        "Patrón, temporalidad, densidad, miniaturización, inflamación, descamación y distribución de la pérdida.",
        "Antecedentes familiares, enfermedades, cirugía, dieta, pérdida de peso, estrés y medicamentos.",
        "Tricoscopia o estudios dirigidos cuando cambian el diagnóstico o la conducta."
      ],
      recovery: [
        "El ciclo del cabello hace que la respuesta se valore en meses, no en días.",
        "Algunos tratamientos requieren mantenimiento para conservar el beneficio.",
        "La respuesta depende de la causa, duración y viabilidad del folículo."
      ],
      risks: [
        "Tratar sin diagnóstico puede retrasar la identificación de alopecias inflamatorias o cicatriciales.",
        "Suplementos y procedimientos no sustituyen el manejo de la causa.",
        "Los efectos adversos y contraindicaciones cambian según el medicamento o procedimiento elegido."
      ],
      alternatives: [
        "Tratamiento tópico, oral o antiinflamatorio según el diagnóstico.",
        "Corrección de factores asociados solo cuando se documentan.",
        "Camuflaje, fibras, sistemas capilares o referencia para trasplante en candidatos seleccionados."
      ],
      warningSigns: [
        "Pérdida súbita en placas, dolor, ardor, pústulas, costras o descamación intensa.",
        "Pérdida de cejas, pestañas o vello corporal, o áreas lisas con apariencia cicatricial.",
        "Caída acompañada de síntomas sistémicos o deterioro rápido."
      ]
    },
    expectations: [
      { label: "Diagnóstico", value: "Se distingue caída difusa, patrón androgenético e inflamación." },
      { label: "Tiempo", value: "La respuesta se valora en meses por el ciclo del folículo." },
      { label: "Mantenimiento", value: "Puede ser necesario según la causa y el tratamiento indicado." }
    ],
    investment: { label: "Consulta inicial $1,300 MXN", note: "Estudios, medicamentos o procedimientos se indican por separado cuando el diagnóstico lo requiere." },
    faq: [{ question: "¿Siempre necesito análisis de laboratorio?", answer: "No. Se solicitan cuando los antecedentes, síntomas o patrón de caída hacen razonable buscar factores asociados." }, { question: "¿El cabello perdido siempre vuelve?", answer: "Depende de la causa, el tiempo de evolución y si el folículo conserva capacidad de recuperación." }],
    related: [
      { label: "Dermatología clínica", href: "/tratamientos/dermatologia-clinica" },
      { label: "Peelings médicos", href: "/procedimientos/peelings-medicos" },
      { label: "Procedimientos", href: "/procedimientos" }
    ],
    whatsappMessage: "Hola, quiero agendar valoración por caída de cabello.",
    medicalReview: review([
      {
        label: "American Academy of Dermatology · Diagnóstico y tratamiento de la caída de cabello",
        href: "https://www.aad.org/public/diseases/hair-loss/treatment"
      },
      {
        label: "PubMed · Revisión sistemática del manejo de alopecia androgenética (2024)",
        href: "https://pubmed.ncbi.nlm.nih.gov/38852607/"
      }
    ])
  },
  verrugas: {
    ...common,
    image: "/visuals/treatment-room.webp",
    imageAlt: "Ambiente privado para procedimientos focales de piel",
    eyebrow: "Procedimientos focales",
    title: "Verrugas",
    summary: "Valoración de lesiones y selección de técnica según localización, número y diagnóstico.",
    category: { label: "Procedimientos focales", href: "/tratamientos/dermatologia-procedimental" },
    definition: ["Las verrugas son lesiones causadas con frecuencia por infección viral, aunque no toda lesión elevada es una verruga.", "Antes de tratar se confirma el diagnóstico y se elige la técnica más adecuada."],
    indications: ["Lesiones compatibles con verruga", "Molestia o crecimiento", "Localización que requiere tratamiento"],
    notIndicated: ["Diagnóstico incierto", "Lesiones pigmentadas sin valoración", "Infección o inflamación activa"],
    hautlabApproach: ["Se evita destruir una lesión sin saber qué es.", "La técnica puede incluir cauterización, crioterapia u otras opciones según el caso."],
    investment: { label: "Valoración desde $1,300 MXN", note: "El procedimiento se cotiza según diagnóstico, número de lesiones, tamaño, localización y técnica requerida." },
    faq: [{ question: "¿Pueden volver?", answer: "Sí. La recurrencia depende del tipo de lesión, localización y respuesta individual." }, { question: "¿Todas se cauterizan?", answer: "No. La técnica se define después de valorar diagnóstico, tamaño, número y zona." }],
    related: [{ label: "Lunares", href: "/procedimientos/lunares" }, { label: "Todas las áreas", href: "/procedimientos" }],
    whatsappMessage: "Hola, quiero agendar valoración por verrugas."
  },
  lunares: {
    ...common,
    image: "/visuals/treatment-room.webp",
    imageAlt: "Ambiente clínico para valoración de lunares y lesiones de piel",
    eyebrow: "Procedimientos focales",
    title: "Lunares y lesiones pigmentadas",
    summary: "Evaluación clínica y dermatoscópica para decidir observación, seguimiento, retiro o estudio.",
    category: { label: "Procedimientos focales", href: "/tratamientos/dermatologia-procedimental" },
    definition: ["Los lunares son lesiones pigmentadas frecuentes, pero no todas las manchas o elevaciones corresponden al mismo diagnóstico.", "La exploración y, cuando está indicado, la dermatoscopia ayudan a decidir si conviene observar, documentar, retirar o estudiar la lesión."],
    indications: ["Cambio percibido en una lesión", "Molestia o traumatismo repetido", "Duda diagnóstica", "Deseo de retiro después de valoración"],
    notIndicated: ["Eliminar sin revisar el diagnóstico", "Cauterizar lesiones sospechosas", "Prometer ausencia de cicatriz"],
    hautlabApproach: ["Se prioriza saber qué es la lesión antes de elegir cómo retirarla.", "Cuando una lesión requiere estudio, la técnica debe preservar material útil y permitir análisis adecuado."],
    investment: { label: "Valoración inicial $1,300 MXN", note: "El retiro, estudio o seguimiento se cotiza según diagnóstico, localización, técnica y necesidad de análisis." },
    faq: [{ question: "¿Todos los lunares se pueden cauterizar?", answer: "No. La técnica depende del diagnóstico y de si es necesario conservar tejido para estudio." }, { question: "¿Retirar un lunar deja cicatriz?", answer: "Todo procedimiento que atraviesa la piel puede dejar una marca. Su apariencia depende de técnica, zona, tamaño y cicatrización individual." }],
    related: [{ label: "Verrugas", href: "/procedimientos/verrugas" }, { label: "Procedimientos focales", href: "/tratamientos/dermatologia-procedimental" }],
    whatsappMessage: "Hola, quiero agendar valoración de un lunar o lesión pigmentada."
  }
};
