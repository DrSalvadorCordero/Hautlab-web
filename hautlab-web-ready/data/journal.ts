export type JournalAxis = "Piel" | "Proporción" | "Expresión" | "Fundamentos";

export type JournalArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  axis: JournalAxis;
  preparedAt: string;
  publishedAt?: string;
  readingTime: string;
};

export const journalArticles: JournalArticle[] = [
  {
    slug: "dermatitis-seborreica-por-que-vuelve",
    title: "Dermatitis seborreica: por qué vuelve y qué significa controlarla",
    description:
      "Cara, cuero cabelludo y recaídas: diferencia entre tratar el brote y mantener el control, riesgos del uso repetido de corticoides e irritación por productos.",
    category: "Dermatología clínica",
    axis: "Piel",
    preparedAt: "2026-10-17",
    publishedAt: "2026-10-18",
    readingTime: "9 min"
  },
  {
    slug: "acne-vs-rosacea-como-distinguir",
    title: "Acné vs rosácea: cómo distinguir brotes que se parecen",
    description: "Comedones, flushing, eritema y pápulas: claves para diferenciar acné y rosácea, reconocer coexistencia y saber cuándo consultar.",
    category: "Dermatología clínica",
    axis: "Piel",
    preparedAt: "2026-10-13",
    readingTime: "8 min"
  },
  {
    slug: "plla-colageno-expectativas-riesgos",
    title: "PLLA facial: qué significa estimular colágeno, cuánto esperar y qué riesgos importan",
    description:
      "Qué puede esperarse del ácido poli-L-láctico facial: estimulación gradual de colágeno, tiempos de evolución, selección de pacientes, nódulos y límites de reversibilidad.",
    category: "Medicina estética",
    axis: "Fundamentos",
    preparedAt: "2026-10-09",
    readingTime: "10 min"
  },
  {
    slug: "caida-cabello-diagnostico-antes-tratamiento",
    title: "Caída de cabello: por qué el diagnóstico debe ir antes del tratamiento",
    description:
      "No toda caída de cabello es la misma. Qué aportan la historia clínica, la exploración y la tricoscopia antes de elegir un tratamiento para alopecia.",
    category: "Dermatología clínica",
    axis: "Piel",
    preparedAt: "2026-10-03",
    readingTime: "10 min"
  },
  {
    slug: "rosacea-barrera-cutanea-irritar-no-es-tratar",
    title: "Rosácea y barrera cutánea: por qué irritar más no significa tratar mejor",
    description:
      "Ardor, tirantez y sensibilidad no siempre significan que hace falta añadir otro activo. Qué papel tiene la barrera cutánea en rosácea, cuándo simplificar y qué síntomas requieren otra evaluación.",
    category: "Dermatología clínica",
    axis: "Piel",
    preparedAt: "2026-09-29",
    readingTime: "9 min"
  },
  {
    slug: "toxina-movimiento-sin-borrar-expresion",
    title: "Toxina botulínica: tratar movimiento sin borrar expresión",
    description:
      "La meta no tiene que ser inmovilizar un rostro. Cómo la evaluación dinámica, la anatomía y la dosificación individual cambian el resultado.",
    category: "Neuromodulación",
    axis: "Expresión",
    preparedAt: "2026-09-29",
    readingTime: "8 min"
  },
  {
    slug: "mas-volumen-no-es-mas-armonia",
    title: "Más volumen no es más armonía: cuándo un relleno deja de mejorar proporción",
    description:
      "Corregir soporte y proporción no equivale a sumar mililitros. Una lectura clínica sobre sobrecorrección, dinámica facial y planificación por prioridades.",
    category: "Criterio estético",
    axis: "Proporción",
    preparedAt: "2026-09-29",
    readingTime: "8 min"
  },
  {
    slug: "cicatrices-acne-no-todas-se-tratan-igual",
    title: "Cicatrices de acné: por qué no todas se tratan igual",
    description:
      "Ice-pick, boxcar y rolling no representan la misma arquitectura. Clasificar la cicatriz antes de elegir energía, subcisión o técnicas focales cambia el plan.",
    category: "Dermatología clínica",
    axis: "Piel",
    preparedAt: "2026-09-29",
    readingTime: "9 min"
  },
  {
    slug: "por-que-vuelve-melasma",
    title: "¿Por qué vuelve el melasma? Recurrencia, fotoprotección y mantenimiento",
    description:
      "El melasma puede mejorar y reaparecer. Una guía clínica sobre recurrencia, luz visible, fotoprotección, mantenimiento y el papel real de los procedimientos.",
    category: "Dermatología clínica",
    axis: "Piel",
    preparedAt: "2026-09-25",
    readingTime: "9 min"
  },
  {
    slug: "cuando-consultar-por-acne",
    title: "Cuándo consultar por acné: señales de que conviene una valoración médica",
    description:
      "Una guía clínica para reconocer cuándo el acné deja de ser un problema razonable para manejar solo con productos: inflamación profunda, cicatrices, recaídas y falta de respuesta.",
    category: "Dermatología clínica",
    axis: "Piel",
    preparedAt: "2026-09-22",
    readingTime: "9 min"
  },
  {
    slug: "relleno-vs-bioestimulador",
    title: "Relleno vs bioestimulador: qué cambia y cuándo tiene sentido cada uno",
    description:
      "Ácido hialurónico, PLLA y CaHA no resuelven el mismo problema. Una comparación clínica sobre objetivo, tiempo de respuesta, precisión, reversibilidad y riesgos.",
    category: "Medicina estética",
    axis: "Fundamentos",
    preparedAt: "2026-09-22",
    readingTime: "8 min"
  }
];

export const journalArticleBySlug = Object.fromEntries(
  journalArticles.map((article) => [article.slug, article])
) as Record<string, JournalArticle>;
