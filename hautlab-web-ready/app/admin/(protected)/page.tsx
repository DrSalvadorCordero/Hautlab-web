import Link from "next/link";
import { CreateOrganization } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Bot, CalendarDays, FileText, Users } from "lucide-react";

const modules = [
  {
    title: "Usuarios internos",
    description: "Invita y administra al personal autorizado.",
    href: "/admin/usuarios",
    icon: Users,
    status: "Disponible"
  },
  {
    title: "Agenda y anticipos",
    description: "Disponibilidad, confirmación de cita y control de pagos.",
    href: "/admin/configuracion",
    icon: CalendarDays,
    status: "Siguiente fase"
  },
  {
    title: "Asistente HAUTLAB",
    description: "Base de conocimiento, uso y preguntas frecuentes.",
    href: "/admin/configuracion",
    icon: Bot,
    status: "En producción"
  },
  {
    title: "Motor editorial",
    description: "Borradores médicos con revisión antes de publicar.",
    href: "/admin/configuracion",
    icon: FileText,
    status: "Pendiente"
  }
];

export default async function AdminDashboardPage() {
  const session = await auth();
  const user = await currentUser();
  const firstName = user?.firstName || "Salvador";

  if (!session.orgId) {
    return (
      <section className="rounded-[2rem] border border-line bg-white/[0.03] p-7 shadow-calm sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">Primer acceso</p>
        <h1 className="mt-4 font-serif text-3xl sm:text-4xl">Crea la organización HAUTLAB</h1>
        <p className="mt-5 max-w-2xl leading-7 text-muted">
          La organización será el espacio privado para incorporar al personal autorizado y asignar permisos.
        </p>
        <div className="mt-8 max-w-xl">
          <CreateOrganization afterCreateOrganizationUrl="/admin" skipInvitationScreen={false} />
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-line bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-7 shadow-calm sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">Panel operativo</p>
        <h1 className="mt-4 font-serif text-3xl sm:text-4xl">Hola, {firstName}.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          El acceso interno ya está separado del sitio público. Desde aquí se incorporarán agenda, anticipos, contenidos y control del asistente.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.title}
              href={module.href}
              prefetch={false}
              className="group rounded-[1.75rem] border border-line bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-champagne/45 hover:bg-white/[0.045]"
            >
              <div className="flex items-start justify-between gap-5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-line bg-black/20">
                  <Icon className="h-5 w-5 text-champagne" />
                </div>
                <span className="rounded-full border border-line px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-muted">
                  {module.status}
                </span>
              </div>
              <h2 className="mt-6 text-lg font-medium text-bone">{module.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{module.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
