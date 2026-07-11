import type { TreatmentPageContent } from "@/components/treatments/treatment-page-layout";

export type TreatmentPageRecord = TreatmentPageContent & {
  slug: string;
  metaTitle: string;
  metaDescription: string;
};

export const treatmentPages: TreatmentPageRecord[] = [
  {
    slug: "rinomodelacion",
    eyebrow: "Diseño facial",
    title: "Rinomodelación",
    summary: "Ajustes de proporción nasal con ácido hialurónico cuando la anatomía, la piel y el margen de seguridad lo permiten.",
    image: "/visuals/hero-architecture.webp",
    imageAlt: "Composición arquitectónica sobria asociada al diseño facial HAUTLAB",
    breadcrumbs: [
      { label: "Inicio", href: "/" },
      { label: "Procedimientos", href: "/procedimientos" },
      { label: "Rinomodelación" }
    ],
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: [
      "La rinomodelación es un procedimiento no quirúrgico que utiliza ácido hialurónico para modificar de forma selectiva transiciones del dorso, la punta o la proyección nasal.",
      "No reduce el tamaño real de la nariz ni sustituye una cirugía. Su utilidad depende de la anatomía y de que el cambio pueda lograrse sin añadir volumen innecesario."
    ],
    indications: [
      "Irregularidades leves del dorso.",
      "Transiciones poco armónicas entre radix, dorso y punta.",
      "Punta con soporte o definición mejorable en casos seleccionados.",
      "Pacientes que buscan un cambio contenido y entienden los límites del procedimiento."
    ],
    notIndicated: [
      "Cuando el objetivo requiere reducir estructuras o corregir función respiratoria.",
      "Cuando añadir producto empeoraría el volumen o la proporción.",
      "Si existe infección, inflamación activa o antecedente que eleve el riesgo.",
      "Cuando las expectativas no son compatibles con un resultado no quirúrgico."
    ],
    hautlabApproach: [
      "Se analiza el rostro completo, no solo la nariz. La relación con frente, labios, mentón y tercio medio determina si una modificación nasal realmente mejora la lectura facial.",
      "La prioridad es usar la menor cantidad necesaria y evitar convertir la nariz en una estructura más grande solo para disimular una irregularidad."
    ],
    expectations: [
      { label: "Sesión", value: "Aproximadamente 30–60 minutos, según valoración y complejidad." },
      { label: "Anestesia", value: "Tópica o local según técnica y tolerancia." },
      { label: "Recuperación", value: "Edema o sensibilidad temporal; la evolución varía entre pacientes." },
      { label: "Seguimiento", value: "Revisión programada para valorar integración y necesidad real de ajuste." },
      { label: "Duración", value: "Variable según producto, metabolismo, técnica y zona tratada." }
    ],
    faq: [
      { question: "¿La rinomodelación hace la nariz más pequeña?", answer: "No reduce hueso ni cartílago. Puede mejorar proporciones y transiciones visuales, pero en algunos casos añadir producto no es la decisión correcta." },
      { question: "¿Puede sustituir una rinoplastia?", answer: "No. La cirugía y la rinomodelación resuelven problemas distintos. La valoración define si el objetivo es compatible con un procedimiento no quirúrgico." },
      { question: "¿El resultado es permanente?", answer: "No. El ácido hialurónico es reabsorbible y su duración depende de múltiples factores individuales y técnicos." }
    ],
    related: [
      { label: "Toxina botulínica", href: "/tratamientos/toxina-botulinica" },
      { label: "Labios", href: "/tratamientos/labios" }
    ],
    whatsappMessage: "Hola, quiero agendar una valoración para rinomodelación en HAUTLAB.",
    metaTitle: "Rinomodelación en Mérida | HAUTLAB",
    metaDescription: "Rinomodelación en Mérida con valoración anatómica, enfoque conservador y resultados sobrios. Conoce indicaciones, límites y proceso HAUTLAB."
  },
  {
    slug: "toxina-botulinica",
    eyebrow: "Expresión facial",
    title: "Toxina botulínica",
    summary: "Modulación de la fuerza muscular para suavizar líneas dinámicas sin borrar la expresión ni uniformar todos los rostros.",
    image: "/visuals/skin-macro.webp",
    imageAlt: "Detalle de piel y expresión facial con iluminación suave",
    breadcrumbs: [
      { label: "Inicio", href: "/" },
      { label: "Procedimientos", href: "/procedimientos" },
      { label: "Toxina botulínica" }
    ],
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: [
      "La toxina botulínica disminuye temporalmente la contracción de músculos específicos. Se utiliza para suavizar líneas de expresión y equilibrar patrones de movimiento.",
      "El objetivo no es inmovilizar el rostro. La dosis y los puntos se ajustan a la fuerza muscular, la posición de las cejas y la expresión habitual."
    ],
    indications: [
      "Líneas dinámicas de frente, entrecejo o contorno de ojos.",
      "Contracción muscular excesiva en zonas seleccionadas.",
      "Pacientes que buscan una expresión más descansada sin perder movilidad natural."
    ],
    notIndicated: [
      "Cuando la línea depende principalmente de pérdida de volumen o daño cutáneo.",
      "Si existe infección activa en la zona de aplicación.",
      "Cuando se busca un resultado completamente inmóvil o incompatible con la anatomía."
    ],
    hautlabApproach: [
      "Se observa el rostro en reposo y movimiento. La posición de cejas, la compensación frontal y la fuerza de cada grupo muscular cambian el plan.",
      "No se replica una plantilla fija. Se conserva expresión donde aporta identidad y se reduce fuerza donde produce tensión o líneas dominantes."
    ],
    expectations: [
      { label: "Sesión", value: "Generalmente 20–40 minutos." },
      { label: "Anestesia", value: "Habitualmente no necesaria; puede usarse frío local." },
      { label: "Recuperación", value: "Retorno rápido a actividades, siguiendo indicaciones posteriores." },
      { label: "Seguimiento", value: "Revisión cuando esté indicada para valorar simetría y respuesta." },
      { label: "Duración", value: "Temporal y variable según dosis, zona, metabolismo y fuerza muscular." }
    ],
    faq: [
      { question: "¿Voy a quedar con el rostro congelado?", answer: "No es el objetivo. Una aplicación individualizada busca disminuir contracción excesiva conservando una expresión coherente con el rostro." },
      { question: "¿Cuándo empieza a notarse?", answer: "El efecto aparece de forma progresiva y no es inmediato. El tiempo exacto varía entre pacientes y zonas." },
      { question: "¿Qué pasa si dejo de aplicármela?", answer: "La actividad muscular regresa gradualmente. Suspenderla no empeora el rostro por sí mismo." }
    ],
    related: [
      { label: "Rinomodelación", href: "/tratamientos/rinomodelacion" },
      { label: "Labios", href: "/tratamientos/labios" }
    ],
    whatsappMessage: "Hola, quiero agendar una valoración para toxina botulínica en HAUTLAB.",
    metaTitle: "Toxina botulínica en Mérida | HAUTLAB",
    metaDescription: "Aplicación de toxina botulínica en Mérida con evaluación del movimiento facial, dosis individualizada y enfoque natural en HAUTLAB."
  },
  {
    slug: "labios",
    eyebrow: "Diseño facial",
    title: "Labios",
    summary: "Definición, proporción y soporte labial con ácido hialurónico, evitando que el volumen se convierta en el único objetivo.",
    image: "/visuals/skin-macro.webp",
    imageAlt: "Detalle editorial de piel y tercio inferior facial",
    breadcrumbs: [
      { label: "Inicio", href: "/" },
      { label: "Procedimientos", href: "/procedimientos" },
      { label: "Labios" }
    ],
    category: { label: "Diseño facial", href: "/tratamientos/medicina-estetica-facial" },
    definition: [
      "El tratamiento labial con ácido hialurónico puede mejorar contorno, hidratación, soporte, simetría o proyección en casos seleccionados.",
      "No todos los labios necesitan más volumen. En ocasiones el cambio correcto es definir, corregir proporción o no intervenir."
    ],
    indications: [
      "Contorno poco definido o asimetrías leves.",
      "Pérdida de soporte o hidratación estructural.",
      "Proporción labial mejorable respecto al resto del rostro.",
      "Pacientes que buscan cambios graduales y contenidos."
    ],
    notIndicated: [
      "Cuando el volumen adicional rompería la proporción facial.",
      "Si existe infección, herpes activo o inflamación importante.",
      "Cuando se busca replicar una forma ajena a la anatomía propia."
    ],
    hautlabApproach: [
      "Se evalúan arco de Cupido, columnas filtrales, relación entre labio superior e inferior, exposición dental y proyección del mentón.",
      "El producto se utiliza como herramienta de diseño y soporte. La cantidad se decide por anatomía, no por una meta de mililitros."
    ],
    expectations: [
      { label: "Sesión", value: "Aproximadamente 30–60 minutos." },
      { label: "Anestesia", value: "Tópica o local según técnica y sensibilidad." },
      { label: "Recuperación", value: "Edema y sensibilidad son frecuentes al inicio y disminuyen progresivamente." },
      { label: "Seguimiento", value: "Revisión según evolución y plan acordado." },
      { label: "Duración", value: "Variable según producto, técnica, metabolismo y movimiento labial." }
    ],
    faq: [
      { question: "¿Puedo verme natural con relleno labial?", answer: "Sí, cuando la indicación, la cantidad y la técnica respetan la anatomía. Natural no significa imperceptible, sino integrado al rostro." },
      { question: "¿Cuánto tarda en bajar la inflamación?", answer: "La inflamación inicial es variable. La apariencia de los primeros días no representa necesariamente el resultado integrado." },
      { question: "¿Siempre se utiliza un mililitro completo?", answer: "No. La cantidad se determina por el objetivo y la anatomía; no debe forzarse una dosis fija." }
    ],
    related: [
      { label: "Rinomodelación", href: "/tratamientos/rinomodelacion" },
      { label: "Toxina botulínica", href: "/tratamientos/toxina-botulinica" }
    ],
    whatsappMessage: "Hola, quiero agendar una valoración para tratamiento de labios en HAUTLAB.",
    metaTitle: "Ácido hialurónico en labios en Mérida | HAUTLAB",
    metaDescription: "Tratamiento de labios con ácido hialurónico en Mérida: definición, soporte y proporción con enfoque conservador y valoración médica."
  },
  {
    slug: "acne",
    eyebrow: "Condiciones de piel",
    title: "Acné",
    summary: "Evaluación del tipo de lesión, inflamación, hábitos, tratamientos previos y riesgo de secuelas para construir un plan progresivo.",
    image: "/visuals/clinic-office.webp",
    imageAlt: "Ambiente clínico privado para valoración de piel",
    breadcrumbs: [
      { label: "Inicio", href: "/" },
      { label: "Procedimientos", href: "/procedimientos" },
      { label: "Acné" }
    ],
    category: { label: "Condiciones de piel", href: "/tratamientos/dermatologia-clinica" },
    definition: [
      "El acné es un proceso inflamatorio de la unidad pilosebácea. Puede manifestarse con comedones, pápulas, pústulas, nódulos, pigmentación residual o cicatrices.",
      "El tratamiento depende de la intensidad, la distribución, el riesgo de cicatriz, los antecedentes y la tolerancia de la piel."
    ],
    indications: [
      "Brotes persistentes o recurrentes.",
      "Inflamación, manchas posteriores o cicatrices.",
      "Falta de respuesta o irritación con rutinas previas.",
      "Acné acompañado de cambios hormonales u otros síntomas que requieran evaluación adicional."
    ],
    notIndicated: [
      "No se prescribe una rutina agresiva sin valorar barrera y tolerancia.",
      "No se indican procedimientos sobre inflamación activa si pueden empeorarla.",
      "No se solicitan estudios de forma automática; se individualizan según historia clínica."
    ],
    hautlabApproach: [
      "Se ordenan prioridades: controlar inflamación, proteger barrera, reducir nuevas lesiones y después tratar pigmento o cicatrices.",
      "El plan puede incluir tratamiento tópico, sistémico, ajustes de rutina o procedimientos, siempre según valoración y seguimiento."
    ],
    expectations: [
      { label: "Consulta", value: "Valoración clínica y revisión de tratamientos previos." },
      { label: "Estudios", value: "Solo cuando la historia y los hallazgos los justifican." },
      { label: "Evolución", value: "El cambio es progresivo; requiere adherencia y ajustes." },
      { label: "Seguimiento", value: "Se programa según intensidad, tratamiento y tolerancia." },
      { label: "Objetivo", value: "Controlar actividad y reducir el riesgo de marcas y cicatrices." }
    ],
    faq: [
      { question: "¿El acné se cura con una limpieza facial?", answer: "Una limpieza puede apoyar algunos casos, pero no sustituye el diagnóstico ni el tratamiento de la inflamación y sus causas asociadas." },
      { question: "¿Siempre necesito estudios hormonales?", answer: "No. Se solicitan cuando existen datos clínicos que lo justifican, no como requisito universal." },
      { question: "¿Primero se tratan las cicatrices o los brotes?", answer: "Generalmente se prioriza controlar la actividad inflamatoria antes de iniciar procedimientos dirigidos a cicatrices." }
    ],
    related: [
      { label: "Melasma", href: "/tratamientos/melasma" },
      { label: "Peelings", href: "/tratamientos/calidad-de-piel-y-soporte" }
    ],
    whatsappMessage: "Hola, quiero agendar una valoración por acné en HAUTLAB.",
    metaTitle: "Consulta para acné en Mérida | HAUTLAB",
    metaDescription: "Valoración médica de acné en Mérida con plan progresivo para inflamación, manchas y riesgo de cicatrices. Agenda en HAUTLAB."
  },
  {
    slug: "melasma",
    eyebrow: "Condiciones de piel",
    title: "Melasma",
    summary: "Manejo progresivo del pigmento considerando exposición solar, inflamación, barrera cutánea, hormonas y tolerancia individual.",
    image: "/visuals/skin-macro.webp",
    imageAlt: "Detalle editorial de piel facial con iluminación natural",
    breadcrumbs: [
      { label: "Inicio", href: "/" },
      { label: "Procedimientos", href: "/procedimientos" },
      { label: "Melasma" }
    ],
    category: { label: "Condiciones de piel", href: "/tratamientos/dermatologia-clinica" },
    definition: [
      "El melasma es una alteración adquirida de la pigmentación que suele aparecer en áreas expuestas del rostro. Su comportamiento es crónico y puede fluctuar.",
      "No se maneja solo aclarando manchas. Es necesario controlar estímulos que favorecen la producción de pigmento y cuidar la barrera cutánea."
    ],
    indications: [
      "Manchas simétricas en mejillas, frente, labio superior o mandíbula.",
      "Pigmentación que empeora con sol, calor o irritación.",
      "Recaídas después de tratamientos previos.",
      "Piel sensible que no tolera esquemas intensivos."
    ],
    notIndicated: [
      "No se promete eliminación definitiva.",
      "No se realizan procedimientos agresivos sin controlar inflamación y fotoprotección.",
      "No se mantiene un despigmentante potente de forma indefinida sin seguimiento."
    ],
    hautlabApproach: [
      "El plan combina fotoprotección, control de irritación, activos despigmentantes y procedimientos seleccionados cuando aportan más beneficio que riesgo.",
      "Se prioriza estabilidad a largo plazo sobre aclarar rápido a costa de inflamación o rebote pigmentario."
    ],
    expectations: [
      { label: "Consulta", value: "Evaluación del patrón de pigmento, sensibilidad y tratamientos previos." },
      { label: "Rutina", value: "Se construye de forma gradual según tolerancia." },
      { label: "Procedimientos", value: "Solo si están indicados y dentro de un plan global." },
      { label: "Seguimiento", value: "Necesario para ajustar mantenimiento y prevenir recaídas." },
      { label: "Objetivo", value: "Mejorar control, uniformidad y estabilidad del pigmento." }
    ],
    faq: [
      { question: "¿El melasma se elimina para siempre?", answer: "No suele considerarse una condición de eliminación definitiva. El objetivo es controlarlo, aclararlo y reducir recaídas." },
      { question: "¿Un peeling puede empeorarlo?", answer: "Sí, si produce inflamación excesiva o se utiliza sin una indicación adecuada. Por eso se individualizan técnica y preparación." },
      { question: "¿Solo necesito protector solar?", answer: "La fotoprotección es esencial, pero muchas veces se requiere un plan más amplio que incluya barrera, activos y seguimiento." }
    ],
    related: [
      { label: "Acné", href: "/tratamientos/acne" },
      { label: "Calidad de piel", href: "/tratamientos/calidad-de-piel-y-soporte" }
    ],
    whatsappMessage: "Hola, quiero agendar una valoración por melasma o manchas en HAUTLAB.",
    metaTitle: "Tratamiento de melasma en Mérida | HAUTLAB",
    metaDescription: "Valoración y manejo de melasma en Mérida con fotoprotección, cuidado de barrera y tratamiento progresivo en HAUTLAB."
  },
  {
    slug: "verrugas",
    eyebrow: "Procedimientos focales",
    title: "Verrugas",
    summary: "Valoración de lesiones antes de retirarlas, elección de técnica y cuidados posteriores según localización, número y diagnóstico.",
    image: "/visuals/treatment-room.webp",
    imageAlt: "Sala de procedimiento médico con estética sobria",
    breadcrumbs: [
      { label: "Inicio", href: "/" },
      { label: "Procedimientos", href: "/procedimientos" },
      { label: "Verrugas" }
    ],
    category: { label: "Procedimientos focales", href: "/tratamientos/dermatologia-procedimental" },
    definition: [
      "Las verrugas son lesiones causadas con frecuencia por ciertos tipos de virus del papiloma humano, aunque no toda lesión elevada o rugosa es una verruga.",
      "Antes de tratar se confirma que la apariencia sea compatible y se valora la localización, el número, el tamaño y los tratamientos previos."
    ],
    indications: [
      "Lesiones compatibles con verruga común, plantar, filiforme o genital, según valoración.",
      "Lesiones que crecen, se multiplican, causan molestias o se traumatizan.",
      "Falta de respuesta a tratamientos previos."
    ],
    notIndicated: [
      "No se destruye una lesión sin una valoración razonable del diagnóstico.",
      "No se promete ausencia de recurrencia.",
      "No se utiliza la misma técnica para todas las zonas o todos los pacientes."
    ],
    hautlabApproach: [
      "Se diferencia entre lesiones que pueden tratarse en consulta y aquellas que requieren estudio, biopsia o una estrategia distinta.",
      "La técnica puede variar entre agentes tópicos, crioterapia, electrocauterio u otros métodos, según indicación y disponibilidad."
    ],
    expectations: [
      { label: "Valoración", value: "Confirma diagnóstico probable, número y localización." },
      { label: "Procedimiento", value: "La técnica se decide de forma individual." },
      { label: "Recuperación", value: "Puede existir costra, sensibilidad o cambio temporal de color." },
      { label: "Seguimiento", value: "Algunas lesiones requieren más de una sesión." },
      { label: "Recurrencia", value: "Es posible y depende de múltiples factores." }
    ],
    faq: [
      { question: "¿Todas las verrugas se pueden cauterizar?", answer: "No necesariamente. La técnica depende del tipo de lesión, la zona, el número y el riesgo de cicatriz o pigmentación." },
      { question: "¿Pueden volver a salir?", answer: "Sí. El tratamiento retira o destruye lesiones visibles, pero no garantiza que no aparezcan nuevas." },
      { question: "¿Una verruga genital significa cáncer?", answer: "No de forma automática. Existen distintos tipos virales y lesiones diferentes; la valoración define el siguiente paso y si se necesitan estudios adicionales." }
    ],
    related: [
      { label: "Dermatoscopia", href: "/tratamientos/dermatologia-procedimental" },
      { label: "Condiciones de piel", href: "/tratamientos/dermatologia-clinica" }
    ],
    whatsappMessage: "Hola, quiero agendar una valoración por verrugas o una lesión de piel en HAUTLAB.",
    metaTitle: "Valoración y tratamiento de verrugas en Mérida | HAUTLAB",
    metaDescription: "Valoración y tratamiento de verrugas en Mérida con selección de técnica, explicación de límites y cuidados posteriores en HAUTLAB."
  }
];

export function getTreatmentPage(slug: string) {
  return treatmentPages.find((item) => item.slug === slug);
}
