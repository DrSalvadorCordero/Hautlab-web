import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Languages,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const pageUrl = `${siteConfig.url}/en`;

export const metadata: Metadata = {
  title: "Clinical Dermatology and Medical Aesthetics in Mérida | HAUTLAB",
  description:
    "Private clinical dermatology, facial medical aesthetics and individualized skin care in Mérida, Mexico. Evaluation-first care with Dr. Salvador Cordero at HAUTLAB.",
  alternates: {
    canonical: pageUrl,
    languages: {
      en: pageUrl,
      "es-MX": siteConfig.url,
      "x-default": siteConfig.url
    }
  },
  openGraph: {
    title: "Clinical Dermatology and Medical Aesthetics in Mérida | HAUTLAB",
    description:
      "Private, evaluation-first care for skin health, facial design and measured aesthetic outcomes in Mérida, Mexico.",
    url: pageUrl,
    siteName: "HAUTLAB",
    locale: "en_US",
    alternateLocale: ["es_MX"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinical Dermatology and Medical Aesthetics in Mérida | HAUTLAB",
    description: "Private medical evaluation and individualized treatment planning in Mérida, Mexico."
  }
};

const careAreas = [
  {
    icon: Stethoscope,
    title: "Clinical dermatology",
    description:
      "Evaluation and treatment planning for acne, rosacea, melasma, hair loss, dermatitis, vitiligo, nail disorders and other skin concerns.",
    note: "Diagnosis and prescription require an individual medical evaluation."
  },
  {
    icon: Sparkles,
    title: "Facial medical aesthetics",
    description:
      "Botulinum toxin, hyaluronic acid, nonsurgical nose contouring, lips, under-eye correction, chin, jawline and facial harmonization when clinically indicated.",
    note: "The objective is proportion, support and restraint—not visible overcorrection."
  },
  {
    icon: ShieldCheck,
    title: "Skin quality and regenerative support",
    description:
      "Medical peels, acne-scar strategies, biostimulators, skin boosters and selected texture protocols based on skin condition, downtime and objectives.",
    note: "Technology and products are selected after assessment, not sold as fixed packages."
  },
  {
    icon: CheckCircle2,
    title: "Focused dermatologic procedures",
    description:
      "Assessment of moles and lesions, dermoscopy, warts, cysts, biopsies and selected office procedures with appropriate documentation and follow-up.",
    note: "Suspicious, inflamed or complex lesions are prioritized medically."
  },
  {
    icon: Sparkles,
    title: "HAUTLAB Dermatocosmetic Studio",
    description:
      "Non-medical facial protocols coordinated by Karen Cruz within HAUTLAB standards, with clear referral to medical evaluation whenever a diagnosis or prescription may be needed.",
    note: "The studio is an internal HAUTLAB unit, not an independent medical service."
  }
];

const approach = [
  {
    number: "01",
    title: "Medical evaluation",
    description: "Your concern, history, anatomy, skin condition, priorities and relevant risks are reviewed before proposing treatment."
  },
  {
    number: "02",
    title: "Indication and plan",
    description: "You receive a direct recommendation: what is appropriate, what is optional, what should wait and what should not be done."
  },
  {
    number: "03",
    title: "Procedure or treatment",
    description: "When indicated and logistically appropriate, treatment is performed with conservative planning and documented aftercare."
  },
  {
    number: "04",
    title: "Follow-up",
    description: "A follow-up route is defined before you leave Mérida, including expected evolution, warning signs and when reassessment is required."
  }
];

const faqs = [
  {
    question: "Do you see patients who are visiting Mérida?",
    answer:
      "Yes. Contact HAUTLAB before booking travel so availability, the type of evaluation and any realistic same-day options can be coordinated in advance. English-language appointment coordination can be requested through WhatsApp."
  },
  {
    question: "Can I reserve a specific procedure without an evaluation?",
    answer:
      "No medical or injectable procedure is guaranteed before assessment. A requested procedure may be modified, postponed or declined if the indication, anatomy, skin condition or risk profile does not support it."
  },
  {
    question: "What is the consultation fee?",
    answer:
      "The private medical evaluation is MXN $1,300. When an aesthetic procedure is appropriately scheduled from that evaluation, the consultation fee may be applied toward the final procedure total."
  },
  {
    question: "Can photographs replace an in-person diagnosis?",
    answer:
      "No. Photographs can help organize the appointment and identify obvious warning signs, but they do not replace examination, palpation, dermoscopy or a complete medical history."
  },
  {
    question: "What is the difference between the Dermatocosmetic Studio and medical care?",
    answer:
      "The Dermatocosmetic Studio provides non-medical skin-care protocols. It does not diagnose, prescribe or perform medical procedures. Any active disease, suspicious lesion, severe inflammation or need for prescription is referred to medical evaluation."
  },
  {
    question: "Is HAUTLAB an emergency service?",
    answer:
      "No. Sudden vision loss, intense pain, breathing difficulty, rapidly progressive discoloration, severe allergic symptoms or other acute warning signs require immediate emergency care."
  }
];

function audienceCopy(audience: string | null, city: string | null) {
  if (audience === "international") {
    return {
      eyebrow: "HAUTLAB · Private medical care in Mérida, Mexico",
      context: city
        ? `You are viewing the international version from ${city}. Appointment planning can be coordinated before travel.`
        : "Appointment planning for international visitors can be coordinated before travel."
    };
  }

  if (audience === "quintana-roo") {
    return {
      eyebrow: "HAUTLAB · Mérida for patients visiting from Quintana Roo",
      context: "Coordinate your evaluation before traveling from Cancún, Playa del Carmen, Tulum or elsewhere in Quintana Roo."
    };
  }

  if (audience === "campeche") {
    return {
      eyebrow: "HAUTLAB · Mérida for patients visiting from Campeche",
      context: "Coordinate your evaluation and realistic treatment timing before traveling to Mérida."
    };
  }

  return {
    eyebrow: "HAUTLAB + Dr. Salvador Cordero · Mérida, Mexico",
    context: "Private clinical dermatology and medical aesthetics by appointment."
  };
}

export default async function EnglishHomePage() {
  const requestHeaders = await headers();
  const audience = requestHeaders.get("x-hautlab-audience");
  const city = requestHeaders.get("x-hautlab-city");
  const contextualCopy = audienceCopy(audience, city);
  const bookingMessage =
    "Hello, I would like to schedule a private evaluation at HAUTLAB in Mérida. I am contacting you through the English website.";
  const travelMessage =
    "Hello, I am planning to visit Mérida and would like to coordinate a medical evaluation at HAUTLAB before booking my trip.";

  const clinicSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalClinic",
        "@id": `${siteConfig.url}#clinic`,
        name: "HAUTLAB",
        alternateName: "HAUTLAB + Dr. Salvador Cordero",
        url: pageUrl,
        description:
          "Private clinical dermatology, facial medical aesthetics and individualized skin treatment planning in Mérida, Mexico.",
        telephone: siteConfig.whatsappDisplay,
        priceRange: "$$$",
        availableLanguage: ["Spanish", "English appointment coordination"],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Calle 43 #299A x 32A, San Ramón Norte",
          addressLocality: "Mérida",
          addressRegion: "Yucatán",
          postalCode: "97117",
          addressCountry: "MX"
        },
        founder: { "@id": `${siteConfig.url}#physician` },
        sameAs: [siteConfig.instagram]
      },
      {
        "@type": "Physician",
        "@id": `${siteConfig.url}#physician`,
        name: "Dr. Salvador Cordero Romero",
        jobTitle: "Médico Cirujano",
        identifier: "Mexican Professional License 11804418",
        description: "Medical practice focused on clinical dermatology, medical aesthetics and facial design.",
        knowsAbout: ["Clinical dermatology", "Medical aesthetics", "Facial design", "Skin quality"],
        worksFor: { "@id": `${siteConfig.url}#clinic` }
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq-schema`,
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "HAUTLAB", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "English", item: pageUrl }
        ]
      }
    ]
  };

  return (
    <main className="pb-24 lg:pb-0">
      <section className="relative overflow-hidden border-b border-line bg-aurora">
        <div className="absolute inset-0 opacity-25 [background:linear-gradient(90deg,rgba(242,238,231,.06)_1px,transparent_1px),linear-gradient(180deg,rgba(242,238,231,.04)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="relative mx-auto grid min-h-[calc(100svh-80px)] w-[min(1180px,calc(100%-32px))] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.25em] text-champagne">{contextualCopy.eyebrow}</p>
            <h1 className="max-w-4xl font-serif text-[clamp(3.1rem,7vw,6.6rem)] leading-[.9] tracking-[-.065em] text-bone">
              Clinical judgment. Restrained aesthetics.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted md:text-xl">
              Private evaluation for skin health, facial medical aesthetics and individualized treatment planning in Mérida.
            </p>
            <p className="mt-5 max-w-xl text-base leading-7 text-quiet">{contextualCopy.context}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={buildWhatsAppLink(bookingMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_en_hero">
                  Request an evaluation <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#care">Explore areas of care</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs uppercase tracking-[0.14em] text-quiet">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-champagne" /> Mérida, Yucatán</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-champagne" /> Appointments only</span>
              <Link href="/" hrefLang="es-MX" className="inline-flex items-center gap-2 text-bone transition hover:text-champagne"><Languages className="h-4 w-4" /> Español</Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-line bg-white/[0.045] p-3 shadow-calm backdrop-blur">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[1.45rem] border border-line bg-soft">
              <Image
                src="/visuals/dr-salvador-cordero-portrait-final.webp"
                alt="Dr. Salvador Cordero at HAUTLAB in Mérida, Mexico"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/5 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 rounded-[1.35rem] border border-line bg-background/78 p-5 backdrop-blur-xl">
                <p className="text-sm font-medium text-bone">Dr. Salvador Cordero</p>
                <p className="mt-2 text-xs leading-5 text-muted">Medical Doctor · Clinical and Aesthetic Dermatology Practice</p>
                <p className="mt-1 text-xs text-quiet">Mexican Professional License 11804418</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background py-10">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-4 md:grid-cols-3">
          {[
            ["Evaluation first", "No injectable or medical procedure is guaranteed before assessment."],
            ["Measured outcomes", "Planning favors proportion, safety and a result that remains credible."],
            ["Defined follow-up", "Expected evolution, aftercare and warning signs are explained clearly."]
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-line bg-white/[0.025] p-5">
              <p className="text-sm font-medium text-bone">{title}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="care" className="scroll-mt-28 border-b border-line bg-soft/25 py-20 lg:py-28">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Areas of care</p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[.94] tracking-[-.055em] text-bone">
              The treatment follows the indication—not the trend.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              HAUTLAB combines medical evaluation, conservative aesthetic planning and structured follow-up. The correct route may be treatment, observation, referral or no procedure at all.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {careAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Card key={area.title} className="p-6 sm:p-7">
                  <Icon className="h-6 w-6 text-champagne" />
                  <h3 className="mt-6 text-2xl font-medium tracking-[-0.04em] text-bone">{area.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{area.description}</p>
                  <p className="mt-5 border-t border-line pt-5 text-xs leading-6 text-quiet">{area.note}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="approach" className="scroll-mt-28 border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Clinical approach</p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[.94] tracking-[-.055em] text-bone">
              A clear sequence, with no pressure to proceed.
            </h2>
            <div className="mt-8 rounded-[1.75rem] border border-line bg-white/[0.03] p-6">
              <CircleDollarSign className="h-6 w-6 text-champagne" />
              <p className="mt-5 text-sm font-medium text-bone">Private medical evaluation: {siteConfig.consultationPrice}</p>
              <p className="mt-3 text-xs leading-6 text-muted">
                For an aesthetic procedure appropriately scheduled from the evaluation, the consultation fee may be applied toward the final procedure total.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {approach.map((step) => (
              <Card key={step.number} className="p-6 sm:p-7">
                <p className="text-xs uppercase tracking-[0.2em] text-champagne">{step.number}</p>
                <h3 className="mt-5 text-2xl font-medium tracking-[-0.04em] text-bone">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="travel" className="scroll-mt-28 border-b border-line bg-aurora py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">For visiting patients</p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[.94] tracking-[-.055em] text-bone">
              Coordinate the medical plan before booking the trip.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted">
              The goal is not to compress every request into one visit. It is to determine what can be evaluated safely, what may be treated the same day and what requires staged care or local follow-up.
            </p>
            <Button asChild size="lg" className="mt-8">
              <a href={buildWhatsAppLink(travelMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_en_travel">
                Coordinate before travel <Plane className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="space-y-4">
            {[
              ["Before travel", "Share the main concern, relevant history, current medication and preferred dates. Do not send sensitive clinical information unless requested through an appropriate channel."],
              ["At the appointment", "The evaluation takes place at HAUTLAB in San Ramón Norte, Mérida. Bring identification, medication details and previous relevant reports when available."],
              ["Procedure timing", "Some procedures may be possible after evaluation; others require preparation, laboratory review, staged sessions or a different clinical route."],
              ["Before departure", "You receive aftercare, expected evolution, warning signs and the recommended follow-up route."
              ]
            ].map(([title, text]) => (
              <div key={title} className="rounded-[1.75rem] border border-line bg-background/55 p-6 backdrop-blur">
                <div className="flex items-start gap-4">
                  <Clock3 className="mt-1 h-5 w-5 shrink-0 text-champagne" />
                  <div>
                    <h3 className="text-lg font-medium text-bone">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background py-20 lg:py-28">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Professional boundaries</p>
            <h2 className="mt-4 font-serif text-[clamp(2.7rem,5vw,4.7rem)] leading-[.94] tracking-[-.055em] text-bone">
              Safety includes knowing when not to perform a procedure.
            </h2>
          </div>
          <Card className="p-7 sm:p-9">
            <ShieldCheck className="h-7 w-7 text-champagne" />
            <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
              <p>HAUTLAB does not promise a result before evaluating anatomy, skin condition, medical history and realistic limitations.</p>
              <p>Active infection, uncontrolled inflammation, suspicious lesions, incompatible medication, unrealistic expectations or insufficient follow-up may require postponement, referral or refusal of treatment.</p>
              <p>Photographs, online messages and marketing content are informational and never replace informed consent or an individual medical decision.</p>
            </div>
          </Card>
        </div>
      </section>

      <section id="faq" className="scroll-mt-28 border-b border-line bg-soft/25 py-20 lg:py-28">
        <div className="mx-auto w-[min(980px,calc(100%-32px))]">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-champagne">Frequently asked questions</p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,5vw,4.8rem)] leading-[.94] tracking-[-.055em] text-bone">
              Important before requesting an appointment.
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map((item) => (
              <details key={item.question} className="group rounded-[1.5rem] border border-line bg-background/60 p-6">
                <summary className="cursor-pointer list-none pr-8 text-base font-medium text-bone [&::-webkit-details-marker]:hidden">
                  {item.question}
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto w-[min(980px,calc(100%-32px))] rounded-[2.25rem] border border-line bg-aurora p-8 text-center shadow-calm sm:p-12 lg:p-16">
          <p className="text-xs uppercase tracking-[0.22em] text-champagne">Private appointment in Mérida</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-[clamp(2.8rem,6vw,5.4rem)] leading-[.92] tracking-[-.06em] text-bone">
            Start with the evaluation, not the procedure.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted">
            Contact HAUTLAB with your main concern and preferred dates. Availability and the appropriate clinical route will be confirmed directly.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <a href={buildWhatsAppLink(bookingMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_en_final">
                Request an appointment <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/" hrefLang="es-MX">View Spanish website</Link>
            </Button>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }} />
    </main>
  );
}
