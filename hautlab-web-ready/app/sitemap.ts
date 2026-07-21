import type { MetadataRoute } from "next";
import { treatmentFamilies } from "@/data/site";
import { extraTreatmentsV2 } from "@/data/treatments-v2-extra";
import { treatmentsV2 } from "@/data/treatments-v2";
import { siteConfig } from "@/lib/siteConfig";

const allTreatments = { ...treatmentsV2, ...extraTreatmentsV2 };

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/en`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/procedimientos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/cabina`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/cabina/karen-cruz`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/pagos`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/aviso-de-privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 }
  ];

  const familyRoutes: MetadataRoute.Sitemap = treatmentFamilies.map((family) => ({
    url: `${siteConfig.url}/tratamientos/${family.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75
  }));

  const procedureRoutes: MetadataRoute.Sitemap = Object.keys(allTreatments).map((slug) => ({
    url: `${siteConfig.url}/procedimientos/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85
  }));

  return [...coreRoutes, ...familyRoutes, ...procedureRoutes];
}
