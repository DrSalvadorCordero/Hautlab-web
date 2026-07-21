import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-access";

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
  if (!canPublish) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!token) return NextResponse.json({ error: "publishing_not_configured" }, { status: 503 });

  const formData = await request.formData();
  const file = formData.get("file");
  const slot = safeSlug(String(formData.get("slot") ?? "cabina-image"));

  if (!(file instanceof File)) return NextResponse.json({ error: "file_required" }, { status: 400 });
  const extension = allowedMimeTypes.get(file.type);
  if (!extension) return NextResponse.json({ error: "unsupported_image_type" }, { status: 415 });
  if (file.size <= 0 || file.size > maxBytes) return NextResponse.json({ error: "image_too_large" }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = `${slot || "cabina-image"}-${Date.now()}.${extension}`;
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
    return NextResponse.json({ ok: true, path: publicPath, branch });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.error("Cabina media publishing failed", { reason });
    return NextResponse.json({ error: "media_publishing_failed" }, { status: 502 });
  }
}
