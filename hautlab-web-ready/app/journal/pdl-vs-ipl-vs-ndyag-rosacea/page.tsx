import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["pdl-vs-ipl-vs-ndyag-rosacea"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "PDL vs IPL vs Nd:YAG 1064 en rosácea | HAUTLAB Journal",
  description: "Comparativa clínica de PDL 595 nm, IPL y Nd:YAG 1064 nm para eritema y telangiectasias en rosácea: evidencia, profundidad, límites y selección.",
  alternates: { canonical: pageUrl },
  openGraph: { title: article.title, description: article.description, url: pageUrl, siteName: "HAUTLAB", locale: "es_MX", type: "article" }
};

const comparison = [
  { modality: "PDL 595 nm", role: "Referencia vascular con la evidencia histórica más robusta para eritema y telangiectasias.", nuance: "Puede producir eritema, edema o púrpura según parámetros. La evidencia no demuestra superioridad universal frente a todas las alternativas." },
  { modality: "IPL", role: "Fuente de luz de espectro amplio; permite abordar eritema difuso y vasos visibles mediante filtros y parámetros seleccionados.", nuance: "La literatura es favorable, pero heterogénea. Una revisión de 2024 señaló calidad metodológica limitada en muchos estudios." },
  { modality: "Nd:YAG 1064 nm", role: "Longitud de onda con penetración más profunda y menor absorción por melanina que longitudes de onda vasculares más cortas; puede ser útil según calibre y profundidad vascular.", nuance: "Ensayos y metaanálisis muestran eficacia, pero no justifican presentarlo como mejor para toda rosácea vascular." },
  { modality: "KTP 532 nm", role: "Opción vascular superficial con alta absorción por oxihemoglobina, pertinente para eritema y telangiectasias seleccionadas.", nuance: "Un estudio prospectivo de 2024 encontró eficacia comparable a PDL con menos dolor y reacciones postratamiento; la base comparativa sigue siendo menor." }
];

const faq = [
  { question: "¿Cuál es el mejor láser para rosácea?", answer: "No existe un ganador universal. La elección depende de si predomina eritema difuso, telangiectasia, calibre y profundidad vascular, fototipo, tolerancia al downtime, tratamientos previos y parámetros disponibles." },
  { question: "¿Nd:YAG 1064 nm sirve para rosácea?", answer: "Sí puede tener un papel en rosácea vascular. La evidencia comparativa muestra mejoría clínica y satisfacción similares a PDL en varios estudios, pero la indicación debe individualizarse." },
  { question: "¿IPL es un láser?", answer: "No. IPL es una fuente de luz intensa pulsada de espectro amplio que utiliza filtros; PDL, Nd:YAG y KTP son sistemas láser con longitudes de onda específicas." },
  { question: "¿El láser cura la rosácea?", answer: "No. Las tecnologías vasculares pueden reducir manifestaciones como eritema persistente o telangiectasias, pero la rosácea es crónica y otros componentes inflamatorios, oculares o de barrera pueden requerir estrategias diferentes." }
];

const references = [
  { label: "Nguyen L, et al. Laser and energy-based devices for treating rosacea: systematic review and network meta-analysis. J Dtsch Dermatol Ges. 2026.", href: "https://pubmed.ncbi.nlm.nih.gov/41273013/" },
  { label: "Bestavros S, et al. Visible Light and Laser Therapy for the Treatment of Rosacea: A Systematic Review. J Cutan Med Surg. 2026.", href: "https://pubmed.ncbi.nlm.nih.gov/42140233/" },
  { label: "Finney OS, et al. Pulsed Dye Laser and Intense Pulsed Light Therapy for Cutaneous and Ocular Rosacea: A Systematic Review. Lasers Surg Med. 2026.", href: "https://pubmed.ncbi.nlm.nih.gov/42561123/" },
  { label: "Zhai Q, et al. Meta-Analysis of IPL and PDL Therapy in Rosacea. J Cosmet Dermatol. 2024.", href: "https://pubmed.ncbi.nlm.nih.gov/39240125/" },
  { label: "Li J, et al. PDL vs microsecond 1064-nm Nd:YAG in rosacea: meta-analysis. Lasers Med Sci. 2022.", href: "https://pubmed.ncbi.nlm.nih.gov/35127754/" },
  { label: "Nguyen L, et al. Rosacea treatment with 532 nm KTP versus 595 nm PDL: prospective controlled study. J Cosmet Dermatol. 2024.", href: "https://pubmed.ncbi.nlm.nih.gov/38600654/" }
];

