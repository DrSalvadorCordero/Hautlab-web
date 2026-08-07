import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const hautlabMark =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANAAA AENCAYAAABi6cZ2AAA...";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8ded5",
        }}
      >
        <img
          src={hautlabMark}
          width="208"
          height="269"
          alt=""
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size,
  );
}
