import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { journalArticleBySlug } from "@/data/journal";

const article = journalArticleBySlug["melasma-vs-manchas-postacne"];
const url = siteConfig.url + "/journal/" + article.slug;
export const metadata: Metadata = {
  title: "Melasma vs manchas de acné: cómo diferenciarlas | HAUTLAB",
  description: article.description,
  alternates: { canonical: url },
  openGraph: { title: article.title, description: article.description, url, type: "article", locale: "es_MX" }
};
const differences = [
  ["Origen", "Pigmentación adquirida relacionada con radiación, predisposición y factores hormonales en algunas personas.", "Pigmento residual en el sitio de inflamación previa, como acné o dermatitis."],
  ["Distribución", "Parches faciales, a menudo bilaterales, en mejillas, frente o labio superior.", "Máculas en lugares donde hubo granos, irritación, rascado o procedimientos."],
  ["Evolución", "Tendencia a recurrir, incluso tras mejorar.", "Depende de la inflamación persistente, la exposición y el tiempo de recuperación."],
  ["Prioridad", "Confirmar diagnóstico, fotoprotección y plan de mantenimiento.", "Controlar la causa inflamatoria y evitar nuevas lesiones e irritación."]
];
const faq = [
  ["¿Las marcas oscuras del acné son melasma?", "Generalmente son hiperpigmentación postinflamatoria, pero ambos diagnósticos pueden coexistir."],
  ["¿Las marcas rojas son hiperpigmentación?", "No necesariamente: el eritema postinflamatorio puede ser vascular, no exceso de melanina."],
  ["¿El láser elimina cualquier mancha?", "No. El diagnóstico y el fototipo importan; algunos procedimientos pueden empeorar melasma o hiperpigmentación postinflamatoria."],
  ["¿Cuándo consultar?", "Si la lesión es nueva, cambia, sangra, se palpa, tiene aspecto atípico o no mejora, necesita valoración antes de asumir una causa benigna."]
];
const sources = [
  ["Consenso global de trastornos pigmentarios, JEADV 2026", "https://pubmed.ncbi.nlm.nih.gov/41362125/"],
  ["Consenso latinoamericano de melasma, Int J Dermatol 2025", "https://pubmed.ncbi.nlm.nih.gov/39415312/"],
  ["Revisión sistemática de hiperpigmentación postinflamatoria, JEADV 2024", "https://pubmed.ncbi.nlm.nih.gov/37843491/"],
  ["Ensayo aleatorizado sobre luz visible y fotoprotección, 2014", "https://pubmed.ncbi.nlm.nih.gov/24313385/"],
  ["Sociedad Europea de Láser en Dermatología, posicionamiento 2019", "https://pubmed.ncbi.nlm.nih.gov/30873649/"]
];
export default function Page() {
  const data = {"@context":"https://schema.org","@graph":[
    {"@type":"Article","@id":url+"#article",headline:article.title,description:article.description,url,inLanguage:"es-MX",dateCreated:article.preparedAt},
    {"@type":"BreadcrumbList","@id":url+"#breadcrumb",itemListElement:[
      {"@type":"ListItem",position:1,name:"Inicio",item:siteConfig.url},
      {"@type":"ListItem",position:2,name:"Journal",item:siteConfig.url+"/journal"},
      {"@type":"ListItem",position:3,name:article.title,item:url}]},
    {"@type":"FAQPage","@id":url+"#faq",mainEntity:faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}
  ]};
  return <main><article className="mx-auto w-[min(960px,calc(100%-32px))] py-16 lg:py-24">
    <Link href="/journal" className="text-sm text-muted">HAUTLAB Journal / Dermatología clínica</Link>
    <p className="mt-10 text-xs uppercase tracking-[.2em] text-champagne">Comparativa clínica · {article.readingTime}</p>
    <h1 className="mt-5 font-serif text-[clamp(2.8rem,6vw,5.6rem)] leading-tight text-bone">{article.title}</h1>
    <p className="mt-6 text-lg leading-8 text-muted">{article.description}</p>
    <p className="mt-4 text-xs text-muted">Preparado: 20 de octubre de 2026 · Revisión médica pendiente</p>
    <section className="mt-14 border-t border-line pt-10"><h2 className="font-serif text-3xl text-bone">Respuesta breve</h2>
      <p className="mt-5 leading-8 text-muted">El melasma suele producir parches pigmentados en zonas fotoexpuestas de la cara y tiende a recurrir. La hiperpigmentación postinflamatoria aparece donde hubo inflamación, como una lesión de acné. La historia y distribución orientan, pero no confirman por sí solas el diagnóstico.</p></section>
    <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Diferencias clínicas</h2>
      <div className="mt-7 overflow-x-auto"><table className="w-full min-w-[660px] border-collapse text-left text-sm leading-7">
      <thead><tr className="border-b border-line text-bone"><th scope="col" className="p-3">Hallazgo</th><th scope="col" className="p-3">Melasma</th><th scope="col" className="p-3">Manchas postinflamatorias</th></tr></thead>
      <tbody>{differences.map(row=><tr key={row[0]} className="border-b border-line text-muted">{row.map((cell,i)=><td key={i} className="p-3 align-top">{cell}</td>)}</tr>)}</tbody>
      </table></div><p className="mt-4 text-sm text-muted">Comparación orientativa, no prueba diagnóstica validada.</p></section>
    <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Por qué importa diferenciarlas</h2>
      <p className="mt-5 leading-8 text-muted">La evaluación considera fototipo, distribución, antecedentes de acné, dermatitis o irritación, exposición lumínica y tratamientos previos. Una mancha roja puede ser eritema residual y no pigmentación marrón. Algunas lesiones pigmentadas necesitan un diagnóstico distinto antes de aplicar tratamientos cosméticos.</p>
      <p className="mt-5 leading-8 text-muted">Para melasma, consensos recientes respaldan fotoprotección y mantenimiento para reducir recaídas. Para manchas postinflamatorias, controlar el proceso que continúa inflamando la piel es prioritario. El ensayo aleatorizado sobre filtros con óxidos de hierro apoya proteger también frente a luz visible en melasma; no demuestra curación por un solo producto.</p>
      <p className="mt-5 leading-8 text-muted">La revisión sistemática de hiperpigmentación postinflamatoria reúne estudios heterogéneos, principalmente de secuelas de acné. Sus resultados no permiten prometer eficacia para todos los fototipos ni elegir un láser universal. La irritación y los procedimientos mal seleccionados pueden agravar la pigmentación.</p></section>
    <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Preguntas frecuentes</h2>
      <div className="mt-6 divide-y divide-line">{faq.map(([q,a])=><div key={q} className="py-5"><h3 className="font-medium text-bone">{q}</h3><p className="mt-2 leading-7 text-muted">{a}</p></div>)}</div></section>
    <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Lecturas relacionadas</h2>
      <p className="mt-5 leading-8 text-muted">Consulta <Link className="underline" href="/journal/por-que-vuelve-melasma">recurrencia del melasma</Link>, <Link className="underline" href="/journal/cuando-consultar-por-acne">cuándo consultar por acné</Link>, <Link className="underline" href="/procedimientos/melasma">valoración de melasma</Link> y <Link className="underline" href="/procedimientos/acne">valoración de acné</Link>.</p></section>
    <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Fuentes y revisión</h2>
      <ul className="mt-5 space-y-3 text-sm text-muted">{sources.map(([label,href])=><li key={href}><a className="underline" href={href} target="_blank" rel="noreferrer">{label}</a></li>)}</ul>
      <p className="mt-6 text-sm leading-7 text-muted">Contenido educativo, no diagnóstico individual. Pendiente de revisión médica: diagnóstico diferencial, seguridad de procedimientos y lenguaje de seguimiento.</p></section>
  </article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/></main>;
}