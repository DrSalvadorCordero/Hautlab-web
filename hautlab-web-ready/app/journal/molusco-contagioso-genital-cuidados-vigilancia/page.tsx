import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { journalArticleBySlug } from "@/data/journal";
import { siteConfig } from "@/lib/siteConfig";

const article = journalArticleBySlug["molusco-contagioso-genital-cuidados-vigilancia"];
const pageUrl = siteConfig.url + "/journal/" + article.slug;
const whatsappUrl = "https://wa.me/" + siteConfig.whatsappNumber;

export const metadata: Metadata = {
  title: "Molusco contagioso genital: tratamiento, cuidados y vigilancia | HAUTLAB",
  description: "Qué ocurre después de retirar las lesiones de molusco contagioso genital, cómo cuidar la piel y por qué pueden aparecer nuevas pápulas durante el seguimiento.",
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

const aftercare = [
  {
    number: "01",
    title: "Limpieza suave",
    body: "A partir del momento indicado por el médico, lavar una vez al día con agua y limpiador suave. Secar sin friccionar."
  },
  {
    number: "02",
    title: "Reparación de la barrera",
    body: "Aplicar una capa fina de vaselina pura. Cubrir con apósito no adherente si existe roce, y cambiarlo si se ensucia o humedece."
  },
  {
    number: "03",
    title: "Evitar traumatismos",
    body: "No desprender costras, exprimir ni rasurar la región hasta que haya reepitelizado. Evitar fricción y ropa ajustada."
  },
  {
    number: "04",
    title: "No añadir tratamientos innecesarios",
    body: "No usar alcohol, ácidos, productos para verrugas ni antibióticos tópicos de rutina, salvo indicación médica específica."
  }
];

const prevention = [
  "No manipular ni exprimir ninguna pápula nueva.",
  "Suspender el rasurado o la depilación sobre la piel afectada.",
  "No compartir toallas, rastrillos ni ropa interior; lavarse las manos después del contacto con la zona.",
  "Evitar contacto sexual con lesiones activas. El preservativo reduce ciertos riesgos, pero no cubre toda la piel genital.",
  "Si la pareja presenta lesiones, recomendar valoración, sin asumir automáticamente la fuente del contagio."
];

const timeline = [
  {
    time: "Primeros días",
    description: "Priorizar la cicatrización. Evitar fricción, rasurado y manipulación de la zona."
  },
  {
    time: "Semanas siguientes",
    description: "Observar la piel aproximadamente una vez por semana, sin revisiones compulsivas ni intentos de extracción."
  },
  {
    time: "3–4 semanas",
    description: "Control sugerido para verificar cicatrización y descartar lesiones nuevas; anticiparlo si aparece alguna lesión sospechosa."
  }
];

const faq = [
  {
    question: "¿Si aparece otra pápula significa que me reinfecté?",
    answer: "No necesariamente. Puede ser una lesión que estaba incubándose antes del tratamiento. Debe revisarse, porque tampoco toda pápula nueva corresponde a molusco."
  },
  {
    question: "¿La cauterización elimina el virus para siempre?",
    answer: "Elimina las lesiones tratadas, pero no garantiza que no aparezcan otras ni evita por completo una nueva exposición. La vigilancia y las medidas preventivas siguen siendo importantes."
  },
  {
    question: "¿Cuándo puedo volver a tener relaciones sexuales?",
    answer: "Cuando la piel haya cicatrizado por completo, no existan lesiones activas visibles y tu médico confirme que es apropiado. No hay un número de días universal."
  },
  {
    question: "¿Es lo mismo que una verruga por VPH?",
    answer: "No. Son infecciones por virus distintos y requieren una valoración diagnóstica diferente. La apariencia puede superponerse en algunos casos."
  }
];

const sources = [
  { label: "Centers for Disease Control and Prevention (CDC). Acerca del molusco contagioso.", href: "https://www.cdc.gov/molluscum-contagiosum/es/about/index.html" },
  { label: "American Academy of Dermatology (AAD). Molluscum contagiosum: Diagnosis and treatment.", href: "https://www.aad.org/public/diseases/a-z/molluscum-contagiosum-treatment" },
  { label: "American Academy of Dermatology (AAD). Molluscum contagiosum: Tips for managing.", href: "https://www.aad.org/public/diseases/a-z/molluscum-contagiosum-tips" },
  { label: "American Academy of Dermatology (AAD). Skin biopsy: Dermatologist-recommended wound care.", href: "https://www.aad.org/public/diseases/a-z/skin-biopsy-wound-care" }
];

function ClinicalOrb() {
  return (
    <svg role="img" aria-label="Representación esquemática, no fotográfica, de una pápula cutánea bajo observación clínica" viewBox="0 0 600 660" className="h-full min-h-[320px] w-full">
      <defs>
        <radialGradient id="hautlab-molluscum-orb" cx="33%" cy="28%" r="72%">
          <stop offset="0" stopColor="#e7c9bd" />
          <stop offset=".53" stopColor="#c69e90" />
          <stop offset=".86" stopColor="#a77b6f" />
          <stop offset="1" stopColor="#89665e" />
        </radialGradient>
        <radialGradient id="hautlab-molluscum-glint">
          <stop offset="0" stopColor="#fffbf4" stopOpacity=".78" />
          <stop offset="1" stopColor="#fffdf8" stopOpacity="0" />
        </radialGradient>
        <pattern id="hautlab-molluscum-grid" width="42" height="42" patternUnits="userSpaceOnUse">
          <path d="M 42 0 L 0 0 0 42" fill="none" stroke="#b7aaa0" strokeWidth=".45" opacity=".26" />
        </pattern>
      </defs>
      <rect width="600" height="660" fill="#e5ded6" />
      <rect width="600" height="660" fill="url(#hautlab-molluscum-grid)" />
      <text x="43" y="52" fill="#79726c" fontSize="10" letterSpacing="2.6">ESTUDIO VISUAL / 01</text>
      <circle cx="302" cy="315" r="184" fill="none" stroke="#b5a99f" strokeWidth=".7" />
      <circle cx="302" cy="315" r="155" fill="none" stroke="#b5a99f" strokeWidth=".7" />
      <circle cx="302" cy="315" r="127" fill="none" stroke="#c0b0a7" strokeWidth=".7" />
      <line x1="302" y1="115" x2="302" y2="509" stroke="#aea399" strokeDasharray="2 6" strokeWidth=".8" />
      <line x1="105" y1="315" x2="503" y2="315" stroke="#aea399" strokeDasharray="2 6" strokeWidth=".8" />
      <circle cx="302" cy="315" r="119" fill="#9e766b" opacity=".14" />
      <circle cx="302" cy="305" r="111" fill="url(#hautlab-molluscum-orb)" stroke="#b9978a" strokeWidth="1.3" />
      <ellipse cx="267" cy="265" rx="46" ry="20" transform="rotate(-31 267 265)" fill="#f7e1d6" opacity=".52" />
      <circle cx="337" cy="342" r="44" fill="url(#hautlab-molluscum-glint)" />
      <circle cx="302" cy="305" r="85" fill="none" stroke="#f5d9ce" opacity=".36" strokeWidth=".8" />
      <circle cx="302" cy="305" r="59" fill="none" stroke="#f5d9ce" opacity=".25" strokeWidth=".8" />
      <path d="M 384 230 L 457 184 L 532 184" fill="none" stroke="#77716a" strokeWidth=".85" />
      <circle cx="384" cy="230" r="3" fill="#77716a" />
      <text x="463" y="175" fill="#67625e" fontSize="12">01</text>
      <path d="M 229 378 L 180 420 L 105 420" fill="none" stroke="#77716a" strokeWidth=".85" />
      <circle cx="229" cy="378" r="3" fill="#77716a" />
      <text x="105" y="439" fill="#67625e" fontSize="12">02</text>
      <path d="M 40 586 H 560" stroke="#c6bbb1" strokeWidth="1" />
      <text x="42" y="606" fill="#756e69" fontSize="10" letterSpacing="1.5">FORMA · PIEL · SEGUIMIENTO</text>
      <text x="560" y="606" textAnchor="end" fill="#756e69" fontSize="10" letterSpacing="1.5">HAUTLAB / CLINICAL NOTES</text>
    </svg>
  );
}

export default function MolluscumJournalArticle() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": pageUrl + "#article",
        url: pageUrl,
        headline: article.title,
        description: article.description,
        inLanguage: "es-MX",
        dateCreated: "2026-10-22",
        dateModified: "2026-10-22",
        datePublished: "2026-10-22",
        author: { "@id": siteConfig.url + "#doctor" },
        reviewedBy: { "@id": siteConfig.url + "#doctor" },
        publisher: { "@id": siteConfig.url + "#clinic" },
        isPartOf: { "@id": siteConfig.url + "#website" },
        breadcrumb: { "@id": pageUrl + "#breadcrumb" }
      },
      {
        "@type": "BreadcrumbList",
        "@id": pageUrl + "#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Journal", item: siteConfig.url + "/journal" },
          { "@type": "ListItem", position: 3, name: article.title, item: pageUrl }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": pageUrl + "#faq",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
      }
    ]
  };

  return (
    <main id="contenido-principal" className="bg-[#f7f5f1] text-[#252421]">
      <article>
        <section className="mx-auto grid max-w-[1360px] border-b border-[#dcd4ca] lg:grid-cols-[1.28fr_1fr]">
          <div className="flex min-h-[550px] flex-col justify-center px-6 py-16 sm:px-12 lg:px-[7%]">
            <nav aria-label="Ruta de navegación" className="text-xs tracking-[.07em] text-[#817b74]">
              <Link href="/journal" className="underline-offset-4 hover:underline">Journal</Link>
              <span className="mx-3">/</span> Piel <span className="mx-3">/</span> Dermatología clínica
            </nav>
            <p className="mt-14 text-xs font-semibold uppercase tracking-[.22em] text-[#986d5b]">Piel · Guía clínica</p>
            <h1 className="mt-6 max-w-[780px] font-serif text-[clamp(3rem,5.4vw,5.65rem)] leading-[.97] tracking-[-.065em]">
              Molusco contagioso genital: tratar las lesiones es solo una parte del cuidado.
            </h1>
            <p className="mt-7 max-w-[640px] text-base leading-8 text-[#645e58]">
              Qué ocurre después de retirar las lesiones, cómo cuidar la piel y por qué la vigilancia importa tanto como el procedimiento.
            </p>
            <p className="mt-8 text-xs tracking-[.05em] text-[#746e67]">
              Dr. Salvador Cordero <span className="mx-3">·</span> Lectura 6 min <span className="mx-3">·</span> Octubre 2026
            </p>
          </div>
          <div className="min-h-[450px] bg-[#e5ded6] lg:min-h-[650px]"><ClinicalOrb /></div>
        </section>

        <div className="mx-auto max-w-[1180px] px-6 sm:px-10">
          <aside className="my-12 border-l-2 border-[#9c7260] py-2 pl-6 text-sm leading-7 text-[#5e5a54]">
            <strong className="font-semibold text-[#302d2a]">Nota clínica.</strong> Esta guía describe el manejo general del molusco contagioso una vez establecido el diagnóstico. No toda pápula genital es molusco: algunas lesiones requieren dermatoscopia o biopsia antes de ser destruidas.
          </aside>
          <div className="grid gap-12 border-y border-[#ddd5ca] py-12 md:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#946e5d]">En este artículo</p>
              <h2 className="mt-5 font-serif text-4xl leading-tight">Una guía de cuidado y seguimiento.</h2>
            </div>
            <nav aria-label="Secciones del artículo" className="grid gap-3 sm:grid-cols-2">
              {[
                ["01", "Entender la lesión", "#que-es"],
                ["02", "Cuándo tratar", "#tratamiento"],
                ["03", "Después del procedimiento", "#despues"],
                ["04", "Reducir la transmisión", "#prevenir"],
                ["05", "Vigilancia y nuevas lesiones", "#vigilancia"],
                ["06", "Preguntas frecuentes", "#preguntas"]
              ].map(([number, label, href]) => (
                <a key={href} href={href} className="flex items-baseline gap-4 border-b border-[#e1d9d0] py-3 text-sm transition hover:text-[#9a6b55]">
                  <span className="text-[#a4806d]">{number}</span><span>{label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        <section id="que-es" className="mx-auto grid max-w-[1180px] gap-9 px-6 py-20 sm:px-10 lg:grid-cols-[.72fr_1.28fr] lg:py-28">
          <div>
            <p className="text-xs uppercase tracking-[.2em] text-[#987262]">01 / Entender la lesión</p>
            <h2 className="mt-5 font-serif text-[clamp(2.6rem,4.5vw,4.3rem)] leading-[1.02] tracking-[-.05em]">Una infección cutánea que puede confundirse con otras.</h2>
          </div>
          <div className="space-y-6 text-base leading-8 text-[#5e5a55]">
            <p>El molusco contagioso es una infección superficial de la piel causada por un virus de la familia de los poxvirus. Puede producir pequeñas elevaciones lisas, rosadas o del color de la piel. En ocasiones se observa una depresión central, pero no siempre es evidente.</p>
            <p>En la región genital puede confundirse con acrocordones, foliculitis u otras lesiones, incluidos los condilomas por virus del papiloma humano (VPH). <strong className="font-medium text-[#302b28]">Molusco contagioso y VPH no son la misma infección.</strong></p>
            <p>El diagnóstico suele ser clínico. Cuando la morfología es atípica o la duda persiste, la exploración con aumento y, en algunos casos, una biopsia permiten evitar tratamientos destructivos sobre lesiones no identificadas.</p>
          </div>
        </section>

        <section id="tratamiento" className="bg-[#ece6df]">
          <div className="mx-auto grid max-w-[1180px] gap-9 px-6 py-20 sm:px-10 lg:grid-cols-[.72fr_1.28fr] lg:py-28">
            <div>
              <p className="text-xs uppercase tracking-[.2em] text-[#987262]">02 / Decidir el tratamiento</p>
              <h2 className="mt-5 font-serif text-[clamp(2.6rem,4.5vw,4.3rem)] leading-[1.02] tracking-[-.05em]">Retirar una lesión no equivale a prevenir todas las futuras.</h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-[#5e5a55]">
              <p>Muchas infecciones por molusco desaparecen espontáneamente; sin embargo, cuando las lesiones se localizan en genitales suele recomendarse valoración y tratamiento por el riesgo de transmisión y porque es necesario distinguirlas de otras condiciones.</p>
              <p>Según la localización, el número de lesiones y la valoración médica, pueden emplearse técnicas como curetaje, crioterapia o destrucción focal mediante energía. La electrocauterización no es obligatoria ni superior para todos los casos. Estas técnicas pueden dejar cambios temporales de color y, ocasionalmente, cicatrices.</p>
              <p><strong className="font-medium text-[#302b28]">El objetivo no es solamente eliminar lo visible.</strong> También es proteger la cicatrización y reconocer a tiempo lesiones nuevas.</p>
            </div>
          </div>
        </section>

        <section id="despues" className="mx-auto max-w-[1180px] px-6 py-20 sm:px-10 lg:py-28">
          <p className="text-xs uppercase tracking-[.2em] text-[#987262]">03 / Cuidado posterior</p>
          <h2 className="mt-5 max-w-4xl font-serif text-[clamp(2.8rem,5vw,4.6rem)] leading-[1.01] tracking-[-.055em]">Después de la cauterización: menos productos, mejores cuidados.</h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#5e5a55]">Las indicaciones finales dependen de la profundidad y extensión del procedimiento. Para pequeñas heridas superficiales, estos son los cuidados habituales:</p>
          <div className="mt-12 grid gap-px bg-[#d7cdc2] border border-[#d7cdc2] sm:grid-cols-2">
            {aftercare.map((step) => (
              <div key={step.number} className="bg-[#f7f5f1] p-7 sm:p-10">
                <p className="text-xs tracking-[.22em] text-[#a27a68]">{step.number}</p>
                <h3 className="mt-6 font-serif text-[1.7rem] leading-snug tracking-[-.035em]">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#625d57]">{step.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-9 max-w-4xl text-base leading-8 text-[#5e5a55]">Mientras haya heridas abiertas, evitar albercas, tinas y la inmersión prolongada. Es preferible posponer relaciones sexuales con contacto en la zona hasta la cicatrización completa y la ausencia de lesiones visibles.</p>
          <aside className="mt-9 border-l-2 border-[#9c7260] bg-[#eee7df] p-6 sm:p-8">
            <h3 className="font-serif text-2xl">Señales para consultar antes</h3>
            <p className="mt-3 text-sm leading-7 text-[#5e5a55]">Dolor que aumenta, enrojecimiento que se extiende, calor marcado, pus, fiebre o sangrado persistente requieren nueva valoración. Una leve sensibilidad o coloración rosada inicial puede formar parte de la recuperación.</p>
          </aside>
        </section>

        <section id="prevenir" className="border-y border-[#dbd3ca] bg-[#ece6df]">
          <div className="mx-auto grid max-w-[1180px] gap-9 px-6 py-20 sm:px-10 lg:grid-cols-[.72fr_1.28fr] lg:py-28">
            <div>
              <p className="text-xs uppercase tracking-[.2em] text-[#987262]">04 / Prevención realista</p>
              <h2 className="mt-5 font-serif text-[clamp(2.6rem,4.5vw,4.3rem)] leading-[1.02] tracking-[-.05em]">Cómo reducir la autoinoculación y el contagio.</h2>
            </div>
            <div className="text-base leading-8 text-[#5e5a55]">
              <p>El virus puede transmitirse por contacto directo con lesiones y, en algunas circunstancias, por objetos compartidos. Rascar o afeitar una zona afectada facilita que aparezcan lesiones en áreas cercanas.</p>
              <ul className="mt-8 space-y-4">
                {prevention.map((item) => <li key={item} className="flex gap-4 border-t border-[#d5cac0] pt-4"><span aria-hidden="true" className="text-[#a27a68]">—</span><span>{item}</span></li>)}
              </ul>
              <p className="mt-8">No existe una crema preventiva que garantice que no aparecerán nuevas lesiones. Tampoco se justifica aplicar productos cáusticos sobre toda la región genital.</p>
            </div>
          </div>
        </section>

        <section id="vigilancia" className="mx-auto max-w-[1180px] px-6 py-20 sm:px-10 lg:py-28">
          <p className="text-xs uppercase tracking-[.2em] text-[#987262]">05 / Seguimiento</p>
          <h2 className="mt-5 max-w-4xl font-serif text-[clamp(2.7rem,5vw,4.6rem)] leading-[1.02] tracking-[-.05em]">Una lesión nueva no siempre significa que el tratamiento falló.</h2>
          <p className="mt-7 max-w-4xl text-base leading-8 text-[#5e5a55]">El molusco puede permanecer en incubación durante semanas y, en ocasiones, más tiempo. Por eso, después de retirar las lesiones visibles pueden aparecer otras que aún no eran detectables. También es posible adquirir nuevamente la infección si ocurre otra exposición.</p>
          <div className="mt-11 grid gap-4 md:grid-cols-3">
            {timeline.map((item) => (
              <div key={item.time} className="border-t-2 border-[#ac8874] bg-[#eee8e1] px-6 py-8">
                <h3 className="font-serif text-2xl">{item.time}</h3>
                <p className="mt-4 text-sm leading-7 text-[#5e5a55]">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-9 max-w-4xl text-base leading-8 text-[#5e5a55]">En adultos con lesiones genitales, conviene valorar antecedentes sexuales y ofrecer pruebas para otras infecciones de transmisión sexual según el contexto clínico. No todas las personas requieren los mismos estudios.</p>
        </section>

        <section id="preguntas" className="bg-[#ece6df]">
          <div className="mx-auto max-w-[1180px] px-6 py-20 sm:px-10 lg:py-28">
            <p className="text-xs uppercase tracking-[.2em] text-[#987262]">06 / Preguntas frecuentes</p>
            <h2 className="mt-5 font-serif text-[clamp(2.7rem,5vw,4.6rem)] leading-[1.02] tracking-[-.05em]">Lo que más importa aclarar.</h2>
            <div className="mt-10 divide-y divide-[#d2c8bd] border-y border-[#d2c8bd]">
              {faq.map((item) => (
                <div key={item.question} className="grid gap-4 py-7 md:grid-cols-2 md:gap-12">
                  <h3 className="font-serif text-xl leading-snug">{item.question}</h3>
                  <p className="text-sm leading-7 text-[#5e5a55]">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 py-16 sm:px-10">
          <p className="text-xs uppercase tracking-[.2em] text-[#987262]">Lecturas de respaldo</p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-.045em]">Fuentes clínicas.</h2>
          <ul className="mt-8 space-y-4 text-sm leading-7 text-[#5e5a55]">
            {sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="underline decoration-[#ac8a77] underline-offset-4 hover:text-[#916b59]">{source.label}</a>
              </li>
            ))}
          </ul>
          <p className="mt-9 max-w-4xl text-xs leading-6 text-[#77716b]">Material educativo para público general. No sustituye una valoración médica individual ni constituye diagnóstico de una lesión concreta. La recomendación de control a las 3–4 semanas es una propuesta de seguimiento clínico individualizable.</p>
          <p className="mt-5 text-xs leading-6 text-[#77716b]">Autor y revisión médica: Dr. Salvador Cordero Romero · 22 de octubre de 2026.</p>
        </section>

        <section className="bg-[#2a2b28] px-6 py-20 text-[#f5f1ea] sm:px-10 lg:py-24">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-9 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.22em] text-[#cda995]">HAUTLAB · Mérida</p>
              <h2 className="mt-6 max-w-3xl font-serif text-[clamp(2.7rem,5vw,4.7rem)] leading-[1.02] tracking-[-.055em]">Cuando una lesión genera dudas, la decisión correcta comienza con el diagnóstico.</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d0cbc4]">Valoración médica de piel y procedimientos focales con indicación individual y seguimiento.</p>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center gap-3 border border-[#cda995] px-7 py-4 text-xs uppercase tracking-[.1em] transition hover:bg-[#cda995] hover:text-[#2a2b28]">Solicitar valoración <ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </section>
        <div className="mx-auto flex max-w-[1180px] justify-between px-6 py-7 text-xs text-[#706b66] sm:px-10">
          <Link href="/journal" className="inline-flex items-center gap-2 hover:underline"><ArrowLeft className="h-4 w-4" /> Volver al Journal</Link>
          <span>HAUTLAB / Clinical notes</span>
        </div>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </main>
  );
}
