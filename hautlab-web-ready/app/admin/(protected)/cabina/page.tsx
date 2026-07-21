import { CabinaContentEditor } from "@/components/admin/cabina-content-editor";
import { cabinaContent } from "@/lib/cabina-content";

export default function CabinaAdminPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-champagne">Unidad HAUTLAB</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Cabina Dermatocosmética</h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted">
          Administra servicios, precios, duraciones, horarios, perfil de Karen y preguntas frecuentes sin modificar la estructura visual del sitio.
        </p>
      </section>

      <CabinaContentEditor
        initialContent={cabinaContent}
        publishingConfigured={Boolean(process.env.HAUTLAB_CONTENT_GITHUB_TOKEN)}
      />
    </div>
  );
}
