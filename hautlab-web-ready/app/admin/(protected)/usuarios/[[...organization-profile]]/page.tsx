import { CreateOrganization, OrganizationProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth-config";

export default async function AdminUsersPage() {
  if (!isClerkConfigured()) return null;

  const session = await auth();

  if (!session.orgId) {
    return (
      <section className="rounded-[2rem] border border-line bg-white/[0.03] p-7 shadow-calm sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">Usuarios internos</p>
        <h1 className="mt-4 font-serif text-3xl sm:text-4xl">Primero crea la organización HAUTLAB</h1>
        <p className="mt-5 max-w-2xl leading-7 text-muted">
          Después podrás invitar usuarios y administrar su acceso desde esta misma pantalla.
        </p>
        <div className="mt-8 max-w-xl">
          <CreateOrganization afterCreateOrganizationUrl="/admin/usuarios" skipInvitationScreen={false} />
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">Control de acceso</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Usuarios internos</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Los administradores pueden enviar invitaciones, retirar accesos y revisar miembros activos.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-line bg-white/[0.025] p-2 shadow-calm">
        <OrganizationProfile
          path="/admin/usuarios"
          routing="path"
          appearance={{ elements: { rootBox: "w-full", cardBox: "w-full shadow-none" } }}
        />
      </div>
    </div>
  );
}
