import type { Metadata } from "next";
import { ArrowUpRight, BookOpenText, ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Button } from "@/components/ui/button";
import { academicPublications } from "@/data/publications";
import { siteConfig } from "@/lib/siteConfig";

const pageUrl = `${siteConfig.url}/publicaciones`;

export const metadata: Metadata = {
  title: "Publicaciones científicas | Dr. Salvador Cordero · HAUTLAB",
  description:
    "Publicaciones de Salvador Cordero-Romero indexadas en PubMed sobre enfermedad por descompresión en pescadores-buzos de Yucatán.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Publicaciones científicas | Dr. Salvador Cordero · HAUTLAB",
    description:
      "Dos publicaciones en Undersea and Hyperbaric Medicine, con enlaces verificables en PubMed, ResearchGate y DOI.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "website"
  }
};

function AuthorList({ authors }: { authors: string[] }) {
  return (
    <p className="mt-5 text-sm leading-7 text-muted">
      {authors.map((author, index) => (
        <span key={author}>
          {author === "Salvador Cordero-Romero" ? (
            <strong className="font-medium text-bone">{author}</strong>
          ) : (
            author
          )}
          {index < authors.length - 1 ? ", " : "."}
        </span>
      ))}
    </p>
  );
}

export default function PublicacionesPage() {
  const scholarlyArticleSchema = {
    "@context": "https://schema.org",
    "@graph": academicPublications.map((publication) => ({
      "@type": "ScholarlyArticle",
      "@id": `${pageUrl}#${publication.id}`,
      headline: publication.title,
      name: publication.title,
      datePublished: String(publication.year),
      pagination: publication.pages,
      isPartOf: {
        "@type": "PublicationIssue",
        issueNumber: publication.issue,
        isPartOf: {
          "@type": "PublicationVolume",
          volumeNumber: publication.volume,
          isPartOf: {
            "@type": "Periodical",
            name: publication.journal
          }
        }
      },
      author: publication.authors.map((name) => ({
        "@type": "Person",
        name
      })),
      identifier: [
        { "@type": "PropertyValue", propertyID: "PMID", value: publication.pmid },
        { "@type": "PropertyValue", propertyID: "DOI", value: publication.doi }
      ],
      sameAs: [
        publication.pubmedUrl,
        publication.researchGateUrl,
        `https://doi.org/${publication.doi}`
      ],
      inLanguage: "en"
    }))
  };

  return (
    <main>
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Publicaciones" }]} />

      <section className="border-b border-line bg-aurora py-16 lg:py-24">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <p className="text-xs uppercase tracking-[0.24em] text-champagne">
            Trayectoria académica
          </p>
          <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3rem,7vw,6.2rem)] leading-[.9] tracking-[-.065em] text-bone">
            Publicaciones científicas y colaboración académica.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
            Participación como coautor en dos investigaciones sobre enfermedad por
            descompresión en pescadores-buzos de Yucatán, publicadas en{" "}
            <em>Undersea and Hyperbaric Medicine</em> e indexadas en PubMed.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["02", "publicaciones indexadas"],
              ["2017", "año de publicación"],
              ["PubMed", "fuente bibliográfica"]
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-line bg-white/[0.03] p-5"
              >
                <p className="font-serif text-3xl tracking-[-.045em] text-bone">{value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-quiet">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="border-t border-line">
            {academicPublications.map((publication, index) => (
              <article
                key={publication.id}
                id={publication.id}
                className="scroll-mt-32 grid gap-8 border-b border-line py-12 lg:grid-cols-[.34fr_1.66fr] lg:py-16"
              >
                <div>
                  <p className="font-serif text-5xl tracking-[-.055em] text-champagne">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-quiet">
                    {publication.kind}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-champagne">
                    {publication.journal} · {publication.year} · {publication.volumeIssue}
                  </p>
                  <h2 className="mt-5 max-w-4xl font-serif text-[clamp(2.1rem,4vw,4rem)] leading-[.98] tracking-[-.055em] text-bone">
                    {publication.title}
                  </h2>
                  <AuthorList authors={publication.authors} />
                  <p className="mt-6 max-w-3xl text-base leading-8 text-muted">
                    {publication.summaryEs}
                  </p>

                  <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-2xl border border-line bg-white/[0.025] p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-quiet">PMID</p>
                      <p className="mt-2 text-bone">{publication.pmid}</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/[0.025] p-4 sm:col-span-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-quiet">DOI</p>
                      <p className="mt-2 break-all text-bone">{publication.doi}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild>
                      <a href={publication.pubmedUrl} target="_blank" rel="noreferrer">
                        Ver en PubMed <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href={publication.researchGateUrl} target="_blank" rel="noreferrer">
                        ResearchGate <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="ghost">
                      <a
                        href={`https://doi.org/${publication.doi}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir DOI <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button asChild variant="ghost">
                      <a href={publication.journalUrl} target="_blank" rel="noreferrer">
                        Revista <BookOpenText className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <p className="mt-8 max-w-4xl border-l border-champagne/45 pl-5 text-xs leading-6 text-quiet">
                    Referencia: {publication.citation} DOI: {publication.doi}. PMID:{" "}
                    {publication.pmid}.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bone py-16 text-background">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-6 lg:grid-cols-[.65fr_1.35fr] lg:items-start">
          <p className="text-xs uppercase tracking-[0.22em] text-taupe">
            Alcance profesional
          </p>
          <div>
            <h2 className="font-serif text-[clamp(2.3rem,4vw,4rem)] leading-[.96] tracking-[-.055em]">
              Investigación documentada, presentada con precisión.
            </h2>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-[#56493d]">
              Estas publicaciones corresponden a trabajo académico realizado durante la
              formación médica. Se presentan como antecedente de investigación y no como una
              especialidad clínica adicional ni como sustituto de las credenciales profesionales
              vigentes mostradas en este sitio.
            </p>
          </div>
        </div>
      </section>

      <script
        id="hautlab-publications-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scholarlyArticleSchema) }}
      />
    </main>
  );
}
