"use client";

import { usePathname } from "next/navigation";
import { AIReceptionAssistant } from "@/components/assistant/ai-reception-assistant";
import { Footer } from "@/components/site/footer";
import { FooterEn } from "@/components/site/footer-en";
import { Header } from "@/components/site/header";
import { HeaderEn } from "@/components/site/header-en";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInternalArea = pathname?.startsWith("/admin");
  const isEnglish = pathname === "/en" || pathname?.startsWith("/en/");

  if (isInternalArea) return <>{children}</>;

  if (isEnglish) {
    return (
      <>
        <HeaderEn />
        <div id="contenido-principal" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <FooterEn />
      </>
    );
  }

  return (
    <>
      <Header />
      <div id="contenido-principal" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <Footer />
      <AIReceptionAssistant />
    </>
  );
}
