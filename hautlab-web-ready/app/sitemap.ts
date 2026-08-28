import type { MetadataRoute } from "next";
import {
  coreContentDates,
  familyContentDates,
  procedureContentDate
} from "@/data/content-dates";
import { treatmentFamilies } from "@/data/site";
import { extraTreatmentsV2 } from "@/data/treatments-v2-extra";
import { treatmentsV2 } from "@/data/treatments-v2";
import { siteConfig } from "@/lib/siteConfig";

const allTreatments = { ...treatmentsV2, ...extraTreatmentsV2 };

export default function sitemap(): MetadataRoute.Sitemap {
  const coreRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: coreContentDates.home, changeFrequency: "weekly", priority: 1 },
    { url: siteConfig.doctorProfileUrl, lastModified: "2026-08-28", changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/en`, lastModified: coreContentDates.english, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/merida`, lastModified: coreContentDates.merida, changeFrequency: "monthly", priority: 0.95 },
    { url: `${siteConfig.url}/merida/dermatologia`, lastModified: coreContentDates.meridaDermatology, changeFrequency: "monthly", priority: 0.95 },
    { url: `${siteConfig.url}/merida/medicina-estetica`, lastModified: coreContentDates.meridaMedicalAesthetics, changeFrequency: "monthly", priority: 0.95 },
    { url: `${siteConfig.url}/merida/rellenos-faciales`, lastModified: coreContentDates.meridaFacialFillers, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/procedimientos`, lastModified: coreContentDates.procedures, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/cabina`, lastModified: coreContentDates.cabina, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/cabina/karen-cruz`, lastModified: coreContentDates.karen, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/contacto`, lastModified: coreContentDates.contact, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/publicaciones`, lastModified: coreContentDates.publications, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteConfig.url}/pagos`, lastModified: coreContentDates.payments, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/aviso-de-privacidad`, lastModified: coreContentDates.privacy, changeFrequency: "yearly", priority: 0.3 }
  ];

  const migratedFamilySlugs = new Set(["dermatologia-clinica", "medicina-estetica-facial"]);
  const familyRoutes: MetadataRoute.Sitemap = treatmentFamilies
    .filter((family) => !migratedFamilySlugs.has(family.slug))
    .map((family) => ({
      url: `${siteConfig.url}/tratamientos/${family.slug}`,
      lastModified: familyContentDates[family.slug],
      changeFrequency: "monthly",
      priority: 0.75
    }));

  const procedureRoutes: MetadataRoute.Sitemap = Object.keys(allTreatments).map((slug) => ({
    url: `${siteConfig.url}/procedimientos/${slug}`,
    lastModified: procedureContentDate(slug),
    changeFrequency: "monthly",
    priority: 0.85
  }));

  return [...coreRoutes, ...familyRoutes, ...procedureRoutes];
}
