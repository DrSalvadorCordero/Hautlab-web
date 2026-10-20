import type { Metadata } from "next";
import Link from "next/link";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";

const article = journalArticleBySlug["acne-vs-rosacea-como-distinguir"];
const pageUrl = `${siteConfig.url}/journal/${article.slug}`;
export const metadata: Metadata = {
  title: "Acné vs rosácea: diferencias clínicas | HAUTLAB Journal",
  description: article.description,
  alternates: { canonical: pageUrl },
  openGraph: { title: article.title, description: article.description, url: pageUrl, type: "article", locale: "es_MX" }
};
const rows = [
  ["Comedones", "Habituales: abiertos o cerrados", "No son una lesión característica; si aparecen, considerar acné concomitante"],
  ["Pápulas y pústulas", "Pueden aparecer con comedones y nódulos", "Pueden aparecer sobre eritema centrofacial sin comedones"],
  ["Eritema y flushing", "Enrojecimiento inflamatorio variable", "Flushing recurrente y eritema persistente son pistas relevantes"],
  ["Distribución", "Cara, espalda y tórax", "Predominio centrofacial, aunque hay variaciones"],
  ["Sensación cutánea", "Variable", "Ardor, escozor y sensibilidad pueden ser prominentes"],
  ["Ojos", "No son una manifestación habitual del acné", "Puede haber síntomas oculares que requieren evaluación"]
];
const faq = [
  {question:"¿La rosácea produce espinillas?",answer:"Puede producir pápulas y pústulas parecidas a brotes de acné, pero los comedones no son característicos de rosácea."},
  {question:"¿Puedo tener acné y rosácea al mismo tiempo?",answer:"Sí. La coexistencia es posible y cambia la interpretación de lesiones y tolerancia a los tratamientos."},
  {question:"¿El enrojecimiento significa rosácea?",answer:"No necesariamente. Irritación, dermatitis y otras causas también producen eritema; importa la historia y exploración."},
  {question:"¿Cuándo conviene consultar?",answer:"Cuando hay brotes persistentes, dolor, cicatrices, flushing recurrente, irritación importante o síntomas oculares. Dolor ocular, fotofobia o cambios visuales requieren evaluación pronta."}
];
const refs = [
  {name:"Reynolds et al. AAD acne guideline, JAAD 2024. PMID 38300170",url:"https://pubmed.ncbi.nlm.nih.gov/38300170/"},
  {name:"Schaller et al. ROSCO 2019 update, Br J Dermatol 2020. PMID 31392722",url:"https://pubmed.ncbi.nlm.nih.gov/31392722/"},
  {name:"AAD. Is that acne or rosacea on your skin?",url:"https://www.aad.org/public/diseases/acne/really-acne/acne-rosacea"}
];
export default function AcneVsRosacea() {
 const graph={"@context":"https://schema.org","@graph":[
  {"@type":"Article","@id":pageUrl+"#article",headline:article.title,description:article.description,url:pageUrl,inLanguage:"es-MX",datePublished:article.preparedAt,author:{"@id":siteConfig.url+"#clinic"},publisher:{"@id":siteConfig.url+"#clinic"}},
  {"@type":"BreadcrumbList","@id":pageUrl+"#breadcrumb",itemListElement:[{"@type":"ListItem",position:1,name:"Inicio",item:siteConfig.url},{"@type":"ListItem",position:2,name:"Journal",item:siteConfig.url+"/journal"},{"@type":"ListItem",position:3,name:article.title,item:pageUrl}]},
  {"@type":"FAQPage","@id":pageUrl+"#faq",mainEntity:faq.map(x=>({"@type":"Question",name:x.question,acceptedAnswer:{"@type":"Answer",text:x.answer}}))}
 ]};
 return <main><article className="mx-auto w-[min(960px,calc(100%-32px))] py-16 lg:py-24">
  <Link href="/journal" className="text-sm text-muted">HAUTLAB Journal / Dermatología clínica</Link>
  <p className="mt-10 text-xs uppercase tracking-[.2em] text-champagne">Comparativa clínica · {article.readingTime}</p>
  <h1 className="mt-5 font-serif text-[clamp(2.8rem,6vw,5.6rem)] leading-tight text-bone">{article.title}</h1>
  <p className="mt-6 text-lg leading-8 text-muted">{article.description}</p>
  <p className="mt-4 text-xs text-muted">Preparado: 13 de octubre de 2026 · Pendiente de revisión médica final</p>
  <section className="mt-14 border-t border-line pt-10"><h2 className="font-serif text-3xl text-bone">La diferencia no está en que ambos produzcan granitos</h2>
   <p className="mt-5 leading-8 text-muted">El acné afecta la unidad pilosebácea y suele incluir comedones. La rosácea puede presentar pápulas y pústulas, pero destacan en algunos pacientes el flushing, el eritema centrofacial persistente, los vasos visibles y la sensibilidad. Ninguna señal aislada confirma un diagnóstico.</p>
  </section>
  <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Comparación de signos clínicos</h2>
   <div className="mt-7 overflow-x-auto"><table className="w-full border-collapse text-left text-sm leading-7"><thead><tr className="border-b border-line text-bone"><th className="p-3">Hallazgo</th><th className="p-3">Acné</th><th className="p-3">Rosácea</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]} className="border-b border-line text-muted">{r.map((v,i)=><td key={i} className="p-3 align-top">{v}</td>)}</tr>)}</tbody></table></div>
  </section>
  <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Por qué importa diferenciarlos</h2>
   <p className="mt-5 leading-8 text-muted">El tratamiento del acné se orienta al tipo y gravedad de lesiones, riesgo de cicatrices y tolerancia. La guía AAD 2024 respalda distintas terapias tópicas y sistémicas según el caso; eso no significa que una rutina antiacné sea adecuada para toda persona con rosácea. La selección para rosácea se guía por manifestaciones clínicas, incluidos componentes vasculares, inflamatorios y oculares.</p>
   <p className="mt-5 leading-8 text-muted">También pueden coexistir. Un paciente con comedones y flushing puede requerir valorar ambas entidades, sin asumir que todos los brotes comparten la misma causa. La dermatitis periorificial, dermatitis seborreica y reacciones irritativas forman parte de los diagnósticos alternativos.</p>
   <p className="mt-5 leading-8 text-muted">La evidencia de las guías es más sólida para tratamientos específicos del acné; esta tabla es una ayuda de orientación clínica, no una prueba diagnóstica validada ni una comparación de eficacia terapéutica.</p>
   <p className="mt-5 leading-8 text-muted">Consulta también <Link className="underline" href="/procedimientos/acne">acné</Link>, <Link className="underline" href="/procedimientos/rosacea">rosácea</Link> y <Link className="underline" href="/journal/rosacea-barrera-cutanea-irritar-no-es-tratar">rosácea y barrera cutánea</Link>.</p>
  </section>
  <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Preguntas frecuentes</h2><div className="mt-6 divide-y divide-line">{faq.map(x=><div key={x.question} className="py-5"><h3 className="font-medium text-bone">{x.question}</h3><p className="mt-2 leading-7 text-muted">{x.answer}</p></div>)}</div></section>
  <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Fuentes y revisión</h2><ul className="mt-5 space-y-3 text-sm text-muted">{refs.map(x=><li key={x.url}><a className="underline" href={x.url} target="_blank" rel="noreferrer">{x.name}</a></li>)}</ul><p className="mt-6 text-sm leading-7 text-muted">Revisión médica pendiente: criterios de coexistencia, diferencial de eritema y brotes, signos oculares y lenguaje de derivación. Contenido educativo, no diagnóstico individual.</p></section>
 </article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}}/></main>;
}