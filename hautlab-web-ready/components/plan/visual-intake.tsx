"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type {
  VisualIntakeAsset,
  VisualIntakeKind,
} from "@/lib/server/hautlab-intake";

const MAX_BYTES = 8 * 1024 * 1024;
const CONSENT_VERSION = "visual-intake-v1";
const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const VIEWS: Array<{
  kind: VisualIntakeKind;
  title: string;
  detail: string;
}> = [
  { kind: "front", title: "Frente", detail: "Rostro relajado, luz uniforme y cámara a la altura de los ojos." },
  { kind: "left_oblique", title: "45° izquierda", detail: "Gira ligeramente a tu derecha para mostrar el lado izquierdo." },
  { kind: "right_oblique", title: "45° derecha", detail: "Gira ligeramente a tu izquierda para mostrar el lado derecho." },
  { kind: "detail", title: "Detalle opcional", detail: "Sólo si hay una zona específica que quieras señalar." },
];

function messageFor(error: string) {
  if (error.includes("intake_limit_reached")) return "Ya alcanzaste el máximo de cuatro imágenes.";
  if (error.includes("intake_view_exists")) return "Ya hay una imagen guardada para esta vista. Elimínala antes de reemplazarla.";
  if (error.includes("invalid_origin") || error.includes("unauthorized")) return "Tu sesión privada expiró. Abre My HAUTLAB desde el dispositivo donde creaste el plan.";
  return "No pude guardar esta imagen. Inténtalo de nuevo.";
}

export function VisualIntake({
  code,
  initialAssets,
}: {
  code: string;
  initialAssets: VisualIntakeAsset[];
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<VisualIntakeKind | null>(null);
  const [error, setError] = useState("");

  async function post(payload: Record<string, unknown>) {
    const response = await fetch("/api/plan/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({})) as {
      error?: string;
      asset?: VisualIntakeAsset;
      uploadUrl?: string;
    };
    if (!response.ok) throw new Error(data.error ?? "visual_intake_failed");
    return data;
  }

  async function upload(kind: VisualIntakeKind, file: File) {
    setError("");
    if (!consent) {
      setError("Confirma primero el consentimiento temporal para fotografías.");
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      setError("Formato no compatible. Usa JPEG, PNG, WebP, HEIC o HEIF.");
      return;
    }
    if (file.size < 1 || file.size > MAX_BYTES) {
      setError("Cada imagen debe pesar menos de 8 MB.");
      return;
    }

    setBusy(kind);
    let assetId: string | null = null;
    try {
      const signed = await post({
        action: "sign",
        code,
        kind,
        mimeType: file.type,
        sizeBytes: file.size,
        consentAccepted: true,
        consentVersion: CONSENT_VERSION,
      });
      if (!signed.asset || !signed.uploadUrl) throw new Error("intake_sign_failed");
      assetId = signed.asset.id;

      const uploadResponse = await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-upsert": "false",
          "cache-control": "no-store",
        },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("intake_upload_failed");

      const completed = await post({
        action: "complete",
        code,
        assetId,
      });
      if (!completed.asset) throw new Error("intake_complete_failed");
      setAssets((current) => [
        ...current.filter((item) => item.kind !== kind),
        completed.asset as VisualIntakeAsset,
      ]);
    } catch (cause) {
      if (assetId) {
        await post({ action: "delete", code, assetId }).catch(() => undefined);
      }
      setError(messageFor(cause instanceof Error ? cause.message : "visual_intake_failed"));
    } finally {
      setBusy(null);
    }
  }

  async function remove(asset: VisualIntakeAsset) {
    setError("");
    setBusy(asset.kind);
    try {
      await post({ action: "delete", code, assetId: asset.id });
      setAssets((current) => current.filter((item) => item.id !== asset.id));
    } catch (cause) {
      setError(messageFor(cause instanceof Error ? cause.message : "visual_intake_failed"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-6 rounded-[2rem] border border-line bg-white/[0.035] p-6 sm:p-8">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-champagne">Visual Intake · opcional</p>
        <h2 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-bone">
          Adelanta contexto visual para tu valoración.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Estas imágenes no sustituyen la exploración ni generan un diagnóstico automático. Sirven únicamente para preparar mejor la conversación antes de tu cita.
        </p>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-background/45 p-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 accent-[#c8b39a]"
        />
        <span className="text-xs leading-5 text-muted">
          Autorizo a HAUTLAB a recibir y almacenar temporalmente estas imágenes únicamente para preparar mi valoración. Entiendo que no sustituyen una exploración ni un diagnóstico médico, no se integran automáticamente al expediente clínico y puedo eliminarlas desde My HAUTLAB. Las imágenes de prevaloración se eliminan automáticamente a los 30 días.
        </span>
      </label>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {VIEWS.map((view) => {
          const asset = assets.find((item) => item.kind === view.kind);
          const loading = busy === view.kind;
          return (
            <article key={view.kind} className="rounded-3xl border border-line bg-background/40 p-5">
              <div className="flex min-h-24 items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-bone">{view.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted">{view.detail}</p>
                </div>
                {asset?.status === "uploaded" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-champagne" />
                ) : (
                  <ImagePlus className="h-5 w-5 shrink-0 text-quiet" />
                )}
              </div>

              {asset ? (
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                  <div>
                    <p className="text-xs font-medium text-bone">
                      {asset.status === "uploaded" ? "Imagen recibida" : "Carga pendiente"}
                    </p>
                    <p className="mt-1 text-[11px] text-quiet">Retención temporal: 30 días</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(asset)}
                    disabled={loading}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-3 text-xs text-muted transition hover:border-bone/30 hover:text-bone disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Eliminar
                  </button>
                </div>
              ) : (
                <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-xs font-medium text-bone transition hover:border-champagne/45">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {loading ? "Subiendo…" : "Añadir imagen"}
                  <input
                    type="file"
                    accept={ACCEPTED.join(",")}
                    disabled={loading}
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void upload(view.kind, file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-white/[0.025] p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
        <p className="text-xs leading-5 text-muted">
          El bucket es privado. Los archivos usan identificadores aleatorios, no tu nombre, y no son públicos por URL permanente.
        </p>
      </div>
    </section>
  );
}
