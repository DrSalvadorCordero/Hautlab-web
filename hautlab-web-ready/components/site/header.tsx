import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/siteConfig";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const navItems = [
  { label: "Método", href: "#metodo" },
  { label: "Tratamientos", href: "#tratamientos" },
  { label: "Testimonios", href: "#testimonios" },
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
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-bone">
              {item.label}
            </Link>
          ))}
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
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
