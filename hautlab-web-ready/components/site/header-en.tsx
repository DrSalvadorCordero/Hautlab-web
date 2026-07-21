import Link from "next/link";
import { CalendarDays, ChevronDown, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const navigation = [
  { label: "Areas of care", href: "/en#care" },
  { label: "Clinical approach", href: "/en#approach" },
  { label: "For visiting patients", href: "/en#travel" },
  { label: "FAQ", href: "/en#faq" }
];

export function HeaderEn() {
  const bookingMessage =
    "Hello, I would like to schedule a private evaluation at HAUTLAB in Mérida. I am contacting you through the English website.";

  return (
    <header className="relative z-50 border-b border-line bg-background/92 backdrop-blur-2xl lg:sticky lg:top-0">
      <div className="mx-auto flex min-h-16 w-[min(1180px,calc(100%-32px))] items-center justify-between gap-4 sm:min-h-20 sm:gap-6">
        <Link href="/en" className="group min-w-0 leading-none" aria-label="HAUTLAB English home">
          <span className="block text-xs font-medium uppercase tracking-[0.28em] text-bone">HAUTLAB</span>
          <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.14em] text-muted sm:text-[11px] sm:tracking-[0.18em]">
            Dr. Salvador Cordero · Mérida
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted xl:flex" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-bone">
              {item.label}
            </Link>
          ))}
          <Link href="/cabina" className="transition hover:text-bone">
            Dermatocosmetic Studio
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-bone transition hover:text-champagne" hrefLang="es-MX">
            <Languages className="h-4 w-4" /> ES
          </Link>
        </nav>

        <Button asChild size="sm" className="shrink-0">
          <a href={buildWhatsAppLink(bookingMessage)} target="_blank" rel="noreferrer" data-event="whatsapp_en_header">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Request an appointment</span>
            <span className="sm:hidden">Book</span>
          </a>
        </Button>
      </div>

      <div className="border-t border-line/50 xl:hidden">
        <details className="group mx-auto w-[min(1180px,calc(100%-32px))]">
          <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-xs uppercase tracking-[0.16em] text-muted [&::-webkit-details-marker]:hidden">
            Explore
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <nav className="grid gap-2 pb-5 text-sm" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="flex min-h-11 items-center rounded-2xl border border-line bg-white/[0.025] px-4 text-muted transition hover:border-champagne/35 hover:text-bone">
                {item.label}
              </Link>
            ))}
            <Link href="/cabina" className="flex min-h-11 items-center rounded-2xl border border-line bg-white/[0.025] px-4 text-muted transition hover:border-champagne/35 hover:text-bone">
              Dermatocosmetic Studio
            </Link>
            <Link href="/" hrefLang="es-MX" className="flex min-h-11 items-center gap-2 rounded-2xl border border-champagne/30 bg-white/[0.04] px-4 text-bone">
              <Languages className="h-4 w-4" /> View website in Spanish
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
