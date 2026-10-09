import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const article = journalArticleBySlug["plla-colageno-expectativas-riesgos"];
const pageUrl = siteConfig.url + "/journal/" + article.slug;

export const metadata: Metadata = {
  title: "PLLA facial: colágeno, tiempos y riesgos | HAUTLAB Journal",
  description: "Qué hace el ácido poli-L-láctico (PLLA), cuándo se evalúan sus cambios, por qué no equivale a un relleno inmediato y qué riesgos requieren atención.",
  alternates: { canonical: pageUrl },
  openGraph: { title: article.title, description: article.description, url: pageUrl, siteName: "HAUTLAB", locale: "es_MX", type: "article" }
};

const faq = [
  { question: "¿El PLLA da volumen inmediatamente?", answer: "Puede haber un cambio inicial por el líquido de preparación y la inflamación, pero no debe interpretarse como el resultado final. El efecto tisular asociado a estimulación de colágeno se valora de forma progresiva durante semanas y meses." },
  { question: "¿Cuánto tarda en notarse el PLLA?", answer: "No hay un día universal. La evolución depende del producto, la indicación, el plan individual y el tejido tratado. Los ensayos evalúan desenlaces a varios meses, no sólo al terminar la sesión." },
  { question: "¿El PLLA se disuelve con hialuronidasa?", answer: "No. La hialuronidasa se utiliza para degradar ácido hialurónico; no revierte el PLLA. Por eso la selección de producto, la indicación y el seguimiento importan antes de inyectar." },
  { question: "¿Puede formar nódulos?", answer: "Sí. Puede haber irregularidades o nódulos, algunos de aparición tardía. No todo bulto significa granuloma, pero una lesión persistente, creciente, dolorosa o inflamada necesita valoración médica." },
  { question: "¿PLLA y ácido hialurónico son lo mismo?", answer: "No. Tienen composición, comportamiento, reversibilidad y objetivos distintos. La elección no depende de cuál esté de moda, sino del problema anatómico y la tolerancia al riesgo." }
];

