import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["por-que-vuelve-melasma"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "¿Por qué vuelve el melasma? Recurrencia y mantenimiento | HAUTLAB",
  description:
    "El melasma es crónico y puede recaer. Qué favorece la recurrencia, qué papel tienen la fotoprotección y el mantenimiento, y por qué láser o peelings no sustituyen un plan clínico.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: article.title,
    description: article.description,
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "es_MX",
    type: "article"
  }
};

const faq = [
  {
    question: "¿Por qué vuelve el melasma después de mejorar?",
    answer:
      "Porque el melasma se comporta como una dermatosis pigmentaria crónica y recidivante. La radiación ultravioleta y la luz visible, junto con predisposición individual y factores hormonales en algunas personas, pueden reactivar la pigmentación incluso después de una buena respuesta inicial."
  },
  {
    question: "¿El melasma se cura para siempre?",
    answer:
      "No es prudente plantearlo como una curación definitiva. El objetivo clínico suele ser controlar la pigmentación, reducir desencadenantes y mantener la mejoría con una estrategia sostenible que se ajuste a la evolución de cada paciente."
  },
  {
    question: "¿Un protector solar con color puede ser útil?",
    answer:
      "Puede ser especialmente útil cuando ofrece protección amplia y pigmentos capaces de atenuar parte de la luz visible. La formulación debe ser tolerable y adecuada al tono de piel para favorecer un uso constante."
  },
  {
    question: "¿El láser evita que el melasma regrese?",
    answer:
      "No. Los procedimientos pueden formar parte del tratamiento en casos seleccionados, pero no eliminan la tendencia a recaer. La selección de tecnología, parámetros y momento importa porque una intervención inadecuada también puede empeorar la pigmentación."
  },
  {
    question: "¿Qué significa tratamiento de mantenimiento?",
    answer:
      "Es la estrategia posterior a la fase de control inicial. Puede incluir fotoprotección rigurosa y tratamientos tópicos seleccionados según tolerancia, antecedentes y respuesta. No existe un esquema único apropiado para todas las personas."
  }
];

const references = [
  {
    label: "Ocampo-Candiani J, et al. Latin American consensus on the treatment of melasma. Int J Dermatol. 2025;64(3):499-512.",
    href: "https://pubmed.ncbi.nlm.nih.gov/39415312/"
  },
  {
    label: "Sarkar R, et al. Delphi consensus on melasma management by international experts and Pigmentary Disorders Society. J Eur Acad Dermatol Venereol. 2026;40(4):680-692.",
    href: "https://pubmed.ncbi.nlm.nih.gov/40996222/"
  },
  {
    label: "Passeron T, et al. Global consensus on the management of melanin hyperpigmentation disorders. J Eur Acad Dermatol Venereol. 2026;40(5):760-772.",
    href: "https://pubmed.ncbi.nlm.nih.gov/41362125/"
  },
  {
    label: "International modified Delphi consensus statement on visible light photoprotection. J Invest Dermatol. 2026.",
    href: "https://pubmed.ncbi.nlm.nih.gov/42101389/"
  },
  {
    label: "Castanedo-Cazares JP, et al. Near-visible light and UV photoprotection in the treatment of melasma: a randomized trial.",
    href: "https://pubmed.ncbi.nlm.nih.gov/24313385/"
  }
];

