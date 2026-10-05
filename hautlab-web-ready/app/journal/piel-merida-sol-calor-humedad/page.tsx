import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["piel-merida-sol-calor-humedad"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "Piel en Mérida: sol, calor y humedad | HAUTLAB Journal",
  description: "Cómo pueden influir radiación, calor y humedad en la piel en Mérida sin convertir el clima en diagnóstico. Fotoprotección, barrera y señales para consultar.",
  alternates: { canonical: pageUrl },
  openGraph: { title: article.title, description: article.description, url: pageUrl, siteName: "HAUTLAB", locale: "es_MX", type: "article" }
};

const faq = [
  { question: "¿El calor de Mérida causa rosácea?", answer: "No por sí solo. El calor puede actuar como desencadenante de flushing o empeorar síntomas en algunas personas con rosácea, pero la enfermedad no se diagnostica por vivir en un clima cálido." },
  { question: "¿La humedad causa acné?", answer: "No existe una relación simple de causa y efecto. Sudor, oclusión, fricción y productos utilizados en ambientes cálidos pueden modificar brotes en algunas personas, pero el acné es multifactorial." },
  { question: "¿Por qué el melasma puede empeorar con exposición solar?", answer: "La radiación ultravioleta y la luz visible participan en la pigmentación. En melasma, la fotoprotección constante forma parte del control y del mantenimiento." },
  { question: "¿Necesito una rutina distinta por vivir en Mérida?", answer: "La rutina debe adaptarse más a tu piel y diagnóstico que al código postal. En clima cálido y húmedo suele ser útil priorizar fórmulas tolerables, fotoprotección que realmente se pueda reaplicar y evitar sobretratar la piel." }
];

const references = [
  { label: "Passeron T, et al. Global consensus on the management of melanin hyperpigmentation disorders. JEADV. 2026. PMID 41362125.", href: "https://pubmed.ncbi.nlm.nih.gov/41362125/" },
  { label: "International modified Delphi consensus statement on visible light photoprotection. J Invest Dermatol. 2026. PMID 42101389.", href: "https://pubmed.ncbi.nlm.nih.gov/42101389/" },
  { label: "Ocampo-Candiani J, et al. Latin American consensus on the treatment of melasma. Int J Dermatol. 2025. PMID 39415312.", href: "https://pubmed.ncbi.nlm.nih.gov/39415312/" },
  { label: "Schaller M, et al. Recommendations for rosacea diagnosis, classification and management: ROSCO 2019 update. Br J Dermatol. 2020. PMID 31392722.", href: "https://pubmed.ncbi.nlm.nih.gov/31392722/" }
];

