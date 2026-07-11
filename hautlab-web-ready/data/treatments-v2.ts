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
    investment: { label: "$5,500 MXN", note: "Incluye valoración, aplicación, revisión y retoque cuando esté indicado. La cantidad de producto y la viabilidad del procedimiento se confirman durante la valoración." },
    faq: [{ question: "¿La rinomodelación sustituye una cirugía?", answer: "No. Puede mejorar proporciones en casos seleccionados, pero no resuelve todos los problemas estructurales." }, { question: "¿El resultado es inmediato?", answer: "El cambio suele apreciarse de inmediato, aunque la inflamación inicial puede modificar temporalmente la lectura del resultado." }],
    related: [{ label: "Labios", href: "/procedimientos/labios" }, { label: "Toxina botulínica", href: "/procedimientos/toxina-botulinica" }],
    whatsappMessage: "Hola, quiero agendar valoración para rinomodelación."
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
    investment: { label: "$3,500 MXN · tercio superior", note: "La dosis se ajusta a fuerza muscular, patrón de movimiento y objetivos. Otras zonas se cotizan después de valoración." },
    faq: [{ question: "¿Cuándo empieza a notarse?", answer: "El efecto aparece de forma progresiva durante los primeros días y se estabiliza después." }, { question: "¿Qué pasa si dejo de aplicarla?", answer: "El movimiento regresa gradualmente; no empeora el rostro por suspenderla." }],
    related: [{ label: "Rinomodelación", href: "/procedimientos/rinomodelacion" }, { label: "Labios", href: "/procedimientos/labios" }],
    whatsappMessage: "Hola, quiero agendar valoración para toxina botulínica."
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
    related: [{ label: "Rinomodelación", href: "/procedimientos/rinomodelacion" }, { label: "Toxina botulínica", href: "/procedimientos/toxina-botulinica" }],
    whatsappMessage: "Hola, quiero agendar valoración para labios."
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
    investment: { label: "Consulta inicial $1,300 MXN", note: "Los medicamentos, estudios o procedimientos posteriores se indican y cotizan únicamente cuando el diagnóstico y la evolución lo justifican." },
    faq: [{ question: "¿El acné requiere estudios?", answer: "En algunos casos sí, según edad, patrón, síntomas asociados y antecedentes." }, { question: "¿Cuándo se tratan las cicatrices?", answer: "Cuando el acné activo está suficientemente controlado para no seguir generando nuevas lesiones." }],
    related: [{ label: "Melasma", href: "/procedimientos/melasma" }, { label: "Condiciones de piel", href: "/tratamientos/dermatologia-clinica" }],
    whatsappMessage: "Hola, quiero agendar valoración por acné."
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
    investment: { label: "Consulta inicial $1,300 MXN", note: "El plan puede incluir tratamiento domiciliario y procedimientos seleccionados. La inversión total depende de sensibilidad, fototipo y evolución." },
    faq: [{ question: "¿Se elimina para siempre?", answer: "No suele hablarse de curación definitiva; el objetivo es controlarlo y reducir recaídas." }, { question: "¿El láser siempre ayuda?", answer: "No. En ciertos casos puede empeorar el pigmento si se usa sin indicación adecuada." }],
    related: [{ label: "Acné", href: "/procedimientos/acne" }, { label: "Piel y textura", href: "/tratamientos/calidad-de-piel-y-soporte" }],
    whatsappMessage: "Hola, quiero agendar valoración por melasma."
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
    related: [{ label: "Procedimientos focales", href: "/tratamientos/dermatologia-procedimental" }, { label: "Todas las áreas", href: "/procedimientos" }],
    whatsappMessage: "Hola, quiero agendar valoración por verrugas."
  }
};
