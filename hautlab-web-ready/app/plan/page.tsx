import type { Metadata } from "next";
import { PlanBuilder } from "@/components/plan/plan-builder";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `Diseña tu plan | ${siteConfig.name}`,
  description:
    "Define tus objetivos y recibe un plan inicial de posibilidades a valorar en HAUTLAB. No sustituye una valoración médica.",
  alternates: { canonical: `${siteConfig.url}/plan` },
};

export default function PlanPage() {
  return (
    <main className="min-h-[80svh] border-b border-line bg-aurora">
      <section className="mx-auto w-[min(1180px,calc(100%-32px))] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-champagne">HAUTLAB Plan</p>
          <h1 className="mt-4 font-serif text-[clamp(3rem,7vw,6rem)] leading-[.92] tracking-[-.06em] text-bone">
            Empieza por el objetivo, no por el procedimiento.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted">
            En pocos pasos ordenamos lo que buscas y te mostramos posibilidades que después deben confirmarse en valoración médica.
          </p>
        </div>
        <PlanBuilder />
      </section>
    </main>
  );
}
