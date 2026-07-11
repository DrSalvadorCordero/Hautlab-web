import { extraTreatmentsV2 } from "@/data/treatments-v2-extra";
import { treatmentsV2 } from "@/data/treatments-v2";
import { validateTreatmentCatalog } from "@/lib/content/validate-treatment-catalog";

export const treatmentCatalog = validateTreatmentCatalog({
  ...treatmentsV2,
  ...extraTreatmentsV2
});
