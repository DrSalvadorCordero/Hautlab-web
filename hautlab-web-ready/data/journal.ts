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
    slug: "por-que-vuelve-melasma",
    title: "¿Por qué vuelve el melasma? Recurrencia, fotoprotección y mantenimiento",
    description:
      "El melasma puede mejorar y reaparecer. Una guía clínica sobre recurrencia, luz visible, fotoprotección, mantenimiento y el papel real de los procedimientos.",
    category: "Dermatología clínica",
    preparedAt: "2026-09-25",
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
