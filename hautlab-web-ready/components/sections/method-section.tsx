import { methodSteps } from "@/data/site";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";

export function MethodSection() {
  return (
    <section className="border-b border-line bg-background py-20 lg:py-28" id="metodo">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <div className="sticky top-28">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-champagne">Método HAUTLAB</p>
              <h2 className="font-serif text-[clamp(2.6rem,5vw,4.8rem)] leading-[.95] tracking-[-.055em] text-bone">
                Primero se evalúa. Después se decide.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted">
                La consulta no empieza preguntando qué procedimiento quieres. Empieza entendiendo qué necesita tu rostro o tu piel.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {methodSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={index * 0.06}>
                  <Card className="min-h-[260px] bg-gradient-to-b from-white/[0.06] to-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-champagne/40">
                    <div className="mb-8 flex items-center justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-full border border-line bg-background/60 text-champagne">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] text-quiet">0{index + 1}</span>
                    </div>
                    <h3 className="text-2xl font-medium tracking-[-0.04em] text-bone">{step.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted">{step.text}</p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
