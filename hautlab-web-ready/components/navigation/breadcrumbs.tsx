import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const normalizedItems = items.filter((item, index) => !(index === 0 && item.href === "/"));

  return (
    <nav aria-label="Breadcrumb" className="border-b border-line bg-background/70">
      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] items-center gap-2 overflow-x-auto py-4 text-xs text-muted">
        <Link href="/" className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm transition hover:text-bone focus:outline-none focus:ring-2 focus:ring-champagne">
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          Inicio
        </Link>
        {normalizedItems.map((item, index) => {
          const isLast = index === normalizedItems.length - 1;
          return (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2 whitespace-nowrap">
              <ChevronRight className="h-3.5 w-3.5 text-quiet" aria-hidden="true" />
              {item.href && !isLast ? (
                <Link href={item.href} className="rounded-sm transition hover:text-bone focus:outline-none focus:ring-2 focus:ring-champagne">{item.label}</Link>
              ) : (
                <span className={isLast ? "text-bone" : undefined} aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
