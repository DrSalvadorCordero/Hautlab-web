import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";

const article = journalArticleBySlug["antibioticos-para-acne-cuando-usarlos-y-cuando-parar"];
const pageUrl = siteConfig.url + "/journal/" + article.slug;

export const metadata: Metadata = {
  title: "Antibióticos para el acné: cuándo usarlos y cuándo parar | HAUTLAB",
  description: article.description,
  alternates: { canonical: pageUrl },
  openGraph: { title: article.title, description: article.description, url: pageUrl, siteName: "HAUTLAB", locale: "es_MX", type: "article" }
};

const faqs = [
  { q: "¿El acné siempre necesita antibióticos?", a: "No. Muchos casos pueden manejarse con tratamientos tópicos no antibióticos. La decisión depende del tipo de lesiones, extensión, cicatrices, tolerancia y tratamientos previos." },
  { q: "¿Puedo usar clindamicina sola para el acné?", a: "Las guías desaconsejan usar un antibiótico tópico como único tratamiento. Cuando está indicado, suele combinarse con peróxido de benzoilo y un plan individualizado para limitar resistencia." },
  { q: "¿Cuánto tiempo se toma doxiciclina para el acné?", a: "No existe un plazo universal. La guía AAD 2024 aconseja la menor duración posible, habitualmente no más de tres a cuatro meses; NICE recomienda revisar la respuesta a las doce semanas. El prescriptor debe decidir y documentar la duración individual." },
  { q: "¿Por qué se combina un antibiótico con peróxido de benzoilo?", a: "Porque actúan mediante mecanismos diferentes. Las guías recomiendan la combinación para mejorar el control del acné y reducir el riesgo de seleccionar bacterias resistentes." },
  { q: "¿Qué se usa cuando termina el antibiótico?", a: "Según el caso, puede mantenerse un tratamiento tópico no antibiótico, como un retinoide o peróxido de benzoilo. La estrategia depende de tolerancia, actividad residual y contraindicaciones." },
  { q: "¿Qué pasa si el acné reaparece después de los antibióticos?", a: "La recaída no significa automáticamente que haga falta repetirlos. Conviene revisar diagnóstico, adherencia, severidad, cicatrices y alternativas antes de decidir otro ciclo." }
];

const sources = [
  { label: "American Academy of Dermatology. Guidelines of care for the management of acne vulgaris. JAAD, 2024 (PMID 38300170).", href: "https://pubmed.ncbi.nlm.nih.gov/38300170/" },
  { label: "Reynolds et al. Texto completo de la guía AAD 2024, recomendaciones y grado de evidencia.", href: "https://doi.org/10.1016/j.jaad.2023.12.017" },
  { label: "NICE. Acne vulgaris: management, NG198. Publicada 2021, actualizada 30 de abril de 2026.", href: "https://www.nice.org.uk/guidance/ng198" },
  { label: "NICE. NG198, fundamentos de duración de tratamiento, revisión y uso responsable de antibióticos.", href: "https://www.nice.org.uk/guidance/ng198/chapter/Rationale-and-impact" }
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-14"><h2 className="font-serif text-3xl leading-tight text-bone">{title}</h2><div className="mt-5 space-y-5 text-base leading-8 text-muted">{children}</div></section>;
}

