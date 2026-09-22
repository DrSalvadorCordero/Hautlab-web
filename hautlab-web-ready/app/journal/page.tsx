import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { journalArticles } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";

const pageUrl = `${siteConfig.url}/journal`;

export const metadata: Metadata = {
  title: "HAUTLAB Journal | Dermatología y medicina estética",
  description:
    "Artículos médicos de HAUTLAB sobre dermatología clínica, medicina estética, inyectables, piel y tecnologías, con enfoque basado en evidencia y revisión médica.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "HAUTLAB Journal | Dermatología y medicina estética",
    description:
      "Criterio clínico, evidencia y decisiones explicadas sin lenguaje promocional.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  }
};

export default function JournalPage() {
  return (
    <main>
      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto w-[min(980px,calc(100%-32px))]">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne">HAUTLAB Journal</p>
          <h1 className="mt-5 max-w-4xl font-serif text-[clamp(3.2rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">
            Medicina estética y dermatología, explicadas con criterio.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
            Contenido educativo para entender qué puede aportar un tratamiento, qué no puede resolver, qué riesgos importa discutir y cuándo una valoración cambia la decisión.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto w-[min(980px,calc(100%-32px))]">
          <div className="grid gap-5">
            {journalArticles.map((article) => (
              <Link key={article.slug} href={`/journal/${article.slug}`} className="group">
                <Card className="p-7 transition group-hover:-translate-y-1 group-hover:border-champagne/40 sm:p-9">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-[0.16em] text-champagne">
                    <span>{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingTime}</span>
                  </div>
                  <h2 className="mt-5 max-w-4xl font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[.98] tracking-[-.045em] text-bone">
                    {article.title}
                  </h2>
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">{article.description}</p>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm text-bone">
                    Leer artículo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex items-start gap-4 rounded-[1.75rem] border border-line bg-white/[0.025] p-6">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-champagne" />
            <p className="text-sm leading-7 text-muted">
              El Journal contiene educación médica para público general. Para producción científica y trabajos académicos del Dr. Salvador Cordero, consulta{" "}
              <Link href="/publicaciones" className="text-bone underline decoration-line underline-offset-4">
                Publicaciones
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
