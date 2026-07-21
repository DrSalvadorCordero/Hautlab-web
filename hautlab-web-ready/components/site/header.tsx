import Link from "next/link";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const areas = [
  {
    title: "Diseño facial",
    href: "/tratamientos/medicina-estetica-facial",
    items: [
      { label: "Rinomodelación", href: "/procedimientos/rinomodelacion" },
      { label: "Toxina botulínica", href: "/procedimientos/toxina-botulinica" },
      { label: "Labios", href: "/procedimientos/labios" },
      { label: "Ojeras", href: "/procedimientos/ojeras" },
      { label: "Mentón", href: "/procedimientos/menton" },
      { label: "Mandíbula", href: "/procedimientos/mandibula" },
      { label: "Armonización facial", href: "/procedimientos/armonizacion-facial" }
    ]
  },
  {
    title: "Piel y textura",
    href: "/tratamientos/calidad-de-piel-y-soporte",
    items: [
      { label: "Cicatrices de acné", href: "/procedimientos/cicatrices-acne" },
      { label: "Bioestimuladores", href: "/procedimientos/bioestimuladores" },
      { label: "Skin booster", href: "/procedimientos/skin-booster" },
      { label: "Hollywood Peel", href: "/procedimientos/hollywood-peel" },
      { label: "Peelings médicos", href: "/procedimientos/peelings-medicos" },
      { label: "Melasma", href: "/procedimientos/melasma" }
    ]
  },
  {
    title: "Condiciones de piel",
    href: "/tratamientos/dermatologia-clinica",
    items: [
      { label: "Acné", href: "/procedimientos/acne" },
      { label: "Rosácea", href: "/procedimientos/rosacea" },
      { label: "Melasma", href: "/procedimientos/melasma" },
      { label: "Alopecia", href: "/procedimientos/alopecia" },
      { label: "Dermatitis", href: "/tratamientos/dermatologia-clinica" },
      { label: "Vitíligo", href: "/tratamientos/dermatologia-clinica" }
    ]
  },
  {
    title: "Procedimientos focales",
    href: "/tratamientos/dermatologia-procedimental",
    items: [
      { label: "Verrugas", href: "/procedimientos/verrugas" },
      { label: "Lunares", href: "/procedimientos/lunares" },
      { label: "Dermatoscopia", href: "/procedimientos/lunares" },
      { label: "Quistes", href: "/tratamientos/dermatologia-procedimental" },
      { label: "Cauterización", href: "/tratamientos/dermatologia-procedimental" },
      { label: "Biopsias", href: "/tratamientos/dermatologia-procedimental" }
    ]
  }
];

const secondaryNav = [
  { label: "Método", href: "/#metodo" },
  { label: "Cabina Dermatocosmética", href: "/cabina" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Pagos", href: "/pagos" }
];

function AreaGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-4 md:grid-cols-2 lg:grid-cols-4"}>
      {areas.map((area) => (
        <div key={area.title} className="rounded-3xl border border-line bg-white/[0.03] p-5 transition hover:border-champagne/40 hover:bg-white/[0.055]">
          <Link href={area.href} className="text-sm font-medium text-bone transition hover:text-champagne">
            {area.title}
          </Link>
          <ul className="mt-4 space-y-2 text-xs leading-5 text-muted">
            {area.items.map((item) => (
              <li key={`${area.title}-${item.label}`}>
                <Link href={item.href} className="transition hover:text-bone">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Header() {
  return (
    <header className="relative z-50 border-b border-line bg-background/92 backdrop-blur-2xl lg:sticky lg:top-0">
      <div className="mx-auto flex min-h-16 w-[min(1180px,calc(100%-32px))] items-center justify-between gap-4 sm:min-h-20 sm:gap-6">
        <Link href="/" className="group min-w-0 leading-none" aria-label="HAUTLAB, página de inicio">
          <span className="block text-xs font-medium uppercase tracking-[0.28em] text-bone">HAUTLAB</span>
          <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.14em] text-muted sm:text-[11px] sm:tracking-[0.18em]">Dr. Salvador Cordero</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted xl:flex" aria-label="Navegación principal">
          <Link href="/#metodo" className="transition hover:text-bone">Método</Link>

          <details className="group relative">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 py-7 transition hover:text-bone [&::-webkit-details-marker]:hidden">
              Áreas de atención <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
            </summary>
            <div className="invisible absolute left-1/2 top-full w-[min(920px,88vw)] -translate-x-1/2 translate-y-2 rounded-[2rem] border border-line bg-[#0d0c0b]/98 p-6 opacity-0 shadow-calm backdrop-blur-2xl transition duration-200 group-open:visible group-open:translate-y-0 group-open:opacity-100">
              <AreaGrid />
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs">
                <span>Diagnóstico primero. Procedimientos por indicación.</span>
                <Link href="/procedimientos" className="text-bone transition hover:text-champagne">Ver todas las áreas →</Link>
              </div>
            </div>
          </details>

          <Link href="/cabina" data-event="cabina_nav_desktop" className="text-bone transition hover:text-champagne">Cabina Dermatocosmética</Link>
          <Link href="/#testimonios" className="transition hover:text-bone">Testimonios</Link>
          <Link href="/pagos" className="transition hover:text-bone">Pagos</Link>
        </nav>

        <Button asChild size="sm" className="shrink-0">
          <a href={buildWhatsAppLink("Hola, quiero agendar una valoración en HAUTLAB.")} target="_blank" rel="noreferrer" data-event="whatsapp_header">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Agendar valoración</span>
            <span className="sm:hidden">Agendar</span>
          </a>
        </Button>
      </div>

      <div className="border-t border-line/50 xl:hidden">
        <details className="group mx-auto w-[min(1180px,calc(100%-32px))]">
          <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-xs uppercase tracking-[0.16em] text-muted [&::-webkit-details-marker]:hidden">
            Explorar áreas
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <div className="pb-5">
            <Link href="/cabina" data-event="cabina_nav_mobile" className="mb-4 flex min-h-12 items-center justify-between rounded-2xl border border-champagne/30 bg-white/[0.04] px-4 text-sm font-medium text-bone">
              Cabina Dermatocosmética <span aria-hidden="true">→</span>
            </Link>
            <AreaGrid compact />
            <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-4 text-xs uppercase tracking-[0.14em] text-muted" aria-label="Navegación secundaria">
              {secondaryNav.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-bone">{item.label}</Link>
              ))}
              <Link href="/procedimientos" className="text-bone">Todos los procedimientos</Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
