import { AIReceptionLauncher } from "@/components/assistant/ai-reception-launcher";
import { Footer } from "@/components/site/footer";
import { FooterEn } from "@/components/site/footer-en";
import { Header } from "@/components/site/header";
import { HeaderEn } from "@/components/site/header-en";

export function SiteShell({ children, isEnglish }: { children: React.ReactNode; isEnglish: boolean }) {
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
      <AIReceptionLauncher />
    </>
  );
}
