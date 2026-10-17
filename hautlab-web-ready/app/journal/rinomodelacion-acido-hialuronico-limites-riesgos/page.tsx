import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { journalArticleBySlug } from "@/data/journal";

const article = journalArticleBySlug["rinomodelacion-acido-hialuronico-limites-riesgos"];
const url = siteConfig.url + "/journal/" + article.slug;
export const metadata: Metadata = {
 title:"Rinomodelación con ácido hialurónico: riesgos y límites | HAUTLAB",
 description:article.description,alternates:{canonical:url},
 openGraph:{title:article.title,description:article.description,url,type:"article",locale:"es_MX"}
};
const faqs=[
 ["¿La rinomodelación reduce el tamaño de la nariz?","No elimina hueso ni cartílago. Añadir volumen puede modificar la percepción del perfil, pero no equivale a reducir el tamaño anatómico."],
 ["¿La rinomodelación sustituye una rinoplastia?","No. Son procedimientos con posibilidades y riesgos diferentes. La cirugía puede modificar estructuras y abordar determinados problemas funcionales; el relleno no."],
 ["¿Puede causar pérdida de visión?","Sí. Es una complicación infrecuente pero grave documentada tras rellenos nasales. No existe una técnica que garantice riesgo cero."],
 ["¿Se puede disolver el ácido hialurónico?","La hialuronidasa puede degradar rellenos de ácido hialurónico, pero no garantiza revertir una lesión vascular ni recuperar la visión."],
 ["¿Qué síntomas requieren atención urgente?","Dolor intenso o creciente, palidez o cambios reticulados de color en la piel, alteraciones visuales, dolor ocular o síntomas neurológicos requieren evaluación inmediata."]
];
const references=[
 ["Song et al. Revisión sistemática de rinomodelación no quirúrgica (2024), PMID 38862661","https://pubmed.ncbi.nlm.nih.gov/38862661/"],
 ["Mortada et al. Revisión sistemática de rinomodelación con AH (2024), PMID 37217605","https://pubmed.ncbi.nlm.nih.gov/37217605/"],
 ["Ma et al. Revisión sistemática de técnicas y complicaciones (2025), PMID 40897966","https://pubmed.ncbi.nlm.nih.gov/40897966/"],
 ["Consenso internacional sobre pérdida visual embólica por AH (2020)","https://academic.oup.com/asj/article/40/9/1009/5613968"],
 ["Revisión sistemática de pérdida visual tras rinomodelación (2025)","https://pmc.ncbi.nlm.nih.gov/articles/PMC12076388/"]
];
export default function Page(){
 const schema={"@context":"https://schema.org","@graph":[
 {"@type":"Article","@id":url+"#article",headline:article.title,description:article.description,url,inLanguage:"es-MX",datePublished:article.preparedAt},
 {"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Inicio",item:siteConfig.url},{"@type":"ListItem",position:2,name:"Journal",item:siteConfig.url+"/journal"},{"@type":"ListItem",position:3,name:article.title,item:url}]},
 {"@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}
 ]};
 return <main><article className="mx-auto w-[min(920px,calc(100%-32px))] py-16 lg:py-24">
 <Link href="/journal" className="text-sm text-muted">HAUTLAB Journal / Medicina estética</Link>
 <p className="mt-10 text-xs uppercase tracking-[.2em] text-champagne">Seguridad clínica · 10 min</p>
 <h1 className="mt-5 font-serif text-[clamp(2.7rem,6vw,5rem)] leading-tight text-bone">{article.title}</h1>
 <p className="mt-6 text-lg leading-8 text-muted">{article.description}</p>
 <p className="mt-4 text-xs text-muted">Preparado el 16 de octubre de 2026 · Revisión médica final pendiente</p>
 <section className="mt-14 border-t border-line pt-10"><h2 className="font-serif text-3xl text-bone">Respuesta breve</h2>
 <p className="mt-5 leading-8 text-muted">La rinomodelación con ácido hialurónico añade material para modificar determinadas transiciones del contorno nasal. No reduce el esqueleto nasal ni corrige de manera equivalente los problemas funcionales que requieren valoración otorrinolaringológica o quirúrgica. Su carácter ambulatorio no elimina riesgos graves.</p></section>
 <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Qué puede cambiar y qué no</h2>
 <p className="mt-5 leading-8 text-muted">En pacientes seleccionados puede camuflar algunas irregularidades leves del dorso o mejorar la continuidad visual del perfil. No elimina una giba ósea, no estrecha físicamente la estructura nasal ni sustituye una cirugía cuando se necesita modificar hueso, cartílago o vía aérea. Añadir volumen a una nariz no siempre la hace parecer menor: la indicación exige valorar proporciones y expectativas.</p>
 <p className="mt-5 leading-8 text-muted">La duración del resultado es variable. Tampoco conviene asumir que el producto desaparecerá por completo en una fecha exacta. Ante antecedentes de cirugía nasal, cicatrices, rellenos previos o alteraciones vasculares, la evaluación debe ser especialmente cuidadosa.</p></section>
 <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Riesgos: frecuentes y poco frecuentes no significan lo mismo</h2>
 <p className="mt-5 leading-8 text-muted">Edema, sensibilidad, hematomas y asimetrías se describen entre los eventos habituales. En cambio, la oclusión arterial, la isquemia y necrosis cutánea, la pérdida visual y eventos neurológicos son complicaciones infrecuentes, pero potencialmente devastadoras.</p>
 <p className="mt-5 leading-8 text-muted">Las revisiones sistemáticas reúnen series clínicas heterogéneas y casos publicados. Algunas estiman proporciones de complicaciones vasculares, pero la selección de pacientes, las diferencias entre técnicas y el subregistro impiden convertir esas cifras en una predicción individual fiable. Un porcentaje pequeño no significa que el riesgo sea aceptable para cualquier persona.</p>
 <p className="mt-5 leading-8 text-muted">La región nasal presenta conexiones vasculares relevantes con la circulación oftálmica. Las revisiones de casos de pérdida visual describen recuperación limitada incluso con intervenciones; la hialuronidasa no garantiza revertir una embolización ocular. Ningún plano, instrumento o maniobra vuelve el procedimiento libre de riesgo.</p></section>
 <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Selección, consentimiento y alternativas</h2>
 <p className="mt-5 leading-8 text-muted">La valoración debe incluir exploración del contorno y la piel, antecedentes de procedimientos, objetivos reales, explicación de limitaciones y discusión explícita de complicaciones graves y respuesta de emergencia. Puede ser preferible no inyectar si la expectativa es reducir tamaño, corregir obstrucción respiratoria o alcanzar un cambio que exige cirugía.</p>
 <p className="mt-5 leading-8 text-muted">Las alternativas incluyen no intervenir, observación, reevaluación fotográfica y consulta con cirugía plástica u otorrinolaringología para deformidades estructurales o funcionales. La comparación no implica que la cirugía carezca de riesgos; responde a objetivos anatómicos distintos.</p></section>
 <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Señales de alarma después de un relleno nasal</h2>
 <p className="mt-5 leading-8 text-muted">Alteraciones súbitas de visión, dolor ocular, debilidad, dificultad para hablar o síntomas neurológicos requieren atención de urgencia inmediata. Dolor intenso, palidez, cambios violáceos o reticulados de la piel y empeoramiento rápido también exigen evaluación urgente por posible compromiso vascular. No esperar a una revisión programada ni intentar resolver estos síntomas en casa.</p></section>
 <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Preguntas frecuentes</h2><div className="mt-6 divide-y divide-line">{faqs.map(([q,a])=><div className="py-5" key={q}><h3 className="font-medium text-bone">{q}</h3><p className="mt-2 leading-7 text-muted">{a}</p></div>)}</div></section>
 <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Lecturas relacionadas</h2><p className="mt-5 leading-8 text-muted">Conoce la <Link className="underline" href="/procedimientos/rinomodelacion">valoración de rinomodelación</Link> y nuestra reflexión sobre <Link className="underline" href="/journal/mas-volumen-no-es-mas-armonia">proporción y exceso de volumen</Link>. Este artículo informa, no reemplaza la valoración individual.</p></section>
 <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Fuentes y nivel de certeza</h2><p className="mt-5 leading-8 text-muted">Las revisiones sistemáticas respaldan la existencia de complicaciones graves y describen resultados clínicos; no establecen una incidencia personal precisa. El consenso sobre pérdida visual es una recomendación de expertos, no evidencia de eficacia garantizada de una intervención.</p><ul className="mt-5 space-y-3 text-sm text-muted">{references.map(([name,href])=><li key={href}><a className="underline" href={href} target="_blank" rel="noreferrer">{name}</a></li>)}</ul><p className="mt-6 text-sm text-muted">Pendiente de aprobación médica: descripción de no candidatura, lenguaje de riesgo ocular, urgencias y alternativas quirúrgicas.</p></section>
 </article><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/></main>;
}