export default function AcneAntibioticsArticle() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", "@id": pageUrl + "#article", url: pageUrl, headline: article.title, description: article.description, inLanguage: "es-MX", dateCreated: article.preparedAt, dateModified: article.preparedAt, isPartOf: { "@id": siteConfig.url + "#website" }, breadcrumb: { "@id": pageUrl + "#breadcrumb" } },
      { "@type": "BreadcrumbList", "@id": pageUrl + "#breadcrumb", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Journal", item: siteConfig.url + "/journal" },
        { "@type": "ListItem", position: 3, name: article.title, item: pageUrl }
      ] },
      { "@type": "FAQPage", "@id": pageUrl + "#faq", mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }
    ]
  };

  return <main>
    <article className="mx-auto w-[min(920px,calc(100%-32px))] py-16 lg:py-24">
      <Link href="/journal" className="text-sm text-muted">HAUTLAB Journal / Dermatología clínica</Link>
      <p className="mt-10 text-xs uppercase tracking-[.2em] text-champagne">Tratamiento del acné · Uso responsable de antibióticos</p>
      <h1 className="mt-5 font-serif text-[clamp(2.7rem,6vw,5rem)] leading-tight text-bone">{article.title}</h1>
      <p className="mt-6 text-lg leading-8 text-muted">{article.description}</p>
      <p className="mt-4 text-xs text-muted">Preparado el 23 de octubre de 2026 · Pendiente de revisión médica antes de publicar</p>

      <Section title="Respuesta breve: sí pueden ayudar, pero no son mantenimiento">
        <p>Los antibióticos pueden ser útiles en determinados casos de acné inflamatorio. Sin embargo, no deben convertirse en la única herramienta ni mantenerse indefinidamente porque el acné es una enfermedad multifactorial y el uso innecesario favorece la resistencia antimicrobiana. La estrategia habitual combina mecanismos de acción y prevé desde el inicio cómo retirar el antibiótico sin abandonar el control de la enfermedad.</p>
        <p>La guía de la American Academy of Dermatology (AAD) de 2024 respalda la doxiciclina oral para indicaciones seleccionadas, pero recomienda limitar los antibióticos sistémicos y acompañarlos de tratamiento tópico. La guía NICE NG198, actualizada en abril de 2026, desaconseja expresamente los antibióticos orales o tópicos utilizados solos para tratar el acné.</p>
      </Section>

      <Section title="Por qué el acné no se resuelve únicamente eliminando bacterias">
        <p>En el acné intervienen la obstrucción del folículo, el sebo, la inflamación y la interacción con microorganismos como Cutibacterium acnes. Un antibiótico puede reducir parte de la actividad inflamatoria y bacteriana, pero no sustituye las medidas que actúan sobre la formación de comedones ni el plan de mantenimiento.</p>
        <p>La presencia de bacterias en la piel no significa por sí sola una infección que deba tratarse con antibióticos. Tampoco todo brote de pápulas o pústulas es acné: algunas formas de rosácea, foliculitis y erupciones por medicamentos pueden parecerse. Si el diagnóstico es incorrecto, prolongar un antibiótico puede retrasar el manejo adecuado. Revisa nuestra <Link href="/journal/acne-vs-rosacea-como-distinguir" className="underline text-bone">comparativa de acné y rosácea</Link>.</p>
      </Section>

      <Section title="Cuándo pueden estar indicados los antibióticos">
        <p>Los antibióticos tópicos pueden formar parte de combinaciones para lesiones inflamatorias cuando el médico considera que aportan beneficio. En enfermedad moderada a grave, extensa o con lesiones inflamatorias relevantes, algunos pacientes pueden requerir un antibiótico oral por tiempo limitado, siempre como parte de un plan más amplio.</p>
        <p>La decisión no depende solamente del número de granos. Importan nódulos, dolor, cicatrices, extensión en espalda o pecho, embarazo o posibilidad de embarazo, antecedentes de reacciones adversas, interacciones farmacológicas, tratamientos previos y afectación emocional. En acné severo, con cicatrices o refractario, la AAD recomienda valorar isotretinoína en condiciones apropiadas; no es necesario repetir antibióticos indefinidamente antes de reconsiderar la estrategia.</p>
        <p>Este artículo no indica un antibiótico, dosis ni duración para una persona concreta. Si ya tienes una prescripción, cualquier modificación debe discutirse con quien la indicó.</p>
      </Section>

      <Section title="Por qué no se recomienda clindamicina sola">
        <p>La clindamicina y otros antibióticos tópicos tienen eficacia documentada, pero la monoterapia favorece la selección de bacterias resistentes. La recomendación sólida de la AAD a favor de ciertos antibióticos tópicos no significa recomendarlos aislados: la misma guía señala que deben integrarse en combinaciones adecuadas, habitualmente con peróxido de benzoilo.</p>
        <p>El peróxido de benzoilo tiene evidencia moderada de eficacia y recomendación fuerte en la guía AAD. Se utiliza también por su papel en la reducción del riesgo de resistencia cuando hay antibióticos. No es inocuo: puede irritar, resecar y decolorar telas. Elegir concentración, vehículo y frecuencia requiere considerar la tolerancia de la piel, no simplemente añadir más productos.</p>
        <p>Los retinoides tópicos también cuentan con recomendación fuerte y pueden servir en tratamiento y mantenimiento, según el caso. No son intercambiables con un antibiótico ni apropiados para todas las situaciones, especialmente cuando existe embarazo o posibilidad de embarazo.</p>
      </Section>

      <Section title="Cuánto tiempo: revisar la respuesta es más importante que repetir recetas">
        <p>La AAD 2024 aconseja limitar la exposición a antibióticos sistémicos al menor tiempo posible, habitualmente no más de tres a cuatro meses. NICE plantea revisar el tratamiento inicial a las doce semanas; cuando se requieren antibióticos, su uso más allá de seis meses debe reservarse a circunstancias excepcionales, con revisiones periódicas. Estos son marcos de referencia de guías internacionales, no una receta automática ni una regla regulatoria mexicana.</p>
        <p>En la revisión deben evaluarse nuevas lesiones, inflamación, cicatrices, tolerancia, adherencia y objetivos alcanzados. Si el acné está controlado, puede ser razonable retirar el antibiótico y continuar con un esquema no antibiótico. Si persiste, la decisión es reconsiderar diagnóstico y opciones, no prolongar sin un punto de reevaluación.</p>
        <p>El beneficio puede tardar varias semanas en apreciarse. Suspender y reiniciar por cuenta propia, cambiar tratamientos cada pocos días o utilizar antibióticos sobrantes dificulta la evaluación y puede añadir riesgos.</p>
      </Section>

      <Section title="Riesgos y situaciones que modifican la decisión">
        <p>Además de la resistencia antimicrobiana, los antibióticos orales pueden causar efectos gastrointestinales, fotosensibilidad y otros eventos adversos específicos del medicamento. Las tetraciclinas no son apropiadas en ciertas etapas del embarazo ni para determinados grupos de edad. También deben revisarse medicamentos concomitantes, alergias y antecedentes relevantes.</p>
        <p>El tratamiento tópico puede provocar ardor, descamación o dermatitis irritativa. No todo empeoramiento inicial es una fase normal de adaptación: dolor importante, reacción extensa o síntomas generales requieren valoración. Una reacción alérgica grave o dificultad respiratoria exige atención urgente.</p>
        <p>Las guías AAD y NICE fueron desarrolladas en sus respectivas jurisdicciones. Su evidencia clínica es útil, pero la selección y disponibilidad de medicamentos deben verificarse conforme a la regulación y situación individual en México.</p>
      </Section>

      <Section title="Qué sigue cuando termina el antibiótico">
        <p>El objetivo no es mantener al paciente medicado de forma indefinida, sino sostener el control con la menor exposición necesaria. Según la severidad, la tolerancia y las contraindicaciones, pueden considerarse retinoides tópicos, peróxido de benzoilo u otras opciones no antibióticas como mantenimiento. Las recomendaciones para tratamientos hormonales o isotretinoína requieren una valoración independiente de indicaciones y riesgos.</p>
        <p>Si reaparecen lesiones, primero conviene revisar si el esquema se utilizó correctamente, si hay nuevas cicatrices, si la enfermedad cambió o si el diagnóstico necesita reconsiderarse. La recaída por sí sola no obliga a otro ciclo antibiótico.</p>
        <p>Para saber <Link href="/journal/cuando-consultar-por-acne" className="underline text-bone">cuándo consultar por acné</Link>, revisa nuestra guía clínica. Para una evaluación individual, consulta la página de <Link href="/procedimientos/acne" className="underline text-bone">valoración de acné en HAUTLAB</Link>.</p>
      </Section>

      <Section title="Qué tiene evidencia sólida y qué sigue siendo una decisión clínica">
        <p><strong className="text-bone">Evidencia y recomendaciones fuertes:</strong> la AAD 2024 respalda peróxido de benzoilo, retinoides tópicos y doxiciclina oral en contextos adecuados. También respalda antibióticos tópicos, con la salvedad explícita de no usarlos solos.</p>
        <p><strong className="text-bone">Buenas prácticas y consenso:</strong> combinar mecanismos, limitar antibióticos sistémicos y mantener un plan tópico no antibiótico son principios de uso responsable. Los plazos de revisión y duración orientan, pero la decisión final depende de la respuesta y seguridad de cada paciente.</p>
        <p><strong className="text-bone">No demostrado como regla universal:</strong> que todos los casos necesiten antibióticos, que una mejoría inicial justifique prolongarlos indefinidamente o que un solo producto funcione para todas las formas de acné.</p>
      </Section>

      <section className="mt-14"><h2 className="font-serif text-3xl text-bone">Preguntas frecuentes</h2>
        <div className="mt-6 divide-y divide-line">{faqs.map(({ q, a }) => <div key={q} className="py-5"><h3 className="font-medium text-bone">{q}</h3><p className="mt-2 leading-7 text-muted">{a}</p></div>)}</div>
      </section>
      <section className="mt-14 border-t border-line pt-10"><h2 className="font-serif text-3xl text-bone">Referencias clínicas</h2>
        <p className="mt-4 text-sm leading-7 text-muted">Las recomendaciones AAD provienen de una revisión sistemática con metodología GRADE. NICE aporta recomendaciones de práctica clínica y criterios de revisión; los plazos no sustituyen el juicio médico individual.</p>
        <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">{sources.map(({ label, href }) => <li key={href}><a href={href} target="_blank" rel="noreferrer" className="underline">{label}</a></li>)}</ul>
        <p className="mt-6 text-sm leading-7 text-muted">Información educativa. No sustituye diagnóstico, receta ni seguimiento individual. Redacción editorial pendiente de revisión y autorización médica del Dr. Salvador Cordero antes de publicación.</p>
      </section>
    </article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  </main>;
}
