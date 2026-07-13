const portraitSource =
  "https://raw.githubusercontent.com/DrSalvadorCordero/Hautlab-web/18bf18038712dac7497af50d982678b0e1be1f76/hautlab-web-ready/assets-src/portrait-hd/part00.b64";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const source = await fetch(portraitSource, {
    cache: "force-cache",
    next: { revalidate: 31536000 }
  });

  if (!source.ok) {
    return new Response("Portrait source unavailable", { status: 502 });
  }

  const base64 = (await source.text()).trim();
  const portrait = Buffer.from(base64, "base64");

  if (portrait.length < 250000) {
    return new Response("Portrait source invalid", { status: 500 });
  }

  return new Response(portrait, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(portrait.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": "inline; filename=\"dr-salvador-cordero-portrait-hd.jpg\""
    }
  });
}
