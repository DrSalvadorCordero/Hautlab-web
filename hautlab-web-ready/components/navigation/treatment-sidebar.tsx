import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export type RelatedLink = {
  label: string;
  href: string;
};

export function TreatmentSidebar({
  category,
  related,
  whatsappMessage
}: {
  category: { label: string; href: string };
  related: RelatedLink[];
  whatsappMessage: string;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[1.75rem] border border-line bg-white/[0.035] p-5 shadow-hairline">
        <p className="text-xs uppercase tracking-[0.18em] text-champagne">Área</p>
        <Link href={category.href} className="mt-3 inline-flex items-center gap-2 text-lg font-medium text-bone transition hover:text-champagne">
          {category.label} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-[1.75rem] border border-line bg-white/[0.035] p-5 shadow-hairline">
        <p className="text-xs uppercase tracking-[0.18em] text-champagne">Relacionados</p>
        <div className="mt-4 grid gap-2">
          {related.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-2xl border border-line bg-background/40 px-4 py-3 text-sm text-muted transition hover:border-champagne/40 hover:text-bone">
              {item.label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-champagne/30 bg-champagne p-5 text-background shadow-calm">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-taupe">Valoración</p>
        <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em]">La indicación se decide después de valorar.</h3>
        <p className="mt-3 text-sm leading-6 text-[#4b4036]">Evita elegir un procedimiento únicamente por tendencia, precio o una fotografía.</p>
        <Button asChild variant="dark" className="mt-5 w-full">
          <a href={buildWhatsAppLink(whatsappMessage)} target="_blank" rel="noreferrer">
            <CalendarDays className="h-4 w-4" /> Agendar valoración
          </a>
        </Button>
      </div>
    </aside>
  );
}
