import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-line bg-background/70">
      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] items-center gap-2 overflow-x-auto py-4 text-xs text-muted">
        <Link href="/" className="inline-flex items-center gap-1.5 whitespace-nowrap transition hover:text-bone">
          <Home className="h-3.5 w-3.5" />
          Inicio
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2 whitespace-nowrap">
              <ChevronRight className="h-3.5 w-3.5 text-quiet" />
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-bone">{item.label}</Link>
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