export default function MeridaSkinClimateArticle() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "@id": `${pageUrl}#article`, url: pageUrl, headline: article.title, description: article.description, inLanguage: "es-MX", dateCreated: article.preparedAt, dateModified: article.preparedAt, author: { "@id": `${siteConfig.url}#clinic` }, reviewedBy: { "@id": `${siteConfig.url}#doctor` }, publisher: { "@id": `${siteConfig.url}#clinic` }, isPartOf: { "@id": `${siteConfig.url}#website` }, breadcrumb: { "@id": `${pageUrl}#breadcrumb` } },
      { "@type": "BreadcrumbList", "@id": `${pageUrl}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Journal", item: `${siteConfig.url}/journal` },
        { "@type": "ListItem", position: 3, name: article.title, item: pageUrl }
      ]},
      { "@type": "FAQPage", "@id": `${pageUrl}#faq`, mainEntity: faq.map((x) => ({ "@type": "Question", name: x.question, acceptedAnswer: { "@type": "Answer", text: x.answer } })) }
    ]
  };

  return <main><article>
    <section className="border-b border-line bg-aurora py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))]">
      <Link href="/journal" className="text-sm text-muted transition hover:text-bone">HAUTLAB Journal / Guía local</Link>
      <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">Mérida · Dermatología · {article.readingTime}</p>
      <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">{article.title}</h1>
      <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
      <p className="mt-8 text-xs leading-6 text-quiet">Preparado: 5 de octubre de 2026 · Pendiente de revisión médica final por Dr. Salvador Cordero</p>
    </div></section>

    <section className="border-b border-line py-14 lg:py-20"><div className="mx-auto w-[min(920px,calc(100%-32px))]"><Card className="p-7 sm:p-9">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Respuesta breve</p>
      <p className="mt-5 text-xl leading-9 text-bone">Vivir en Mérida sí cambia la exposición cotidiana de la piel: radiación solar, calor, sudor y humedad pueden modificar síntomas, tolerancia a productos y facilidad para mantener la fotoprotección. Pero el clima no sustituye un diagnóstico. Rosácea, melasma, acné o dermatitis siguen necesitando una lectura clínica propia.</p>
    </Card></div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
      <div><Sun className="h-6 w-6 text-champagne"/><h2 className="mt-5 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">El entorno puede modificar la piel. No explica todo lo que ocurre en ella.</h2></div>
      <div className="space-y-5 text-base leading-8 text-muted">
        <p>La radiación ultravioleta es un factor ambiental bien establecido en fotoenvejecimiento y pigmentación. En melasma, además, la evidencia reciente reconoce la relevancia de la luz visible y refuerza una fotoprotección que vaya más allá de pensar únicamente en UVB.</p>
        <p>El calor puede favorecer vasodilatación y flushing en personas susceptibles. En rosácea, identificar desencadenantes individuales forma parte del manejo, pero atribuir cualquier enrojecimiento facial al clima puede retrasar otros diagnósticos.</p>
        <p>Sudor, fricción, oclusión y cosméticos pesados pueden cambiar cómo se comporta una piel acneica o sensible. Eso no significa que la humedad “cause” acné. La utilidad clínica está en detectar qué cambia en una persona concreta.</p>
      </div>
    </div></section>

    <section className="border-b border-line bg-soft/20 py-16 lg:py-24"><div className="mx-auto w-[min(1040px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Tres problemas frecuentes</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Card className="p-7"><h3 className="text-xl font-medium text-bone">Pigmentación</h3><p className="mt-4 text-sm leading-7 text-muted">En melasma, la exposición lumínica y la recurrencia están conectadas. La fotoprotección constante y tolerable es parte del tratamiento longitudinal.</p><Link href="/procedimientos/melasma" className="mt-5 inline-block text-sm text-bone underline decoration-line underline-offset-4">Ver melasma</Link></Card>
        <Card className="p-7"><h3 className="text-xl font-medium text-bone">Enrojecimiento</h3><p className="mt-4 text-sm leading-7 text-muted">Calor y cambios térmicos pueden disparar flushing en rosácea. Si el eritema es persistente, hay ardor, lesiones inflamatorias u ojos irritados, conviene valorar el cuadro completo.</p><Link href="/procedimientos/rosacea" className="mt-5 inline-block text-sm text-bone underline decoration-line underline-offset-4">Ver rosácea</Link></Card>
        <Card className="p-7"><h3 className="text-xl font-medium text-bone">Brotes y oclusión</h3><p className="mt-4 text-sm leading-7 text-muted">Una rutina demasiado pesada para el contexto de calor, sudor y actividad puede ser incómoda. Simplificar vehículos no significa abandonar tratamientos indicados.</p><Link href="/procedimientos/acne" className="mt-5 inline-block text-sm text-bone underline decoration-line underline-offset-4">Ver acné</Link></Card>
      </div>
    </div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Qué sí tiene sentido adaptar</p>
      <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">La mejor rutina local es la que sigue funcionando cuando sales a la calle.</h2>
      <div className="mt-8 space-y-5 text-base leading-8 text-muted">
        <p>Un protector excelente en papel pero imposible de tolerar o reaplicar con calor tiene poca utilidad práctica. Textura, acabado, pigmento cuando está indicado y compatibilidad con la actividad diaria importan para la adherencia.</p>
        <p>Lo mismo ocurre con hidratantes y activos. Una barrera alterada no mejora acumulando ácidos, exfoliantes y retinoides sin una razón clara. La intensidad de una rutina debe responder al diagnóstico y a la tolerancia, no a la idea de que sentir ardor demuestra eficacia.</p>
        <p>Si el objetivo es resolver un problema específico, la guía de <Link href="/merida/dermatologia" className="text-bone underline decoration-line underline-offset-4">dermatología en Mérida</Link> explica cuándo una valoración médica puede ser más útil que seguir cambiando productos.</p>
      </div>
    </div></section>

    <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24"><div className="mx-auto w-[min(900px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p>
      <div className="mt-8 divide-y divide-line border-y border-line">{faq.map((x)=><details key={x.question} className="py-5"><summary className="cursor-pointer list-none text-base font-medium text-bone [&::-webkit-details-marker]:hidden">{x.question}</summary><p className="mt-4 text-sm leading-7 text-muted">{x.answer}</p></details>)}</div>
    </div></section>

    <section className="border-b border-line py-16 lg:py-20"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <Card className="p-7"><BookOpen className="h-5 w-5 text-champagne"/><p className="mt-5 text-xs uppercase tracking-[0.2em] text-champagne">Fuentes</p><ul className="mt-5 space-y-4 text-sm leading-7 text-muted">{references.map((r)=><li key={r.href}><a href={r.href} target="_blank" rel="noreferrer" className="transition hover:text-bone">{r.label}</a></li>)}</ul></Card>
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Control editorial</p><p className="mt-5 text-lg font-medium text-bone">Pendiente de revisión médica final</p><p className="mt-3 text-sm leading-7 text-muted">Requiere revisión del Dr. Salvador Cordero antes de publicación, especialmente en el encuadre de clima como modificador —no causa única— de rosácea, acné y pigmentación.</p><p className="mt-5 text-xs leading-6 text-quiet">Contenido educativo. No sustituye una valoración médica.</p></Card>
    </div></section>

    <section className="py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Dermatología en Mérida</p><h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] tracking-[-.05em] text-bone">No necesitas adivinar si es “por el clima”.</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">Una valoración puede separar desencadenantes ambientales de una dermatosis que necesita tratamiento específico.</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><Button asChild><a href={buildWhatsAppLink("Hola, quiero agendar una valoración dermatológica en Mérida.")} target="_blank" rel="noreferrer">Agendar valoración <ArrowRight className="h-4 w-4"/></a></Button><Button asChild variant="outline"><Link href="/merida/dermatologia">Dermatología en Mérida</Link></Button></div>
    </div></section>
  </article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/></main>;
}