const references = [
  { label: "Zhang Y, et al. PLLA para pérdida de volumen y contorno mediofacial: ensayo multicéntrico aleatorizado. J Cosmet Dermatol. 2025. PMID 40679154.", href: "https://pubmed.ncbi.nlm.nih.gov/40679154/" },
  { label: "Fabi SG, et al. PLLA-SCA para arrugas de mejilla: ensayo controlado aleatorizado. J Drugs Dermatol. 2024. PMID 38206151.", href: "https://pubmed.ncbi.nlm.nih.gov/38206151/" },
  { label: "Efficacy and Safety of Poly-L-Lactic Acid in Facial Aesthetics: revisión sistemática de 11 ensayos. Polymers. 2024.", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11435306/" },
  { label: "Wang H, et al. Granulomas por bioestimuladores: revisión sistemática de reportes de casos. J Cosmet Dermatol. 2025. PMID 41132036.", href: "https://pubmed.ncbi.nlm.nih.gov/41132036/" },
  { label: "FDA. Sculptra: indicaciones y advertencias de seguridad de un producto específico (jurisdicción estadounidense).", href: "https://www.fda.gov/medical-devices/recently-approved-devices/sculptra-p030050s039" }
];

export default function PllaExpectationsArticle() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "@id": pageUrl + "#article", url: pageUrl, headline: article.title, description: article.description, inLanguage: "es-MX", dateCreated: article.preparedAt, dateModified: article.preparedAt, author: { "@id": siteConfig.url + "#clinic" }, publisher: { "@id": siteConfig.url + "#clinic" }, isPartOf: { "@id": siteConfig.url + "#website" }, breadcrumb: { "@id": pageUrl + "#breadcrumb" } },
      { "@type": "BreadcrumbList", "@id": pageUrl + "#breadcrumb", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Journal", item: siteConfig.url + "/journal" },
        { "@type": "ListItem", position: 3, name: article.title, item: pageUrl }
      ] },
      { "@type": "FAQPage", "@id": pageUrl + "#faq", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }
    ]
  };

  return <main><article>
    <section className="border-b border-line bg-aurora py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))]">
      <Link href="/journal" className="text-sm text-muted transition hover:text-bone">HAUTLAB Journal / {article.axis} / {article.category}</Link>
      <p className="mt-8 text-xs uppercase tracking-[0.22em] text-champagne">Artículo clínico · {article.readingTime}</p>
      <h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">{article.title}</h1>
      <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">{article.description}</p>
      <p className="mt-8 text-xs leading-6 text-quiet">Preparado: 9 de octubre de 2026 · Pendiente de revisión médica final por Dr. Salvador Cordero</p>
    </div></section>

    <section className="border-b border-line py-14 lg:py-20"><div className="mx-auto w-[min(920px,calc(100%-32px))]"><Card className="p-7 sm:p-9">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Respuesta breve</p>
      <p className="mt-5 text-xl leading-9 text-bone">El ácido poli-L-láctico (PLLA) es un material inyectable que puede favorecer una respuesta tisular con formación de colágeno y cambios graduales en determinadas indicaciones faciales. No equivale a colocar un volumen exacto de ácido hialurónico ni a obtener una corrección inmediata y reversible. Su utilidad depende del diagnóstico anatómico, el producto concreto y un plan con seguimiento.</p>
    </Card></div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-10 lg:grid-cols-[.82fr_1.18fr]">
      <div><p className="text-xs uppercase tracking-[0.2em] text-champagne">Qué significa bioestimular</p><h2 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">Colágeno no es sinónimo de volumen instantáneo.</h2></div>
      <div className="space-y-5 text-base leading-8 text-muted">
        <p>El PLLA es un polímero biodegradable. Tras su aplicación se produce una respuesta tisular alrededor de las partículas que puede favorecer actividad fibroblástica y depósito de matriz extracelular. Decir “estimula colágeno” describe un mecanismo; no garantiza cuánto cambiará un rostro ni que cualquier irregularidad se corrija.</p>
        <p>La apariencia inmediatamente después de la sesión puede estar influida por el líquido de preparación y la inflamación. Parte de ese cambio temprano disminuye. La evaluación del resultado clínico requiere tiempo y, en determinados protocolos estudiados, varias visitas.</p>
        <p>Si la prioridad es una corrección localizada y predecible de un contorno específico, puede que otro abordaje tenga más sentido. El artículo <Link href="/journal/relleno-vs-bioestimulador" className="text-bone underline decoration-line underline-offset-4">relleno frente a bioestimulador</Link> explica esa decisión general; aquí se examinan las particularidades del PLLA.</p>
      </div>
    </div></section>

    <section className="border-b border-line bg-soft/20 py-16 lg:py-24"><div className="mx-auto w-[min(1040px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Antes de elegir</p>
      <h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.6rem,5vw,4.6rem)] leading-[.95] tracking-[-.05em] text-bone">Tres preguntas cambian la indicación.</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <Card className="p-7"><h3 className="text-xl font-medium text-bone">¿Qué tejido explica el cambio?</h3><p className="mt-4 text-sm leading-7 text-muted">Pérdida de soporte, cambios grasos, piel, laxitud y movimiento no son el mismo problema. La evaluación debe identificar qué componente se intenta modificar.</p></Card>
        <Card className="p-7"><h3 className="text-xl font-medium text-bone">¿Qué tan precisa debe ser la corrección?</h3><p className="mt-4 text-sm leading-7 text-muted">Un objetivo de proyección o definición puntual puede requerir una estrategia distinta de un cambio progresivo y distribuido de calidad o volumen tisular.</p></Card>
        <Card className="p-7"><h3 className="text-xl font-medium text-bone">¿Es aceptable un efecto no reversible con hialuronidasa?</h3><p className="mt-4 text-sm leading-7 text-muted">El PLLA no se elimina mediante hialuronidasa. Esa diferencia importa especialmente si aparecen irregularidades o el resultado no coincide con la expectativa.</p></Card>
      </div>
    </div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-2">
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Qué sí respaldan los estudios</p><h2 className="mt-4 font-serif text-3xl text-bone">Mejoría en indicaciones faciales seleccionadas.</h2><p className="mt-5 text-sm leading-7 text-muted">Ensayos aleatorizados han encontrado mejorías en arrugas de mejilla y pérdida de volumen mediofacial con formulaciones concretas de PLLA. Un ensayo de 2025 comparó PLLA con ácido hialurónico en 331 participantes; otro de 2024 evaluó arrugas de mejilla frente a un grupo sin tratamiento. Sus resultados no prueban superioridad en todas las zonas, formulaciones o pacientes.</p></Card>
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Qué sigue limitado</p><h2 className="mt-4 font-serif text-3xl text-bone">La certeza general y la extrapolación.</h2><p className="mt-5 text-sm leading-7 text-muted">Una revisión sistemática de 2024 identificó 11 ensayos y calificó la calidad global de evidencia como baja, con riesgo de sesgo alto en varios estudios. Los tiempos, productos, métodos y desenlaces son heterogéneos. La eficacia de una formulación no se transfiere automáticamente a otra ni a usos corporales o zonas no estudiadas.</p></Card>
    </div></section>

    <section className="border-b border-line py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Seguridad y seguimiento</p>
      <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.3rem)] leading-[.95] tracking-[-.05em] text-bone">Un bioestimulador también puede producir complicaciones tardías.</h2>
      <div className="mt-8 space-y-5 text-base leading-8 text-muted">
        <p>Tras una aplicación pueden aparecer dolor, edema, sensibilidad, hematomas e irregularidades transitorias. También se han descrito nódulos palpables, nódulos visibles y reacciones inflamatorias o granulomatosas tardías. Un bulto no permite, por sí solo, determinar si se trata de producto, fibrosis, infección u otra reacción.</p>
        <p>Una revisión de 2025 reunió reportes de granulomas relacionados con diferentes bioestimuladores. Es útil para reconocer presentaciones posibles, pero al recopilar casos publicados no permite calcular la incidencia real de granulomas ni comparar tasas de riesgo entre marcas.</p>
        <p>Antes de tratar se deben revisar antecedentes de alergia, reacciones a materiales inyectables, tendencia a cicatrices hipertróficas o queloides, inflamación o infección local, procedimientos previos y el etiquetado del producto específico. Las indicaciones y restricciones regulatorias pueden variar entre países y formulaciones.</p>
        <p>Dolor intenso o creciente, cambios bruscos de coloración cutánea, alteración visual o síntomas neurológicos después de un inyectable requieren evaluación urgente. Un nódulo persistente, caliente, doloroso o en crecimiento también debe valorarse; no conviene manipularlo ni asumir que desaparecerá solo.</p>
      </div>
    </div></section>

    <section className="border-b border-line bg-white/[0.02] py-16 lg:py-24"><div className="mx-auto w-[min(900px,calc(100%-32px))]">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Preguntas frecuentes</p><div className="mt-8 divide-y divide-line border-y border-line">{faq.map((x)=><details key={x.question} className="py-5"><summary className="cursor-pointer list-none text-base font-medium text-bone [&::-webkit-details-marker]:hidden">{x.question}</summary><p className="mt-4 text-sm leading-7 text-muted">{x.answer}</p></details>)}</div>
    </div></section>

    <section className="border-b border-line py-16 lg:py-20"><div className="mx-auto grid w-[min(1040px,calc(100%-32px))] gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <Card className="p-7"><BookOpen className="h-5 w-5 text-champagne"/><p className="mt-5 text-xs uppercase tracking-[0.2em] text-champagne">Fuentes y nivel de certeza</p><p className="mt-4 text-sm leading-7 text-muted">Los ensayos respaldan beneficios en indicaciones definidas. Las revisiones señalan limitaciones de calidad y heterogeneidad. La evidencia de granulomas se utiliza para describir complicaciones posibles, no para estimar su frecuencia.</p><ul className="mt-5 space-y-4 text-sm leading-7 text-muted">{references.map((r)=><li key={r.href}><a href={r.href} target="_blank" rel="noreferrer" className="transition hover:text-bone">{r.label}</a></li>)}</ul></Card>
      <Card className="p-7"><p className="text-xs uppercase tracking-[0.2em] text-champagne">Control editorial</p><p className="mt-5 text-lg font-medium text-bone">Pendiente de revisión médica final</p><p className="mt-3 text-sm leading-7 text-muted">Revisión requerida por Dr. Salvador Cordero antes de publicar: mecanismo y tiempos de respuesta, selección de candidatos, riesgo de nódulos, signos de alarma y diferencias entre formulaciones y jurisdicciones.</p><p className="mt-5 text-xs leading-6 text-quiet">Contenido educativo. No es una indicación de tratamiento ni un protocolo de inyección.</p></Card>
    </div></section>

    <section className="py-16 lg:py-24"><div className="mx-auto w-[min(920px,calc(100%-32px))] text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-champagne">Decisión clínica</p><h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.4rem)] tracking-[-.05em] text-bone">La pregunta no es cuántos viales. Es qué problema se quiere resolver.</h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted">Una valoración permite revisar anatomía, alternativas, antecedentes y objetivos antes de decidir si un bioestimulador forma parte del plan.</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><Button asChild><a href={buildWhatsAppLink("Hola, quiero agendar una valoración sobre bioestimuladores faciales.")} target="_blank" rel="noreferrer">Agendar valoración <ArrowRight className="h-4 w-4"/></a></Button><Button asChild variant="outline"><Link href="/journal/relleno-vs-bioestimulador">Relleno vs bioestimulador</Link></Button></div>
    </div></section>
  </article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/></main>;
}
