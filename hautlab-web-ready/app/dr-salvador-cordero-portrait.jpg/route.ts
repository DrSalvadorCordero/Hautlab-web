import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const svgPath = path.join(process.cwd(), "public", "visuals", "dr-salvador-cordero-portrait.svg");
  const svg = await readFile(svgPath, "utf8");
  const match = svg.match(/data:image\/jpeg;base64,([^\"]+)/);

  if (!match) {
    return new Response("Portrait not found", { status: 404 });
  }

  return new Response(Buffer.from(match[1], "base64"), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "no-store, max-age=0",
      "Content-Disposition": "inline; filename=\"dr-salvador-cordero-portrait.jpg\""
    }
  });
}