export default function RosaceaVascularComparison() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "@id": `${pageUrl}#article`, url: pageUrl, headline: article.title, description: article.description, inLanguage: "es-MX", dateCreated: article.preparedAt, dateModified: article.preparedAt, author: { "@id": `${siteConfig.url}#clinic` }, reviewedBy: { "@id": `${siteConfig.url}#doctor` }, publisher: { "@id": `${siteConfig.url}#clinic` }, isPartOf: { "@id": `${siteConfig.url}#website` }, breadcrumb: { "@id": `${pageUrl}#breadcrumb` } },
      { "@type": "BreadcrumbList", "@id": `${pageUrl}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Journal", item: `${siteConfig.url}/journal` },
        { "@type": "ListItem", position: 3, name: article.title, item: pageUrl }
      ]},
      { "@type": "FAQPage", "@id": `${pageUrl}#faq`, mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }
    ]
  };

  return <main><article>
    <section className="border-b border-line bg-aurora py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))]">
      <Link href="/journal" className="text-sm text-muted transition hover:text-bone">HAUTLAB Journal / {article.axis} / {article.category}</Link>
      <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">Comparativa clínica · {article.readingTime}</p>
      <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">{article.title}</h1>
      <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
      <p className="mt-8 text-xs leading-6 text-quiet">Preparado: 29 de septiembre de 2026 · Pendiente de revisión médica final por Dr. Salvador Cordero</p>
    </div></section>

    <section className="border-b border-line py-14 lg:py-20"><div className="mx-auto w-[min(920px,calc(100%-32px))]"><Card className="p-7 sm:p-9">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Respuesta breve</p>
      <p className="mt-5 text-xl leading-9 text-bone">PDL, IPL y Nd:YAG 1064 nm pueden mejorar manifestaciones vasculares de rosácea, pero no son intercambiables ni existe una tecnología superior para todos. La decisión depende del patrón vascular, profundidad y calibre de los vasos, fototipo, tolerancia al tratamiento y experiencia con el dispositivo.</p>
    </Card></div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto w-[min(1040px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">La comparación útil</p>
      <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">No se elige por nombre del aparato. Se elige por el componente vascular.</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2">{comparison.map((x)=><Card key={x.modality} className="p-7"><h3 className="text-xl font-medium text-bone">{x.modality}</h3><p className="mt-4 text-sm leading-7 text-muted">{x.role}</p><p className="mt-4 text-sm leading-7 text-quiet">{x.nuance}</p></Card>)}</div>
    </div></section>

    <section className="border-b border-line bg-soft/20 py-16 lg:py-24"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-2">
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Evidencia más sólida</p><h2 className="mt-4 font-serif text-3xl text-bone">Las tecnologías vasculares sí pueden reducir eritema y telangiectasias.</h2><p className="mt-5 text-sm leading-7 text-muted">Revisiones sistemáticas y ensayos apoyan PDL e IPL, y existe evidencia comparativa para Nd:YAG. PDL conserva la base histórica más robusta, pero los metaanálisis no permiten afirmar que gane en todos los desenlaces o pacientes.</p></Card>
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Lo que sigue incierto</p><h2 className="mt-4 font-serif text-3xl text-bone">Un algoritmo universal por longitud de onda.</h2><p className="mt-5 text-sm leading-7 text-muted">Los estudios usan equipos, parámetros, escalas y poblaciones diferentes. La revisión en red de 2026 incluyó 25 ensayos, pero señaló riesgo de sesgo frecuente. Esa heterogeneidad limita rankings simples entre dispositivos.</p></Card>
    </div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))]">
      <h2 className="font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">¿Dónde entra Nd:YAG 1064?</h2>
      <div className="mt-7 space-y-5 text-base leading-8 text-muted">
        <p>Su longitud de onda penetra más profundamente y es menos absorbida por melanina que 532 o 595 nm. Eso puede hacerlo pertinente cuando el objetivo vascular es más profundo o de mayor calibre, sin convertirlo automáticamente en la mejor elección para eritema superficial difuso.</p>
        <p>Un metaanálisis que comparó PDL con Nd:YAG microsegundo no encontró diferencias significativas en mejoría clínica mayor al 50% ni en satisfacción. Un ensayo split-face de PDL frente a emisión secuencial PDL/Nd:YAG también encontró reducción significativa del eritema con ambas estrategias.</p>
        <p>La conclusión práctica es seleccionar el sistema a partir de la lesión que se quiere tratar y no asumir que una mayor profundidad equivale a mayor eficacia para todo fenotipo vascular.</p>
      </div>
    </div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto w-[min(900px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p><div className="mt-8 divide-y divide-line border-y border-line">{faq.map((x)=><details key={x.question} className="py-5"><summary className="cursor-pointer list-none text-base font-medium text-bone [&::-webkit-details-marker]:hidden">{x.question}</summary><p className="mt-4 text-sm leading-7 text-muted">{x.answer}</p></details>)}</div>
    </div></section>

    <section className="border-b border-line py-16 lg:py-20"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <Card className="p-7"><BookOpen className="h-5 w-5 text-champagne"/><p className="mt-5 text-xs uppercase tracking-[0.2em] text-champagne">Fuentes</p><ul className="mt-5 space-y-4 text-sm leading-7 text-muted">{references.map((r)=><li key={r.href}><a href={r.href} target="_blank" rel="noreferrer" className="transition hover:text-bone">{r.label}</a></li>)}</ul></Card>
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Control editorial</p><p className="mt-5 text-lg font-medium text-bone">Pendiente de revisión médica final</p><p className="mt-3 text-sm leading-7 text-muted">Requiere aprobación del Dr. Salvador Cordero antes de publicación, especialmente en la interpretación de profundidad vascular, selección por fototipo y límites de cada dispositivo.</p><p className="mt-5 text-xs leading-6 text-quiet">Contenido educativo. No sustituye valoración médica ni constituye parámetros de tratamiento.</p></Card>
    </div></section>

    <section className="py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Rosácea vascular</p><h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] tracking-[-.05em] text-bone">Primero se define qué componente se quiere tratar.</h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">La valoración distingue eritema persistente, telangiectasias, inflamación y otros componentes antes de decidir si una tecnología vascular tiene sentido.</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><Button asChild><a href={buildWhatsAppLink("Hola, quiero agendar una valoración por rosácea o vasos faciales.")} target="_blank" rel="noreferrer">Agendar valoración <ArrowRight className="h-4 w-4"/></a></Button><Button asChild variant="outline"><Link href="/procedimientos/rosacea">Ver rosácea</Link></Button></div>
    </div></section>
  </article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/></main>;
}
