import type { MetadataRoute } from "next";
import { treatmentFamilies } from "@/data/site";
import { treatmentsV2 } from "@/data/treatments-v2";
import { siteConfig } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/procedimientos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/pagos`, lastModified: now, changeFrequency: "monthly", priority: 0.5 }
  ];

  const familyRoutes: MetadataRoute.Sitemap = treatmentFamilies.map((family) => ({
    url: `${siteConfig.url}/tratamientos/${family.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75
  }));

  const procedureRoutes: MetadataRoute.Sitemap = Object.keys(treatmentsV2).map((slug) => ({
    url: `${siteConfig.url}/procedimientos/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85
  }));

  return [...coreRoutes, ...familyRoutes, ...procedureRoutes];
}
