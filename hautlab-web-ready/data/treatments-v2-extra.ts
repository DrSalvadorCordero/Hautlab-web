import type { TreatmentPageContent } from "@/components/treatments/treatment-page-layout";

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

export const extraTreatmentsV2: Record<string, TreatmentPageContent> = {
  mandibula: {
    ...common,
    image: "/visuals/hero-architecture.webp",
    imageAlt: "Composición editorial asociada a estructura y contorno facial",
    eyebrow: "Diseño facial",
    title: "Mandíbula",
    summary: "Definición del tercio inferior basada en estructura, proporción y peso visual, no en añadir volumen de forma automática.",
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: [
      "El tratamiento de la mandíbula puede utilizar ácido hialurónico para reforzar puntos estructurales, mejorar continuidad y ordenar la transición entre mentón, cuerpo y ángulo mandibular.",
      "No reduce grasa ni elimina flacidez. Su utilidad depende del soporte óseo, el grosor de tejidos y la cantidad de volumen que el rostro puede integrar sin verse pesado."
    ],
    indications: ["Contorno mandibular poco definido", "Asimetrías leves", "Transición mentón-mandíbula mejorable"],
    notIndicated: ["Tercio inferior ya pesado", "Flacidez o grasa como problema predominante", "Expectativa de cambio quirúrgico"],
    hautlabApproach: [
      "Se valora primero el rostro completo, incluyendo mentón, cuello, maseteros y distribución de tejidos.",
      "La meta es crear continuidad y soporte, no dibujar una línea rígida ni masculinizar todos los rostros."
    ],
    investment: { label: "Cotización individual", note: "Depende del producto, cantidad, puntos anatómicos y objetivo. La valoración define si conviene tratar mandíbula, mentón, maseteros o ninguna de estas zonas." },
    faq: [
      { question: "¿La mandíbula se marca siempre con relleno?", answer: "No. En algunos rostros el volumen puede aumentar el peso visual. También puede ser necesario valorar mentón, maseteros, tejido graso o flacidez." },
      { question: "¿Puede combinarse con toxina en maseteros?", answer: "En casos seleccionados sí, pero cumplen funciones distintas: la toxina modifica actividad muscular y el relleno aporta soporte estructural." }
    ],
    related: [{ label: "Mentón", href: "/procedimientos/menton" }, { label: "Armonización facial", href: "/procedimientos/armonizacion-facial" }],
    whatsappMessage: "Hola, quiero agendar valoración para definición mandibular."
  },
  "armonizacion-facial": {
    ...common,
    image: "/visuals/hero-architecture.webp",
    imageAlt: "Composición editorial sobre balance y proporción facial",
    eyebrow: "Diseño facial",
    title: "Armonización facial",
    summary: "Plan integral que prioriza proporción, secuencia y límites antes de elegir productos o zonas.",
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: [
      "La armonización facial no es un producto ni un paquete fijo. Es una estrategia que analiza estructura, movimiento, piel y proporciones para decidir qué zonas podrían beneficiarse de intervención.",
      "Puede incluir una sola zona, varias etapas o incluso la decisión de no añadir volumen."
    ],
    indications: ["Desbalance entre perfil y vista frontal", "Cambios que requieren secuencia", "Deseo de mejora global sin perder identidad"],
    notIndicated: ["Búsqueda de transformación extrema", "Paquetes iguales para todos", "Expectativa de resolver todo en una sesión"],
    hautlabApproach: [
      "Se jerarquiza qué cambio produce mayor beneficio con menor intervención.",
      "Cada etapa debe integrarse al rostro y conservar expresión. La cantidad de producto nunca sustituye al criterio."
    ],
    investment: { label: "Plan personalizado", note: "La inversión se define por etapas después de valorar anatomía, prioridades y productos indicados. No se vende un número predeterminado de jeringas." },
    faq: [
      { question: "¿Armonización significa tratar todo el rostro?", answer: "No. Puede consistir en una intervención mínima o en un plan por etapas. Tratar más zonas no necesariamente produce un mejor resultado." },
      { question: "¿Se hace todo el mismo día?", answer: "No siempre. Dividir el plan permite observar integración, inflamación y prioridades antes de continuar." }
    ],
    related: [{ label: "Rinomodelación", href: "/procedimientos/rinomodelacion" }, { label: "Mandíbula", href: "/procedimientos/mandibula" }],
    whatsappMessage: "Hola, quiero agendar una valoración de armonización facial."
  },
  bioestimuladores: {
    ...common,
    eyebrow: "Piel y soporte",
    title: "Bioestimuladores",
    summary: "Tratamientos orientados a soporte y calidad cutánea mediante una respuesta progresiva, sin perseguir volumen evidente.",
    category: { label: "Piel y textura", href: "/tratamientos/calidad-de-piel-y-soporte" },
    definition: [
      "Los bioestimuladores son materiales inyectables utilizados para favorecer una respuesta gradual del tejido y mejorar determinadas características de soporte y calidad de piel.",
      "No actúan igual que un relleno convencional y sus resultados dependen del producto, la dilución, el plano, la zona y la respuesta individual."
    ],
    indications: ["Pérdida gradual de soporte", "Calidad cutánea disminuida", "Plan preventivo o restaurativo seleccionado"],
    notIndicated: ["Expectativa de resultado inmediato", "Necesidad de corrección estructural precisa", "Inflamación o infección activa"],
    hautlabApproach: [
      "Se diferencia primero si el problema es soporte, volumen, textura o flacidez.",
      "La selección de producto y técnica se adapta al rostro; no se utiliza el mismo protocolo en todas las edades ni anatomías."
    ],
    investment: { label: "Cotización individual", note: "Depende del producto, cantidad, zona y número de sesiones. Se confirma después de valoración y explicación de expectativas reales." },
    faq: [
      { question: "¿El resultado se ve de inmediato?", answer: "El efecto principal suele ser progresivo. La apariencia inicial puede estar influida por líquido, inflamación o técnica de aplicación." },
      { question: "¿Sustituye al ácido hialurónico?", answer: "No necesariamente. Son herramientas diferentes y pueden indicarse por separado o dentro de un plan combinado." }
    ],
    related: [{ label: "Skin booster", href: "/procedimientos/skin-booster" }, { label: "Armonización facial", href: "/procedimientos/armonizacion-facial" }],
    whatsappMessage: "Hola, quiero agendar valoración para bioestimulación."
  },
  "hollywood-peel": {
    ...common,
    image: "/visuals/treatment-room.webp",
    imageAlt: "Ambiente clínico premium para tratamiento de calidad de piel",
    eyebrow: "Piel y textura",
    title: "Hollywood Peel",
    summary: "Procedimiento con carbón y tecnología láser orientado a luminosidad, textura y limpieza visual de la piel en casos seleccionados.",
    category: { label: "Piel y textura", href: "/tratamientos/calidad-de-piel-y-soporte" },
    definition: [
      "El Hollywood Peel combina una capa de carbón con energía láser para producir un tratamiento superficial y controlado.",
      "Puede utilizarse como parte de un plan para mejorar apariencia de poros, textura y luminosidad, pero no sustituye el diagnóstico ni resuelve por sí solo todas las manchas o cicatrices."
    ],
    indications: ["Textura superficial irregular", "Aspecto opaco", "Poros visibles en casos seleccionados"],
    notIndicated: ["Melasma inestable sin valoración", "Inflamación activa", "Expectativa de corregir cicatrices profundas en una sesión"],
    hautlabApproach: [
      "Se revisan fototipo, sensibilidad, pigmento y rutina antes de utilizar energía.",
      "La intensidad se mantiene contenida y se integra con fotoprotección y cuidado domiciliario cuando corresponde."
    ],
    investment: { label: "Primera sesión $1,500 MXN", note: "La indicación, parámetros y frecuencia dependen de fototipo, sensibilidad y objetivo. El precio puede variar si se combina con otras áreas o estrategias." },
    faq: [
      { question: "¿La piel se descama?", answer: "La recuperación suele ser limitada, aunque puede presentarse enrojecimiento o sensibilidad transitoria según parámetros y respuesta individual." },
      { question: "¿Elimina manchas profundas?", answer: "No necesariamente. El pigmento requiere diagnóstico porque algunas condiciones pueden empeorar con energía mal indicada." }
    ],
    related: [{ label: "Peelings médicos", href: "/procedimientos/peelings-medicos" }, { label: "Melasma", href: "/procedimientos/melasma" }],
    whatsappMessage: "Hola, quiero agendar valoración para Hollywood Peel."
  },
  "skin-booster": {
    ...common,
    eyebrow: "Piel y textura",
    title: "Skin booster",
    summary: "Microdepósitos inyectables orientados a hidratación, elasticidad y calidad visual sin buscar cambiar las proporciones del rostro.",
    category: { label: "Piel y textura", href: "/tratamientos/calidad-de-piel-y-soporte" },
    definition: [
      "Un skin booster utiliza productos inyectables diseñados para mejorar características de la piel mediante aplicaciones distribuidas en planos superficiales o medios.",
      "No equivale a rellenar surcos ni a crear volumen estructural. Su objetivo es calidad de piel y el resultado suele ser más discreto."
    ],
    indications: ["Deshidratación visible", "Textura fina irregular", "Piel con menor elasticidad o luminosidad"],
    notIndicated: ["Necesidad de proyección estructural", "Inflamación activa", "Expectativa de lifting o cambio inmediato marcado"],
    hautlabApproach: [
      "Se evalúan barrera, sensibilidad y grado de fotoenvejecimiento antes de elegir producto.",
      "Puede combinarse con otras estrategias, pero no se utiliza como sustituto genérico de un plan de piel."
    ],
    investment: { label: "Cotización individual", note: "La inversión depende del producto, zona y número de sesiones. Se define después de valoración." },
    faq: [
      { question: "¿Da volumen al rostro?", answer: "Su objetivo principal no es crear volumen estructural, aunque puede existir inflamación temporal después de la aplicación." },
      { question: "¿Cuántas sesiones se requieren?", answer: "Depende del producto, condición de la piel y objetivo. El plan se ajusta después de valorar la respuesta." }
    ],
    related: [{ label: "Bioestimuladores", href: "/procedimientos/bioestimuladores" }, { label: "Hollywood Peel", href: "/procedimientos/hollywood-peel" }],
    whatsappMessage: "Hola, quiero agendar valoración para skin booster."
  },
  "peelings-medicos": {
    ...common,
    eyebrow: "Piel y textura",
    title: "Peelings médicos",
    summary: "Exfoliación química controlada seleccionada según diagnóstico, fototipo, sensibilidad y profundidad requerida.",
    category: { label: "Piel y textura", href: "/tratamientos/calidad-de-piel-y-soporte" },
    definition: [
      "Los peelings médicos utilizan agentes químicos para producir una renovación controlada de capas superficiales o medias de la piel.",
      "El tipo, concentración, tiempo y preparación cambian según el objetivo. Un peeling más intenso no siempre es mejor ni más seguro."
    ],
    indications: ["Textura superficial irregular", "Pigmentación seleccionada", "Acné comedoniano o secuelas superficiales"],
    notIndicated: ["Barrera alterada", "Exposición solar sin control", "Pigmento o inflamación sin diagnóstico"],
    hautlabApproach: [
      "Se elige el agente a partir del problema y la tolerancia, no por tendencia o nombre comercial.",
      "La preparación y los cuidados posteriores forman parte del tratamiento para reducir irritación y pigmentación secundaria."
    ],
    investment: { label: "Cotización individual", note: "Depende del agente, profundidad, zona y preparación necesaria. Se confirma después de valoración." },
    faq: [
      { question: "¿Todos los peelings descaman mucho?", answer: "No. Algunos producen renovación casi imperceptible y otros requieren varios días de descamación. Depende del agente y profundidad." },
      { question: "¿Puedo hacerlo antes de un evento?", answer: "Debe planearse según el tipo de peeling y el tiempo de recuperación esperado. No conviene asumir que todos permiten actividad social inmediata." }
    ],
    related: [{ label: "Hollywood Peel", href: "/procedimientos/hollywood-peel" }, { label: "Acné", href: "/procedimientos/acne" }],
    whatsappMessage: "Hola, quiero agendar valoración para un peeling médico."
  }
};
