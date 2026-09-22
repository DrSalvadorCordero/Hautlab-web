export type JournalArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  preparedAt: string;
  readingTime: string;
};

export const journalArticles: JournalArticle[] = [
  {
    slug: "cuando-consultar-por-acne",
    title: "Cuándo consultar por acné: señales de que conviene una valoración médica",
    description:
      "Una guía clínica para reconocer cuándo el acné deja de ser un problema razonable para manejar solo con productos: inflamación profunda, cicatrices, recaídas, extensión corporal y falta de respuesta.",
    category: "Dermatología clínica",
    preparedAt: "2026-09-22",
    readingTime: "9 min"
  },
  {
    slug: "relleno-vs-bioestimulador",
    title: "Relleno vs bioestimulador: qué cambia y cuándo tiene sentido cada uno",
    description:
      "Ácido hialurónico, PLLA y CaHA no resuelven el mismo problema. Una comparación clínica sobre objetivo, tiempo de respuesta, precisión, reversibilidad y riesgos.",
    category: "Medicina estética",
    preparedAt: "2026-09-22",
    readingTime: "8 min"
  }
];

export const journalArticleBySlug = Object.fromEntries(
  journalArticles.map((article) => [article.slug, article])
) as Record<string, JournalArticle>;
