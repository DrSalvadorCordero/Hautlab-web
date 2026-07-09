import { testimonials } from "@/data/site";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";

export function TestimonialsSection() {
  return (
    <section className="border-b border-line bg-background py-20 lg:py-28" id="testimonios">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <Reveal>
          <div className="mb-12 max-w-3xl">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-champagne">Testimonios</p>
            <h2 className="font-serif text-[clamp(2.6rem,5vw,4.8rem)] leading-[.95] tracking-[-.055em] text-bone">
              Experiencias discretas, reales y sin exageración.
            </h2>
            <p className="mt-6 text-sm leading-7 text-muted">
              Placeholder temporal: cuando entregues el archivo CSV o XML con testimonios reales, se reemplaza este arreglo en data/site.ts manteniendo el mismo diseño.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item, index) => (
            <Reveal key={`${item.detail}-${index}`} delay={index * 0.05}>
              <Card className="h-full p-6">
                <p className="text-4xl leading-none text-champagne/70">“</p>
                <p className="mt-4 text-sm leading-7 text-muted">{item.quote}</p>
                <div className="mt-8 border-t border-line pt-5">
                  <p className="text-sm text-bone">{item.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-quiet">{item.detail}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
