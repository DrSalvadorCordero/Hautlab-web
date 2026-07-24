import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { AttributionCapture } from "@/components/analytics/attribution-capture";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SiteShell } from "@/components/site/site-shell";
import { siteConfig } from "@/lib/siteConfig";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description
  },
  robots: { index: true, follow: true }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: ["es-MX", "en"],
      publisher: { "@id": `${siteConfig.url}#clinic` }
    },
    {
      "@type": "MedicalClinic",
      "@id": `${siteConfig.url}#clinic`,
      name: "HAUTLAB",
      alternateName: "HAUTLAB + Dr. Salvador Cordero",
      url: siteConfig.url,
      telephone: siteConfig.whatsappDisplay,
      priceRange: "$$$",
      slogan: siteConfig.tagline,
      description: siteConfig.description,
      availableLanguage: ["Spanish", "English appointment coordination"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Calle 43 número 299A x 32A, San Ramón Norte",
        addressLocality: "Mérida",
        addressRegion: "Yucatán",
        postalCode: "97117",
        addressCountry: "MX"
      },
      areaServed: { "@type": "City", name: "Mérida, Yucatán" },
      founder: { "@id": `${siteConfig.url}#doctor` },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Áreas de atención HAUTLAB",
        itemListElement: [
          { "@type": "OfferCatalog", name: "Diseño facial" },
          { "@type": "OfferCatalog", name: "Piel y textura" },
          { "@type": "OfferCatalog", name: "Condiciones de piel" },
          { "@type": "OfferCatalog", name: "Procedimientos focales" }
        ]
      },
      sameAs: [siteConfig.instagram]
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}#doctor`,
      name: siteConfig.legalDoctorName,
      jobTitle: siteConfig.professionalTitle,
      knowsAbout: siteConfig.practiceArea,
      identifier: siteConfig.professionalLicense,
      worksFor: { "@id": `${siteConfig.url}#clinic` }
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <AuthProvider>
          <AttributionCapture />
          <SiteShell>{children}</SiteShell>
          <Script id="hautlab-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </AuthProvider>
      </body>
    </html>
  );
}
