import Image from "next/image";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/navigation/breadcrumbs";
import { TreatmentSidebar, type RelatedLink } from "@/components/navigation/treatment-sidebar";
import { Card } from "@/components/ui/card";

export type TreatmentPageContent = {
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  breadcrumbs: BreadcrumbItem[];
  category: { label: string; href: string };
  definition: string[];
  indications: string[];
  notIndicated: string[];
  hautlabApproach: string[];
  expectations: Array<{ label: string; value: string }>;
  faq: Array<{ question: string; answer: string }>;
  related: RelatedLink[];
  whatsappMessage: string;
};

export function TreatmentPageLayout({ content }: { content: TreatmentPageContent }) {
  return (
    <main>
      <Breadcrumbs items={content.breadcrumbs} />

      <section className="border-b border-line bg-aurora py-14 lg:py-20">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.24em] text-champagne">{content.eyebrow}</p>
            <h1 className="max-w-4xl font-serif text-[clamp(3.2rem,7vw,6.4rem)] leading-[.9] tracking-[-.065em] text-bone">{content.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">{content.summary}</p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-soft shadow-calm">
            <Image src={content.image} alt={content.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background py-16 lg:py-24">
        <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="space-y-12">
            <section>
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">¿Qué es?</p>
              <div className="mt-5 space-y-5 text-base leading-8 text-muted">
                {content.definition.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <Card className="p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-champagne">Puede estar indicado para</p>
                <div className="mt-5 grid gap-3">
                  {content.indications.map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-6 text-muted"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-champagne" />{item}</div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-champagne">No se fuerza cuando</p>
                <div className="mt-5 grid gap-3">
                  {content.notIndicated.map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-6 text-muted"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-champagne" />{item}</div>
                  ))}
                </div>
              </Card>
            </section>

            <section>
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Enfoque HAUTLAB</p>
              <h2 className="mt-4 max-w-3xl font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[.95] tracking-[-.055em] text-bone">Primero se entiende el rostro. Después se elige la herramienta.</h2>
              <div className="mt-7 space-y-5 text-base leading-8 text-muted">
                {content.hautlabApproach.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>

            <section>
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Qué esperar</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {content.expectations.map((item) => (
                  <Card key={item.label} className="p-5">
                    <Clock3 className="h-5 w-5 text-champagne" />
                    <p className="mt-5 text-xs uppercase tracking-[0.16em] text-quiet">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-bone">{item.value}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Preguntas frecuentes</p>
              <div className="mt-5 divide-y divide-line rounded-[1.75rem] border border-line bg-white/[0.025] px-5">
                {content.faq.map((item) => (
                  <details key={item.question} className="group py-5">
                    <summary className="cursor-pointer list-none pr-8 text-base font-medium text-bone">{item.question}</summary>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </article>

          <TreatmentSidebar category={content.category} related={content.related} whatsappMessage={content.whatsappMessage} />
        </div>
      </section>
    </main>
  );
}
