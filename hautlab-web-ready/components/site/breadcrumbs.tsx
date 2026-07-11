import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="transition hover:text-bone">Inicio</Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="h-3.5 w-3.5 text-quiet" aria-hidden="true" />
            {item.href ? (
              <Link href={item.href} className="transition hover:text-bone">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-bone">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
