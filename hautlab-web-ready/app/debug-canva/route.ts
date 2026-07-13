export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const source = await fetch("https://www.canva.com/d/M02geJzBBvLZZj8", {
    redirect: "follow",
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36"
    }
  });

  const body = await source.text();
  const markers = ["document-image", "DAHPQgxsf-U", "xsf-U", "thumbnail", "media.canva.com", "amazonaws.com"]
    .map((marker) => ({ marker, index: body.indexOf(marker) }));
  const contexts = markers
    .filter(({ index }) => index >= 0)
    .map(({ marker, index }) => ({ marker, context: body.slice(Math.max(0, index - 700), index + 3000) }));

  return Response.json({
    status: source.status,
    url: source.url,
    contentType: source.headers.get("content-type"),
    length: body.length,
    markers,
    contexts
  });
}
