"use client";

import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Settings, Users } from "lucide-react";

const navigation = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings }
];

export function AdminShell({
  children,
  email,
  role
}: {
  children: React.ReactNode;
  email: string | null;
  role: string;
}) {
  return (
    <div className="min-h-screen bg-[#0b0a09] text-bone">
      <header className="border-b border-line bg-[#0f0e0c]/95 backdrop-blur-xl">
        <div className="mx-auto flex w-[min(1280px,calc(100%-32px))] flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.28em] text-bone">
              HAUTLAB
            </Link>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">Panel interno</p>
          </div>

          <div className="flex items-center gap-3">
            <OrganizationSwitcher
              hidePersonal
              afterCreateOrganizationUrl="/admin"
              afterSelectOrganizationUrl="/admin"
              appearance={{
                elements: {
                  rootBox: "max-w-[220px]",
                  organizationSwitcherTrigger: "border border-line bg-white/[0.04] text-bone"
                }
              }}
            />
            <UserButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-[min(1280px,calc(100%-32px))] gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-5">
          <nav className="grid gap-2" aria-label="Navegación del panel">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-muted transition hover:border-line hover:bg-white/[0.04] hover:text-bone"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="rounded-2xl border border-line bg-white/[0.03] p-4 text-xs leading-5 text-muted">
            <p className="font-medium text-bone">Sesión activa</p>
            <p className="mt-2 break-all">{email ?? "Usuario autorizado"}</p>
            <p className="mt-1">Rol: {role}</p>
          </div>

          <Link href="/" className="block px-4 text-xs text-muted transition hover:text-bone">
            Volver al sitio público →
          </Link>
        </aside>

        <main id="contenido-principal" tabIndex={-1} className="min-w-0 outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
