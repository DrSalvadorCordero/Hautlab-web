import { NextResponse } from "next/server";
import { cabinaContent } from "@/lib/cabina-content";
import { getAdminAccess } from "@/lib/admin-access";

export const runtime = "nodejs";

const repository = process.env.HAUTLAB_CONTENT_REPOSITORY ?? "DrSalvadorCordero/Hautlab-web";
const branch = process.env.HAUTLAB_CONTENT_BRANCH ?? "main";
const token = process.env.HAUTLAB_CONTENT_GITHUB_TOKEN?.trim();
const root = "hautlab-web-ready/data";

const files = {
  core: `${root}/cabina-content.json`,
  services: `${root}/cabina-services.json`,
  faq: `${root}/cabina-faq.json`
} as const;

type Payload = {
  core: Record<string, unknown>;
  services: unknown[];
  faq: unknown[];
};

function jsonText(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function base64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
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

async function updateFile(path: string, content: string, message: string) {
  const current = await githubRequest(`contents/${path}?ref=${encodeURIComponent(branch)}`);
  if (!current.ok) throw new Error(`content_read_${current.status}`);
  const currentData = (await current.json()) as { sha?: string };
  if (!currentData.sha) throw new Error("content_sha_missing");

  const updated = await githubRequest(`contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: base64(content),
      sha: currentData.sha,
      branch
    })
  });

  if (!updated.ok) throw new Error(`content_write_${updated.status}`);
}

function validatePayload(value: unknown): value is Payload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<Payload>;
  return Boolean(
    payload.core &&
      typeof payload.core === "object" &&
      Array.isArray(payload.services) &&
      payload.services.length <= 40 &&
      Array.isArray(payload.faq) &&
      payload.faq.length <= 30
  );
}

export async function GET() {
  const access = await getAdminAccess();
  if (!access.allowed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { services, faq, ...core } = cabinaContent;
  return NextResponse.json({
    content: { core, services, faq },
    publishingConfigured: Boolean(token),
    branch
  });
}

export async function PUT(request: Request) {
  const access = await getAdminAccess();
  const canPublish = access.isOwner || access.organizationRole === "org:admin";
  if (!canPublish) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!token) return NextResponse.json({ error: "publishing_not_configured" }, { status: 503 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!validatePayload(payload)) {
    return NextResponse.json({ error: "invalid_content" }, { status: 400 });
  }

  try {
    await updateFile(files.core, jsonText(payload.core), "content: update cabina core information");
    await updateFile(files.services, jsonText(payload.services), "content: update cabina services");
    await updateFile(files.faq, jsonText(payload.faq), "content: update cabina frequently asked questions");

    return NextResponse.json({ ok: true, branch });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.error("Cabina content publishing failed", { reason });
    return NextResponse.json({ error: "publishing_failed" }, { status: 502 });
  }
}
