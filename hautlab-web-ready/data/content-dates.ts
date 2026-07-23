const date = (value: string) => new Date(`${value}T12:00:00.000Z`);

export const coreContentDates = {
  home: date("2026-07-23"),
  english: date("2026-07-21"),
  procedures: date("2026-07-23"),
  cabina: date("2026-07-22"),
  karen: date("2026-07-22"),
  contact: date("2026-07-23"),
  payments: date("2026-07-11"),
  privacy: date("2026-07-11")
} as const;

export const familyContentDates: Record<string, Date> = {
  "medicina-estetica-facial": date("2026-07-11"),
  "calidad-de-piel-y-soporte": date("2026-07-11"),
  "dermatologia-clinica": date("2026-07-23"),
  "dermatologia-procedimental": date("2026-07-11")
};

const priorityProcedureDates = new Set([
  "rinomodelacion",
  "toxina-botulinica",
  "acne",
  "melasma",
  "alopecia",
  "cicatrices-acne"
]);

export function procedureContentDate(slug: string) {
  return priorityProcedureDates.has(slug) ? date("2026-07-23") : date("2026-07-11");
}

