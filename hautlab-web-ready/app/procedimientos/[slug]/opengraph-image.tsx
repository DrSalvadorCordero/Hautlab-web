import { ImageResponse } from "next/og";
import { treatmentsV2 } from "@/data/treatments-v2";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProcedureOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const treatment = treatmentsV2[slug];
  const title = treatment?.title || "Procedimientos HAUTLAB";
  const eyebrow = treatment?.eyebrow || "HAUTLAB";
  const summary = treatment?.summary || "Diagnóstico primero. Procedimientos por indicación. Resultados sobrios.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(circle at 78% 16%, rgba(200,179,154,.20), transparent 32%), linear-gradient(135deg, #0b0a09 0%, #1a1714 100%)",
          color: "#f2eee7"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 24, letterSpacing: 7, fontWeight: 600 }}>HAUTLAB</div>
          <div style={{ fontSize: 19, color: "#c8b39a", letterSpacing: 2 }}>{eyebrow.toUpperCase()}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}>
          <div style={{ fontSize: 84, lineHeight: .92, letterSpacing: -4, fontFamily: "serif" }}>{title}</div>
          <div style={{ marginTop: 30, maxWidth: 900, fontSize: 25, lineHeight: 1.35, color: "#b9afa2" }}>{summary}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#b9afa2" }}>
          <div>Dr. Salvador Cordero · Mérida</div>
          <div>Precisión médica. Estética contenida.</div>
        </div>
      </div>
    ),
    size
  );
}
