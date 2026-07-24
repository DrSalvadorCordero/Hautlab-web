"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AIReceptionAssistant } from "@/components/assistant/ai-reception-assistant";
import { ConsentManager } from "@/components/privacy/consent-manager";
import { ConsentManagerEn } from "@/components/privacy/consent-manager-en";
import { Footer } from "@/components/site/footer";
import { FooterEn } from "@/components/site/footer-en";
import { Header } from "@/components/site/header";
import { HeaderEn } from "@/components/site/header-en";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInternalArea = pathname?.startsWith("/admin");
  const isEnglish = pathname === "/en" || pathname?.startsWith("/en/");
  const documentLanguage = isEnglish ? "en" : "es-MX";

  useEffect(() => {
    document.documentElement.lang = documentLanguage;
  }, [documentLanguage]);

  if (isInternalArea) return <>{children}</>;

  const skipLink = (
    <a
      href="#contenido-principal"
      className="fixed left-4 top-4 z-[120] -translate-y-24 rounded-full bg-bone px-5 py-3 text-sm font-medium text-background shadow-calm transition focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-champagne"
    >
      {isEnglish ? "Skip to content" : "Saltar al contenido"}
    </a>
  );

  if (isEnglish) {
    return (
      <>
        {skipLink}
        <HeaderEn />
        <div id="contenido-principal" lang="en" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <FooterEn />
        <ConsentManagerEn />
      </>
    );
  }

  return (
    <>
      {skipLink}
      <Header />
      <div id="contenido-principal" lang="es-MX" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <Footer />
      <AIReceptionAssistant />
      <ConsentManager />
    </>
  );
}