export default function MelasmaRecurrenceArticle() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        headline: article.title,
        description: article.description,
        inLanguage: "es-MX",
        dateCreated: article.preparedAt,
        dateModified: article.preparedAt,
        author: { "@id": `${siteConfig.url}#clinic` },
        reviewedBy: { "@id": `${siteConfig.url}#doctor` },
        publisher: { "@id": `${siteConfig.url}#clinic` },
        isPartOf: { "@id": `${siteConfig.url}#website` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Journal", item: `${siteConfig.url}/journal` },
          { "@type": "ListItem", position: 3, name: article.title, item: pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
      }
    ]
  };

  return (
    <main>
      <article>
        <section className="border-b border-line bg-aurora py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <Link href="/journal" className="text-sm text-muted transition hover:text-bone">HAUTLAB Journal / {article.category}</Link>
            <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">Artículo clínico · {article.readingTime}</p>
            <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">{article.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs leading-5 text-quiet">
              <span>Preparado: 25 de septiembre de 2026</span><span aria-hidden="true">·</span>
              <span>Pendiente de revisión médica final: Dr. Salvador Cordero</span>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-14 lg:py-20">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <Card className="p-7 sm:p-9">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Respuesta breve</p>
              <p className="mt-5 text-xl leading-9 text-bone">
                El melasma puede mejorar mucho y aun así reaparecer. No significa necesariamente que el tratamiento haya fallado: es una condición crónica y recidivante cuya actividad puede reactivarse con radiación ultravioleta, luz visible y otros desencadenantes. Por eso el mantenimiento y la fotoprotección forman parte del tratamiento, no son un complemento opcional.
              </p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Qué significa clínicamente</p>
              <h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">Controlar no es lo mismo que borrar una mancha.</h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted">
              <p>Los consensos latinoamericano e internacional describen al melasma como un trastorno adquirido de hiperpigmentación con tendencia a la recurrencia. La exposición solar, la predisposición genética y factores hormonales son parte del contexto; la importancia relativa cambia entre pacientes.</p>
              <p>Esto modifica la meta terapéutica. Una fase intensiva puede disminuir la pigmentación, pero el resultado necesita una estrategia posterior. El consenso latinoamericano recomienda continuar fotoprotección y tratamiento tópico de mantenimiento después de alcanzar remisión clínica para reducir recaídas.</p>
              <p>Antes de intensificar tratamiento conviene confirmar el diagnóstico y distinguir melasma de hiperpigmentación postinflamatoria, lentigos u otras causas de pigmentación facial. Puedes consultar el enfoque clínico de <Link href="/procedimientos/melasma" className="text-bone underline decoration-line underline-offset-4">melasma en HAUTLAB</Link>.</p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-soft/20 py-16 lg:py-24">
          <div className="mx-auto w-[min(1040px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Lo que más cambia el mantenimiento</p>
            <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">La fotoprotección debe cubrir más que UVB.</h2>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              <Card className="p-7"><h3 className="text-lg font-medium text-bone">UVB y UVA</h3><p className="mt-4 text-sm leading-7 text-muted">La protección de amplio espectro sigue siendo la base. El uso consistente importa más que perseguir una rutina compleja que no se mantiene.</p></Card>
              <Card className="p-7"><h3 className="text-lg font-medium text-bone">Luz visible</h3><p className="mt-4 text-sm leading-7 text-muted">La evidencia actual reconoce que la luz visible participa en la pigmentación y puede ser relevante en melasma. El consenso internacional de 2026 refuerza este punto.</p></Card>
              <Card className="p-7"><h3 className="text-lg font-medium text-bone">Protectores con pigmentos</h3><p className="mt-4 text-sm leading-7 text-muted">Los protectores con color que incorporan pigmentos como óxidos de hierro pueden ampliar la protección frente a luz visible. Un ensayo aleatorizado mostró mejor control del melasma al añadir esta protección a la cobertura UV.</p></Card>
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-2">
            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Evidencia más sólida</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">Mantenimiento, fotoprotección y reevaluación.</h2>
              <p className="mt-6 text-sm leading-7 text-muted">Existe acuerdo consistente en que el melasma requiere manejo longitudinal. La fotoprotección rigurosa, el control de desencadenantes y una estrategia de mantenimiento individualizada son pilares repetidos en consensos recientes.</p>
            </Card>
            <Card className="p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">Evidencia más variable</p>
              <h2 className="mt-4 font-serif text-3xl tracking-[-.04em] text-bone">Procedimientos y terapias emergentes.</h2>
              <p className="mt-6 text-sm leading-7 text-muted">Peelings, microneedling, láseres y otras tecnologías pueden tener un papel en pacientes seleccionados, pero productos, parámetros, fototipos y diseños de estudio son heterogéneos. No hay base para presentar una tecnología como solución definitiva o universal.</p>
            </Card>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(900px,calc(100%-32px))]">
            <ShieldCheck className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">Más tratamiento no siempre significa mejor control.</h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-muted">
              <p>Cuando la pigmentación reaparece, repetir automáticamente un peeling o una sesión de láser puede ser una mala simplificación. Primero conviene revisar exposición, adherencia, irritación, tratamientos utilizados y si el diagnóstico sigue siendo el correcto.</p>
              <p>La inflamación y la irritación pueden agravar la pigmentación en personas susceptibles. Cualquier tratamiento activo —tópico, sistémico o procedimental— debe elegirse según fototipo, tolerancia, antecedentes, embarazo cuando corresponda y perfil de riesgo.</p>
              <p>Las terapias sistémicas como el ácido tranexámico oral aparecen en algoritmos de consenso para pacientes seleccionados, pero requieren valoración médica individual de indicaciones y riesgos; este artículo no propone un esquema de prescripción.</p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24">
          <div className="mx-auto w-[min(900px,calc(100%-32px))]">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[.95] tracking-[-.05em] text-bone">Lo que conviene saber antes de perseguir otra sesión.</h2>
            <div className="mt-9 divide-y divide-line border-y border-line">
              {faq.map((item) => <details key={item.question} className="group py-5"><summary className="cursor-pointer list-none pr-6 text-base font-medium text-bone [&::-webkit-details-marker]:hidden">{item.question}</summary><p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{item.answer}</p></details>)}
            </div>
          </div>
        </section>

        <section className="border-b border-line py-16 lg:py-24">
          <div className="mx-auto w-[min(920px,calc(100%-32px))]">
            <BookOpen className="h-6 w-6 text-champagne" />
            <h2 className="mt-5 font-serif text-[clamp(2.4rem,5vw,4.1rem)] leading-[.96] tracking-[-.045em] text-bone">Fuentes y nivel de certeza.</h2>
            <p className="mt-6 text-base leading-8 text-muted">La base de esta pieza son consensos recientes y literatura revisada por pares. Los consensos combinan evidencia publicada con juicio experto; son útiles para ordenar la práctica, pero no equivalen por sí solos a ensayos clínicos comparativos. Cuando la evidencia de una intervención es heterogénea, se señala como tal.</p>
            <div className="mt-8 space-y-4">{references.map((reference) => <a key={reference.href} href={reference.href} target="_blank" rel="noreferrer" className="block rounded-2xl border border-line bg-white/[0.025] p-5 text-sm leading-7 text-bone transition hover:border-champagne/40">{reference.label}</a>)}</div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Revisión médica</p><p className="mt-5 text-lg font-medium text-bone">{siteConfig.legalDoctorName}</p><p className="mt-2 text-sm text-muted">{siteConfig.professionalTitle} · {siteConfig.practiceArea}</p><p className="mt-1 text-xs text-quiet">{siteConfig.professionalLicense}</p><p className="mt-5 text-xs text-quiet">Pendiente de aprobación médica final antes de publicación.</p></Card>
            <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Si el melasma reapareció</p><p className="mt-5 text-lg font-medium text-bone">Conviene reevaluar el patrón antes de añadir otro procedimiento.</p><p className="mt-3 text-sm leading-7 text-muted">La valoración puede revisar diagnóstico, desencadenantes, fotoprotección, irritación y tratamientos previos antes de decidir si hace falta ajustar mantenimiento o considerar otra intervención.</p><div className="mt-6 flex flex-wrap gap-3"><Button asChild><a href={buildWhatsAppLink("Hola, quiero agendar una valoración por melasma o pigmentación recurrente.")} target="_blank" rel="noreferrer" data-event="whatsapp_journal_melasma_recurrence">Agendar valoración <ArrowRight className="h-4 w-4" /></a></Button><Button asChild variant="outline"><Link href="/merida/dermatologia">Ver dermatología en Mérida</Link></Button></div></Card>
          </div>
        </section>
      </article>
      <script id="journal-melasma-recurrence-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
