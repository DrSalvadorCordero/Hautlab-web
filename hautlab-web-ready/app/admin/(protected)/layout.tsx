import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAccess } from "@/lib/admin-access";

function SetupRequired() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0a09] px-6 text-bone">
      <section className="w-full max-w-2xl rounded-[2rem] border border-line bg-white/[0.035] p-8 shadow-calm sm:p-12">
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">HAUTLAB · Panel interno</p>
        <h1 className="mt-5 font-serif text-3xl sm:text-4xl">Autenticación pendiente de configuración</h1>
        <p className="mt-5 leading-7 text-muted">
          El panel ya está preparado, pero permanece cerrado hasta conectar el proveedor de identidad y sus claves privadas en Vercel.
        </p>
        <div className="mt-8 rounded-2xl border border-line bg-black/20 p-5 text-sm leading-7 text-muted">
          <p className="font-medium text-bone">Variables requeridas</p>
          <code className="mt-3 block">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>
          <code className="block">CLERK_SECRET_KEY</code>
          <code className="block">HAUTLAB_OWNER_EMAILS</code>
        </div>
      </section>
    </main>
  );
}

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccess();

  if (!access.configured) return <SetupRequired />;
  if (!access.userId) redirect("/admin/iniciar-sesion");

  if (!access.allowed) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0b0a09] px-6 text-bone">
        <section className="w-full max-w-xl rounded-[2rem] border border-line bg-white/[0.035] p-10 text-center shadow-calm">
          <p className="text-xs uppercase tracking-[0.24em] text-champagne">Acceso restringido</p>
          <h1 className="mt-5 font-serif text-3xl">Esta cuenta no pertenece a HAUTLAB</h1>
          <p className="mt-5 leading-7 text-muted">
            Un administrador debe invitar esta cuenta a la organización antes de que pueda entrar al panel.
          </p>
          <Link href="/" className="mt-8 inline-flex rounded-full border border-line px-5 py-3 text-sm transition hover:border-champagne hover:text-champagne">
            Volver al sitio
          </Link>
        </section>
      </main>
    );
  }

  const role = access.isOwner
    ? "Propietario"
    : access.organizationRole === "org:admin"
      ? "Administrador"
      : "Recepción / miembro";

  return (
    <AdminShell email={access.email} role={role}>
      {children}
    </AdminShell>
  );
}
