import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HAUTLAB + Dr. Salvador Cordero — Precisión médica. Estética contenida.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "radial-gradient(circle at 82% 16%, rgba(200,179,154,.22), transparent 34%), linear-gradient(135deg, #0b0a09 0%, #1c1916 100%)",
          color: "#f2eee7"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 25, letterSpacing: 7, fontWeight: 600 }}>HAUTLAB</div>
          <div style={{ fontSize: 20, color: "#c8b39a" }}>Mérida · Yucatán</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 930 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 78, lineHeight: .94, letterSpacing: -4, fontFamily: "serif" }}>
            <div>Precisión médica.</div>
            <div>Estética contenida.</div>
          </div>
          <div style={{ marginTop: 34, fontSize: 25, color: "#b9afa2" }}>
            Diagnóstico primero. Procedimientos por indicación. Resultados sobrios.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#b9afa2" }}>
          <div>Dr. Salvador Cordero</div>
          <div>hautlabmx.com</div>
        </div>
      </div>
    ),
    size
  );
}
