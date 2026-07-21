"use client";

import { usePathname } from "next/navigation";
import { AIReceptionAssistant } from "@/components/assistant/ai-reception-assistant";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInternalArea = pathname?.startsWith("/admin");

  if (isInternalArea) return <>{children}</>;

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
