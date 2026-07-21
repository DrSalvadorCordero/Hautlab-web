import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CabinaMediaEditor } from "@/components/admin/cabina-media-editor";
import { cabinaContent } from "@/lib/cabina-content";

export default function CabinaMediaAdminPage() {
  return (
    <div className="space-y-8">
      <section>
        <Link href="/admin/cabina" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted transition hover:text-bone">
          <ArrowLeft className="h-4 w-4" /> Volver a contenido general
        </Link>
        <p className="mt-7 text-xs uppercase tracking-[0.24em] text-champagne">Unidad HAUTLAB</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Medios, promociones y reseñas</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Administra fotografías aprobadas, mensajes de reservación, promociones y opiniones verificadas específicas de la Cabina Dermatocosmética.
        </p>
      </section>

      <CabinaMediaEditor
        initialContent={cabinaContent}
        publishingConfigured={Boolean(process.env.HAUTLAB_CONTENT_GITHUB_TOKEN)}
      />
    </div>
  );
}
