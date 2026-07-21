import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ConsentManager } from "@/components/privacy/consent-manager";
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
  alternates: { canonical: siteConfig.url },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: "HAUTLAB",
    alternateName: "HAUTLAB + Dr. Salvador Cordero",
    url: siteConfig.url,
    telephone: siteConfig.whatsappDisplay,
    priceRange: "$$$",
    slogan: siteConfig.tagline,
    description: siteConfig.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle 43 número 299A x 32A, San Ramón Norte",
      addressLocality: "Mérida",
      addressRegion: "Yucatán",
      postalCode: "97117",
      addressCountry: "MX"
    },
    areaServed: {
      "@type": "City",
      name: "Mérida, Yucatán"
    },
    founder: {
      "@type": "Person",
      name: siteConfig.legalDoctorName,
      jobTitle: "Médico Cirujano"
    },
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
  };

  return (
    <html lang="es-MX" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <AuthProvider>
          <a
            href="#contenido-principal"
            className="fixed left-4 top-4 z-[120] -translate-y-24 rounded-full bg-bone px-5 py-3 text-sm font-medium text-background shadow-calm transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-champagne"
          >
            Saltar al contenido
          </a>
          <SiteShell>{children}</SiteShell>
          <ConsentManager />
          <Script id="hautlab-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        </AuthProvider>
      </body>
    </html>
  );
}
