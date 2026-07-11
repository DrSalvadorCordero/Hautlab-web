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
      { label: "Ojeras", href: "/tratamientos/medicina-estetica-facial" },
      { label: "Mentón", href: "/tratamientos/medicina-estetica-facial" },
      { label: "Mandíbula", href: "/tratamientos/medicina-estetica-facial" }
    ]
  },
  {
    title: "Piel y textura",
    href: "/tratamientos/calidad-de-piel-y-soporte",
    items: [
      { label: "Cicatrices", href: "/tratamientos/calidad-de-piel-y-soporte" },
      { label: "Estrías", href: "/tratamientos/calidad-de-piel-y-soporte" },
      { label: "Poros", href: "/tratamientos/calidad-de-piel-y-soporte" },
      { label: "Textura", href: "/tratamientos/calidad-de-piel-y-soporte" },
      { label: "Manchas", href: "/tratamientos/calidad-de-piel-y-soporte" },
      { label: "Peelings", href: "/tratamientos/calidad-de-piel-y-soporte" }
    ]
  },
  {
    title: "Condiciones de piel",
    href: "/tratamientos/dermatologia-clinica",
    items: [
      { label: "Acné", href: "/procedimientos/acne" },
      { label: "Rosácea", href: "/tratamientos/dermatologia-clinica" },
      { label: "Melasma", href: "/procedimientos/melasma" },
      { label: "Dermatitis", href: "/tratamientos/dermatologia-clinica" },
      { label: "Alopecia", href: "/tratamientos/dermatologia-clinica" },
      { label: "Vitíligo", href: "/tratamientos/dermatologia-clinica" }
    ]
  },
  {
    title: "Procedimientos focales",
    href: "/tratamientos/dermatologia-procedimental",
    items: [
      { label: "Verrugas", href: "/procedimientos/verrugas" },
      { label: "Quistes", href: "/tratamientos/dermatologia-procedimental" },
      { label: "Lunares", href: "/tratamientos/dermatologia-procedimental" },
      { label: "Dermatoscopia", href: "/tratamientos/dermatologia-procedimental" },
      { label: "Cauterización", href: "/tratamientos/dermatologia-procedimental" },
      { label: "Biopsias", href: "/tratamientos/dermatologia-procedimental" }
    ]
  }
];

const mobileNav = [
  { label: "Método", href: "/#metodo" },
  { label: "Áreas", href: "/#tratamientos" },
  { label: "Destacados", href: "/#destacados" },
  { label: "Testimonios", href: "/#testimonios" },
  { label: "Pagos", href: "/pagos" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/82 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-20 w-[min(1180px,calc(100%-32px))] items-center justify-between gap-6">
        <Link href="/" className="group leading-none" aria-label="HAUTLAB home">
          <span className="block text-xs font-medium uppercase tracking-[0.28em] text-bone">HAUTLAB</span>
          <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-muted">Dr. Salvador Cordero</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted lg:flex" aria-label="Navegación principal">
          <Link href="/#metodo" className="transition hover:text-bone">Método</Link>

          <div className="group relative">
            <button className="inline-flex items-center gap-1 py-7 transition group-hover:text-bone" type="button" aria-haspopup="true">
              Áreas de atención <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-[min(920px,88vw)] -translate-x-1/2 translate-y-2 rounded-[2rem] border border-line bg-[#0d0c0b]/98 p-6 opacity-0 shadow-calm backdrop-blur-2xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {areas.map((area) => (
                  <div key={area.title} className="rounded-3xl border border-line bg-white/[0.03] p-5 transition hover:border-champagne/40 hover:bg-white/[0.055]">
                    <Link href={area.href} className="text-sm font-medium text-bone transition hover:text-champagne">
                      {area.title}
                    </Link>
                    <ul className="mt-4 space-y-2 text-xs leading-5 text-muted">
                      {area.items.map((item) => (
                        <li key={item.label}>
                          <Link href={item.href} className="transition hover:text-bone">{item.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs">
                <span>Diagnóstico primero. Procedimientos por indicación.</span>
                <Link href="/procedimientos" className="text-bone">Ver todas las áreas →</Link>
              </div>
            </div>
          </div>

          <Link href="/#testimonios" className="transition hover:text-bone">Testimonios</Link>
          <Link href="/pagos" className="transition hover:text-bone">Pagos</Link>
        </nav>

        <Button asChild size="sm" className="shrink-0">
          <a href={buildWhatsAppLink("Hola, quiero agendar una valoración en HAUTLAB.")} target="_blank" rel="noreferrer" data-event="whatsapp_header">
            <CalendarDays className="h-4 w-4" />
            Agendar valoración
          </a>
        </Button>
      </div>

      <div className="border-t border-line/50 lg:hidden">
        <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] gap-5 overflow-x-auto py-3 text-xs uppercase tracking-[0.16em] text-muted">
          {mobileNav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap">{item.label}</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
