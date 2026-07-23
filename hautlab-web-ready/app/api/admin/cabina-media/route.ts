import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-access";
import { exceedsContentLength, isSameOriginRequest } from "@/lib/server/admin-request-security";

export const runtime = "nodejs";

const repository = process.env.HAUTLAB_CONTENT_REPOSITORY ?? "DrSalvadorCordero/Hautlab-web";
const branch = process.env.HAUTLAB_CONTENT_BRANCH ?? "main";
const token = process.env.HAUTLAB_CONTENT_GITHUB_TOKEN?.trim();
const maxBytes = 5 * 1024 * 1024;
const allowedMimeTypes = new Map([
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"]
]);

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
}

function hasValidSignature(bytes: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (mimeType === "image/webp") {
    return bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  }
  if (mimeType === "image/avif") {
    return (
      bytes.length >= 12 &&
      bytes.toString("ascii", 4, 8) === "ftyp" &&
      /avif|avis/.test(bytes.toString("ascii", 8, Math.min(bytes.length, 32)))
    );
  }
  return false;
}

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function githubRequest(path: string, init?: RequestInit) {
  if (!token) throw new Error("content_token_missing");
  return fetch(`https://api.github.com/repos/${repository}/${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
}

export async function POST(request: Request) {
  const access = await getAdminAccess();
  const canPublish = access.isOwner || access.organizationRole === "org:admin";
  if (!canPublish) return noStoreJson({ error: "forbidden" }, { status: 403 });
  if (!isSameOriginRequest(request)) return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  if (!token) return noStoreJson({ error: "publishing_not_configured" }, { status: 503 });
  if (exceedsContentLength(request, maxBytes, true)) {
    return noStoreJson({ error: "image_too_large" }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return noStoreJson({ error: "invalid_form_data" }, { status: 400 });
  }
  const file = formData.get("file");
  const slot = safeSlug(String(formData.get("slot") ?? "cabina-image"));

  if (!(file instanceof File)) return noStoreJson({ error: "file_required" }, { status: 400 });
  const extension = allowedMimeTypes.get(file.type);
  if (!extension) return noStoreJson({ error: "unsupported_image_type" }, { status: 415 });
  if (file.size <= 0 || file.size > maxBytes) return noStoreJson({ error: "image_too_large" }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(bytes, file.type)) {
    return noStoreJson({ error: "invalid_image_content" }, { status: 415 });
  }

  const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  const fileName = `${slot || "cabina-image"}-${digest}.${extension}`;
  const repositoryPath = `hautlab-web-ready/public/visuals/cabina/${fileName}`;
  const publicPath = `/visuals/cabina/${fileName}`;

  try {
    const response = await githubRequest(`contents/${repositoryPath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `media: add cabina image ${slot || "asset"}`,
        content: bytes.toString("base64"),
        branch
      })
    });

    if (!response.ok) throw new Error(`media_write_${response.status}`);
    return noStoreJson({ ok: true, path: publicPath, branch });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.error("Cabina media publishing failed", { reason });
    return noStoreJson({ error: "media_publishing_failed" }, { status: 502 });
  }
}
