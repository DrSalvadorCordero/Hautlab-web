import type { TreatmentPageContent } from "@/components/treatments/treatment-page-layout";

const familyPaths = new Set([
  "/tratamientos/medicina-estetica-facial",
  "/tratamientos/calidad-de-piel-y-soporte",
  "/tratamientos/dermatologia-clinica",
  "/tratamientos/dermatologia-procedimental"
]);

const fixedRelatedPaths = new Set(["/procedimientos", ...familyPaths]);
const slugPattern = /^[a-z0-9-]+$/;
const medicallyExpanded = new Set([
  "rinomodelacion",
  "toxina-botulinica",
  "acne",
  "melasma",
  "alopecia",
  "cicatrices-acne"
]);

export function validateTreatmentCatalog(catalog: Record<string, TreatmentPageContent>) {
  const errors: string[] = [];
  const slugs = new Set(Object.keys(catalog));
  const titles = new Map<string, string>();

  for (const [slug, treatment] of Object.entries(catalog)) {
    if (!slugPattern.test(slug)) errors.push(`${slug}: slug inválido.`);
    if (!treatment.title.trim()) errors.push(`${slug}: título vacío.`);
    if (!treatment.summary.trim()) errors.push(`${slug}: resumen vacío.`);
    if (!treatment.image.startsWith("/")) errors.push(`${slug}: la imagen debe usar una ruta interna absoluta.`);
    if (!familyPaths.has(treatment.category.href)) errors.push(`${slug}: categoría con ruta no reconocida (${treatment.category.href}).`);
    if (treatment.faq.length < 2) errors.push(`${slug}: se requieren al menos dos preguntas frecuentes.`);
    if (treatment.related.length < 2 || treatment.related.length > 6) {
      errors.push(`${slug}: se requieren entre dos y seis enlaces relacionados.`);
    }

    if (medicallyExpanded.has(slug)) {
      if (!treatment.clinicalDetails) errors.push(`${slug}: falta profundidad clínica.`);
      if (!treatment.medicalReview) errors.push(`${slug}: falta revisión médica y fuentes.`);
      if ((treatment.clinicalDetails?.evaluation.length ?? 0) < 3) {
        errors.push(`${slug}: la valoración previa está incompleta.`);
      }
      if ((treatment.medicalReview?.sources.length ?? 0) < 2) {
        errors.push(`${slug}: se requieren al menos dos fuentes.`);
      }

      for (const source of treatment.medicalReview?.sources ?? []) {
        if (!source.href.startsWith("https://")) {
          errors.push(`${slug}: la fuente debe usar HTTPS (${source.href}).`);
        }
      }
    }

    const priorSlug = titles.get(treatment.title);
    if (priorSlug) errors.push(`${slug}: título duplicado con ${priorSlug} (${treatment.title}).`);
    titles.set(treatment.title, slug);

    const hasHomeBreadcrumb = treatment.breadcrumbs.some((item) => item.href === "/");
    const hasLibraryBreadcrumb = treatment.breadcrumbs.some((item) => item.href === "/procedimientos");
    if (!hasHomeBreadcrumb || !hasLibraryBreadcrumb) errors.push(`${slug}: breadcrumbs incompletos.`);

    for (const related of treatment.related) {
      if (related.href.startsWith("/procedimientos/")) {
        const relatedSlug = related.href.slice("/procedimientos/".length);
        if (!slugs.has(relatedSlug)) errors.push(`${slug}: relacionado inexistente (${related.href}).`);
      } else if (!fixedRelatedPaths.has(related.href)) {
        errors.push(`${slug}: ruta relacionada no permitida (${related.href}).`);
      }
    }
  }

  if (errors.length) {
    throw new Error(`HAUTLAB treatment catalog validation failed:\n- ${errors.join("\n- ")}`);
  }

  return catalog;
}
