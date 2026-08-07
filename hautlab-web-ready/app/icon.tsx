import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#e8ded5" }}>
        <svg width="208" height="270" viewBox="0 0 208 270" aria-hidden="true">
          <path fill="#000" d="M0 0h29v237h54v-73h29v106H0V0Zm50 24h29v55h83V0h46v270h-46V106H50V24Zm64-24h48v27h-19v52h-29V0Zm0 164h29v106h-29V164Z" />
        </svg>
      </div>
    ),
    size,
  );
}
