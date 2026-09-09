import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  const privateRoutes = ["/api/", "/admin/"];

  return {
    rules: [
      {
        userAgent: ["OAI-SearchBot", "OAI-AdsBot"],
        allow: "/",
        disallow: privateRoutes
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes
      }
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url
  };
}
