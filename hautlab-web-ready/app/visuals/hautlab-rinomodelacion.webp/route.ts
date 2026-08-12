import { rinomodelacionVisual } from "@/data/procedure-visual-rinomodelacion";

export const dynamic = "force-static";
export const runtime = "nodejs";

export function GET() {
  const base64 = rinomodelacionVisual.split(",")[1] ?? "";
  const bytes = Buffer.from(base64, "base64");

  return new Response(bytes, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
