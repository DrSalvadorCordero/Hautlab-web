import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { academicPublications } from "@/data/publications";

export function PublicationsSection() {
  return (
    <section
      id="publicaciones"
      className="scroll-mt-28 border-b border-line bg-bone py-20 text-background lg:py-28"
    >
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-16">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.24em] text-taupe">
              Trayectoria académica
            </p>
            <h2 className="mt-4 max-w-xl font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[.93] tracking-[-.06em]">
              Investigación publicada. Fuentes verificables.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#56493d]">
              Dos trabajos en medicina hiperbárica publicados en 2017 e indexados en PubMed,
              con participación del Dr. Salvador Cordero Romero como coautor durante su
              formación médica.
            </p>
            <Link
              href="/publicaciones"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium transition hover:text-taupe focus:outline-none focus:ring-2 focus:ring-taupe"
            >
              Ver referencias completas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="border-t border-background/15">
          {academicPublications.map((publication, index) => (
            <Reveal key={publication.id} delay={index * 0.06}>
              <article className="grid gap-5 border-b border-background/15 py-8 sm:grid-cols-[4.5rem_1fr] sm:py-10">
                <p className="font-serif text-4xl tracking-[-.05em] text-taupe">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-[0.16em] text-[#756354]">
                    <span>{publication.kind}</span>
                    <span aria-hidden="true">·</span>
                    <span>{publication.journal}</span>
                    <span aria-hidden="true">·</span>
                    <span>{publication.year}</span>
                  </div>
                  <h3 className="mt-4 text-[clamp(1.35rem,2.3vw,2rem)] font-medium leading-[1.18] tracking-[-.04em]">
                    {publication.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#56493d]">
                    {publication.summaryEs}
                  </p>
                  <p className="mt-5 text-xs uppercase tracking-[0.14em] text-[#756354]">
                    PMID {publication.pmid} · DOI {publication.doi}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                    <a
                      href={publication.pubmedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium underline decoration-background/20 underline-offset-4 transition hover:decoration-background"
                    >
                      PubMed <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <a
                      href={publication.researchGateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium underline decoration-background/20 underline-offset-4 transition hover:decoration-background"
                    >
                      ResearchGate <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
