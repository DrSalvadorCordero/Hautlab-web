/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Images, Link2, ShieldCheck } from "lucide-react";
import { getAdminAccess } from "@/lib/admin-access";
import { listAdminVisualIntake } from "@/lib/server/hautlab-intake";

export const metadata: Metadata = {
  title: "Visual Intake | HAUTLAB",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

const LABELS = {
  front: "Frente",
  left_oblique: "45° izquierda",
  right_oblique: "45° derecha",
  detail: "Detalle",
} as const;

function date(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Merida",
  }).format(new Date(value));
}

export default async function VisualIntakeAdminPage() {
  const access = await getAdminAccess();
  const canManage = Boolean(
    access.allowed && (access.isOwner || access.organizationRole === "org:admin"),
  );
  if (!canManage) redirect("/admin");

  const assets = await listAdminVisualIntake(60);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">HAUTLAB · Visual Intake</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Prevaloración visual temporal</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Fotografías voluntarias enviadas desde My HAUTLAB para preparar la valoración. No sustituyen exploración, diagnóstico ni expediente clínico.
        </p>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-line bg-white/[0.03] p-5">
        <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-champagne" />
        <p className="text-xs leading-5 text-muted">
          Los enlaces de visualización caducan en 10 minutos. La fuente permanece en bucket privado y cada activo se elimina automáticamente al cumplir 30 días.
        </p>
      </div>

      {assets.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <article key={asset.id} className="overflow-hidden rounded-[1.75rem] border border-line bg-white/[0.03]">
              <div className="aspect-[4/5] bg-black/30">
                {asset.viewUrl ? (
                  <img
                    src={asset.viewUrl}
                    alt={`${LABELS[asset.kind]} · ${asset.planCode}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-quiet"><Images className="h-8 w-8" /></div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-champagne">{LABELS[asset.kind]}</p>
                    <h2 className="mt-2 text-sm font-medium text-bone">{asset.planCode}</h2>
                  </div>
                  {asset.whatsappLinked ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[10px] text-muted">
                      <Link2 className="h-3 w-3" /> WhatsApp
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-xs leading-5 text-muted">Recibida: {date(asset.uploadedAt ?? asset.createdAt)}</p>
                <p className="text-xs leading-5 text-quiet">Eliminar antes de: {date(asset.retentionUntil)}</p>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-line bg-white/[0.025] p-10 text-center">
          <Images className="mx-auto h-7 w-7 text-quiet" />
          <p className="mt-4 text-sm text-muted">No hay imágenes activas de prevaloración.</p>
        </section>
      )}
    </div>
  );
}
