import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const featured = [
  {
    title: "Rinomodelación",
    eyebrow: "Diseño facial",
    href: "/procedimientos/rinomodelacion",
    image: "/visuals/hero-architecture.webp",
    text: "Proporción nasal, soporte y transiciones más limpias, sin convertir la nariz en un elemento artificial."
  },
  {
    title: "Toxina botulínica",
    eyebrow: "Expresión",
    href: "/procedimientos/toxina-botulinica",
    image: "/visuals/skin-macro.webp",
    text: "Menos tensión y líneas dinámicas, conservando identidad, movimiento y lectura natural del rostro."
  },
  {
    title: "Acné",
    eyebrow: "Piel y textura",
    href: "/procedimientos/acne",
    image: "/visuals/clinic-office.webp",
    text: "Diagnóstico, barrera, inflamación, pigmento y secuelas ordenados dentro de un plan progresivo."
  }
];

export function FeaturedTreatmentsSection() {
  return (
    <section className="border-b border-line bg-background py-20 lg:py-28" id="destacados">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <Reveal>
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-champagne">Tratamientos destacados</p>
              <h2 className="max-w-3xl font-serif text-[clamp(2.8rem,5vw,5rem)] leading-[.92] tracking-[-.06em] text-bone">
                Menos catálogo. Más criterio.
              </h2>
            </div>
            <Link href="/procedimientos" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-bone">
              Explorar todas las áreas <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-3">
          {featured.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.07}>
              <Link href={item.href} className="group block overflow-hidden rounded-[2rem] border border-line bg-white/[0.03]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-champagne">{item.eyebrow}</p>
                    <h3 className="mt-3 text-3xl font-medium tracking-[-.045em] text-bone">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted">{item.text}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm text-bone">Ver enfoque <ArrowUpRight className="h-4 w-4" /></span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
