const maxMultipartOverhead = 256 * 1024;

function normalizedOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  return normalizedOrigin(origin) === new URL(request.url).origin;
}

export function exceedsContentLength(request: Request, maxBytes: number, multipart = false) {
  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isFinite(contentLength) || contentLength < 0) return false;

  return contentLength > maxBytes + (multipart ? maxMultipartOverhead : 0);
}
