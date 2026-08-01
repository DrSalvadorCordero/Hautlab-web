import { ArrowUpRight } from "lucide-react";
import { academicPublications } from "@/data/publications";

export function PublicationsSectionEn() {
  return (
    <section
      id="research"
      className="scroll-mt-28 border-b border-line bg-bone py-20 text-background lg:py-28"
    >
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-16">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-taupe">Published research</p>
          <h2 className="mt-4 max-w-xl font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[.93] tracking-[-.06em]">
            Academic work with verifiable sources.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-[#56493d]">
            Two hyperbaric-medicine papers published in 2017 and indexed in PubMed,
            listing Dr. Salvador Cordero Romero as a co-author during his medical training.
          </p>
        </div>

        <div className="border-t border-background/15">
          {academicPublications.map((publication, index) => (
            <article
              key={publication.id}
              className="grid gap-5 border-b border-background/15 py-8 sm:grid-cols-[4.5rem_1fr] sm:py-10"
            >
              <p className="font-serif text-4xl tracking-[-.05em] text-taupe">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#756354]">
                  {publication.journal} · {publication.year}
                </p>
                <h3 className="mt-4 text-[clamp(1.35rem,2.3vw,2rem)] font-medium leading-[1.18] tracking-[-.04em]">
                  {publication.title}
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#56493d]">
                  {publication.summaryEn}
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
          ))}
        </div>
      </div>
    </section>
  );
}
