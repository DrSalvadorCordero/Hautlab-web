import { Reveal } from "@/components/motion/reveal";

export function PhilosophySection() {
  return (
    <section className="relative grid min-h-[82svh] place-items-center overflow-hidden border-b border-line bg-bone px-4 py-24 text-background">
      <div className="absolute inset-0 opacity-[0.16] [background:radial-gradient(circle_at_20%_20%,#8f765e_0,transparent_28%),radial-gradient(circle_at_85%_75%,#c8b39a_0,transparent_30%)]" />
      <Reveal className="relative mx-auto w-[min(1180px,100%)] text-center">
        <p className="mb-8 text-xs font-medium uppercase tracking-[0.28em] text-taupe">Filosofía HAUTLAB</p>
        <h2 className="mx-auto max-w-6xl font-serif text-[clamp(3.4rem,9vw,8.8rem)] leading-[.86] tracking-[-.075em]">
          No hago procedimientos. Rediseño rostros.
        </h2>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-8 text-[#56493d] md:text-lg">
          El procedimiento es una herramienta. La decisión importante es entender proporción, estructura, movimiento y qué conviene no modificar.
        </p>
      </Reveal>
    </section>
  );
}
