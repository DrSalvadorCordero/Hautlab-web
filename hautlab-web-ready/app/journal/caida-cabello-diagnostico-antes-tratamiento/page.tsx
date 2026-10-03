import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["caida-cabello-diagnostico-antes-tratamiento"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;

export const metadata: Metadata = {
  title: "Caída de cabello: diagnóstico antes del tratamiento | HAUTLAB",
  description: "No toda caída de cabello es la misma. Qué aporta la historia clínica, exploración y tricoscopia antes de elegir tratamiento para alopecia.",
  alternates: { canonical: pageUrl },
  openGraph: { title: article.title, description: article.description, url: pageUrl, siteName: "HAUTLAB", locale: "es_MX", type: "article" }
};

const faq = [
  { question: "¿Toda caída de cabello es alopecia androgenética?", answer: "No. El aumento de caída puede corresponder a efluvio telógeno, alopecia areata, enfermedades inflamatorias o cicatriciales, alteraciones del tallo y otras causas. La distribución y evolución orientan el diagnóstico." },
  { question: "¿Para qué sirve la tricoscopia?", answer: "Permite observar de forma no invasiva estructuras del cabello y cuero cabelludo que no siempre son evidentes a simple vista. Sus hallazgos pueden apoyar el diagnóstico diferencial y orientar si se requieren estudios adicionales." },
  { question: "¿Siempre se necesitan análisis de laboratorio?", answer: "No existe un panel universal para toda caída de cabello. Los estudios se seleccionan según historia clínica, patrón de caída, exploración, antecedentes, dieta, medicamentos, síntomas asociados y sospecha diagnóstica." },
  { question: "¿PRP o microneedling sustituyen el diagnóstico?", answer: "No. Hay estudios favorables en indicaciones seleccionadas, pero protocolos y calidad de evidencia son variables. Un procedimiento no corrige una causa que no ha sido identificada." },
  { question: "¿Cuándo conviene valorar la caída pronto?", answer: "La pérdida rápida o en parches, dolor, inflamación, descamación intensa, pústulas, pérdida de cejas o pestañas, o signos de cicatrización justifican una evaluación médica para descartar procesos que requieren atención específica." }
];

const references = [
  { label: "Almohanna HM, et al. The Role of Vitamins and Minerals in Hair Loss: A Review. Dermatol Ther (Heidelb). 2019.", href: "https://pubmed.ncbi.nlm.nih.gov/30547302/" },
  { label: "Lacarrubba F, et al. Trichoscopy in the differential diagnosis of alopecia: a systematic review. Dermatol Ther. 2022.", href: "https://pubmed.ncbi.nlm.nih.gov/35293625/" },
  { label: "Kanti V, et al. Evidence-based (S3) guideline for the treatment of androgenetic alopecia in women and in men – short version. J Eur Acad Dermatol Venereol. 2018.", href: "https://pubmed.ncbi.nlm.nih.gov/29178529/" },
  { label: "Randolph M, Tosti A. Oral minoxidil treatment for hair loss: A review of efficacy and safety. J Am Acad Dermatol. 2021.", href: "https://pubmed.ncbi.nlm.nih.gov/32622136/" },
  { label: "Gupta AK, et al. Platelet-rich plasma and its use in hair regrowth: a review. J Cosmet Dermatol. 2021.", href: "https://pubmed.ncbi.nlm.nih.gov/32757405/" }
];

export default function HairLossDiagnosisArticle() {
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
      <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">Artículo clínico · {article.readingTime}</p>
      <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">{article.title}</h1>
      <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
      <p className="mt-8 text-xs leading-6 text-quiet">Preparado: 3 de octubre de 2026 · Revisión médica: Dr. Salvador Cordero · 3 de octubre de 2026</p>
    </div></section>

    <section className="border-b border-line py-14 lg:py-20"><div className="mx-auto w-[min(920px,calc(100%-32px))]"><Card className="p-7 sm:p-9">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Respuesta breve</p>
      <p className="mt-5 text-xl leading-9 text-bone">“Se me cae el cabello” describe un síntoma, no un diagnóstico. Antes de elegir minoxidil, suplementos, infiltraciones o procedimientos conviene definir el patrón de pérdida, velocidad de evolución, estado del cuero cabelludo y hallazgos tricoscópicos. Tratar primero y diagnosticar después puede retrasar la causa correcta.</p>
    </Card></div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
      <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">El primer error</p><h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">Llamar “alopecia” a problemas que no se comportan igual.</h2></div>
      <div className="space-y-5 text-base leading-8 text-muted">
        <p>La alopecia androgenética suele producir miniaturización progresiva en una distribución característica. El efluvio telógeno, en cambio, se manifiesta como aumento difuso de la caída y puede aparecer después de desencadenantes sistémicos, nutricionales, farmacológicos o de estrés fisiológico.</p>
        <p>La alopecia areata, las alopecias cicatriciales y enfermedades inflamatorias del cuero cabelludo requieren otra lectura. En procesos cicatriciales, reconocer inflamación activa importa porque la pérdida folicular puede hacerse permanente.</p>
        <p>La página clínica de <Link href="/procedimientos/alopecia" className="text-bone underline decoration-line underline-offset-4">alopecia en HAUTLAB</Link> concentra el enfoque de valoración y opciones terapéuticas; este artículo responde a una pregunta anterior: cómo saber qué se está tratando.</p>
      </div>
    </div></section>

    <section className="border-b border-line bg-soft/20 py-16 lg:py-24"><div className="mx-auto w-[min(1040px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Qué aporta la valoración</p>
      <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">Historia, distribución, cuero cabelludo y tricoscopia responden preguntas diferentes.</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card className="p-7"><h3 className="text-lg font-medium text-bone">Historia clínica</h3><p className="mt-4 text-sm leading-7 text-muted">Inicio, velocidad, episodios previos, antecedentes familiares, enfermedades, cambios de peso o dieta, medicamentos, embarazo y otros eventos pueden modificar el diagnóstico diferencial.</p></Card>
        <Card className="p-7"><h3 className="text-lg font-medium text-bone">Patrón de pérdida</h3><p className="mt-4 text-sm leading-7 text-muted">No es lo mismo miniaturización frontoparietal o de vértex, pérdida difusa, placas bien delimitadas o retroceso acompañado de inflamación.</p></Card>
        <Card className="p-7"><h3 className="text-lg font-medium text-bone">Cuero cabelludo</h3><p className="mt-4 text-sm leading-7 text-muted">Eritema, descamación, pústulas, dolor, prurito, pérdida de ostia foliculares o cicatrización cambian la prioridad diagnóstica.</p></Card>
        <Card className="p-7"><h3 className="text-lg font-medium text-bone">Tricoscopia</h3><p className="mt-4 text-sm leading-7 text-muted">La dermatoscopia del cabello y cuero cabelludo permite reconocer patrones de miniaturización, diversidad del diámetro, pelos rotos y signos perifoliculares que apoyan distintos diagnósticos.</p></Card>
      </div>
    </div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-2">
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Evidencia más sólida</p><h2 className="mt-4 font-serif text-3xl text-bone">Diagnóstico dirigido antes de elegir terapia.</h2><p className="mt-5 text-sm leading-7 text-muted">La evaluación clínica y la tricoscopia tienen un papel establecido en el diagnóstico diferencial. Para alopecia androgenética existen tratamientos con evidencia y guías específicas, pero su pertinencia depende de haber identificado correctamente el patrón.</p></Card>
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Evidencia más variable</p><h2 className="mt-4 font-serif text-3xl text-bone">Suplementos y procedimientos no son una respuesta universal.</h2><p className="mt-5 text-sm leading-7 text-muted">PRP, microneedling y otras intervenciones muestran señales favorables en determinados contextos, pero existe heterogeneidad de protocolos y desenlaces. Los suplementos tienen sentido cuando existe una deficiencia o indicación concreta; usarlos indiscriminadamente no sustituye la investigación de la causa.</p></Card>
    </div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))]">
      <h2 className="font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">¿Y el minoxidil oral?</h2>
      <div className="mt-7 space-y-5 text-base leading-8 text-muted">
        <p>El minoxidil oral a dosis bajas se utiliza de forma off-label para distintos trastornos de pérdida de cabello y cuenta con una literatura clínica creciente. Eso no lo convierte en el punto de partida automático para cualquier paciente que refiere caída.</p>
        <p>La decisión requiere contexto diagnóstico y valoración individual de riesgos, antecedentes y posibles efectos adversos. Esta pieza no propone dosis ni un esquema de prescripción.</p>
      </div>
    </div></section>

    <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24"><div className="mx-auto w-[min(900px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p><div className="mt-8 divide-y divide-line border-y border-line">{faq.map((x)=><details key={x.question} className="py-5"><summary className="cursor-pointer list-none text-base font-medium text-bone [&::-webkit-details-marker]:hidden">{x.question}</summary><p className="mt-4 text-sm leading-7 text-muted">{x.answer}</p></details>)}</div>
    </div></section>

    <section className="border-b border-line py-16 lg:py-20"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <Card className="p-7"><BookOpen className="h-5 w-5 text-champagne"/><p className="mt-5 text-xs uppercase tracking-[0.2em] text-champagne">Fuentes y certeza</p><p className="mt-4 text-sm leading-7 text-muted">La pieza separa herramientas diagnósticas y tratamientos establecidos de intervenciones con protocolos menos estandarizados. Las revisiones citadas no justifican extrapolar un tratamiento a todas las causas de pérdida de cabello.</p><ul className="mt-5 space-y-4 text-sm leading-7 text-muted">{references.map((r)=><li key={r.href}><a href={r.href} target="_blank" rel="noreferrer" className="transition hover:text-bone">{r.label}</a></li>)}</ul></Card>
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Control editorial</p><p className="mt-5 text-lg font-medium text-bone">Revisión médica aprobada</p><p className="mt-3 text-sm leading-7 text-muted">Revisión médica aprobada por el Dr. Salvador Cordero el 3 de octubre de 2026, incluyendo diagnóstico diferencial, signos de valoración prioritaria y encuadre de minoxidil oral, PRP y microneedling.</p><p className="mt-5 text-xs leading-6 text-quiet">Contenido educativo. No sustituye una valoración médica ni constituye prescripción individual.</p></Card>
    </div></section>

    <section className="py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Siguiente paso</p><h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] tracking-[-.05em] text-bone">Antes de sumar tratamientos, define qué tipo de pérdida está ocurriendo.</h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">Una valoración puede integrar historia, exploración y tricoscopia para decidir si hacen falta estudios adicionales y qué opciones tienen sentido.</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><Button asChild><a href={buildWhatsAppLink("Hola, quiero agendar una valoración por caída de cabello.")} target="_blank" rel="noreferrer">Agendar valoración <ArrowRight className="h-4 w-4"/></a></Button><Button asChild variant="outline"><Link href="/procedimientos/alopecia">Ver alopecia</Link></Button></div>
    </div></section>
  </article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/></main>;
}
