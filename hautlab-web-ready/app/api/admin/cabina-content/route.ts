import { NextResponse } from "next/server";
import { cabinaContent, cabinaPayloadSchema } from "@/lib/cabina-content";
import { getAdminAccess } from "@/lib/admin-access";
import { exceedsContentLength, isSameOriginRequest } from "@/lib/server/admin-request-security";

export const runtime = "nodejs";

const repository = process.env.HAUTLAB_CONTENT_REPOSITORY ?? "DrSalvadorCordero/Hautlab-web";
const branch = process.env.HAUTLAB_CONTENT_BRANCH ?? "main";
const token = process.env.HAUTLAB_CONTENT_GITHUB_TOKEN?.trim();
const root = "hautlab-web-ready/data";
const maxBodyBytes = 64 * 1024;

const files = {
  core: `${root}/cabina-content.json`,
  services: `${root}/cabina-services.json`,
  faq: `${root}/cabina-faq.json`
} as const;

function jsonText(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function noStoreJson(value: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(value, { ...init, headers });
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

async function responseJson<T>(response: Response, label: string) {
  if (!response.ok) throw new Error(`${label}_${response.status}`);
  return (await response.json()) as T;
}

async function createContentCommit(contents: Array<{ path: string; content: string }>) {
  const ref = await responseJson<{ object?: { sha?: string } }>(
    await githubRequest(`git/ref/heads/${branch}`),
    "content_ref_read"
  );
  const parentSha = ref.object?.sha;
  if (!parentSha) throw new Error("content_parent_sha_missing");

  const parent = await responseJson<{ tree?: { sha?: string } }>(
    await githubRequest(`git/commits/${parentSha}`),
    "content_commit_read"
  );
  const baseTree = parent.tree?.sha;
  if (!baseTree) throw new Error("content_tree_sha_missing");

  const treeEntries = await Promise.all(
    contents.map(async ({ path, content }) => {
      const blob = await responseJson<{ sha?: string }>(
        await githubRequest("git/blobs", {
          method: "POST",
          body: JSON.stringify({ content, encoding: "utf-8" })
        }),
        "content_blob_write"
      );
      if (!blob.sha) throw new Error("content_blob_sha_missing");
      return { path, mode: "100644", type: "blob", sha: blob.sha };
    })
  );

  const tree = await responseJson<{ sha?: string }>(
    await githubRequest("git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: baseTree, tree: treeEntries })
    }),
    "content_tree_write"
  );
  if (!tree.sha) throw new Error("content_new_tree_sha_missing");

  const commit = await responseJson<{ sha?: string }>(
    await githubRequest("git/commits", {
      method: "POST",
      body: JSON.stringify({
        message: "content: update cabina information",
        tree: tree.sha,
        parents: [parentSha]
      })
    }),
    "content_commit_write"
  );
  if (!commit.sha) throw new Error("content_new_commit_sha_missing");

  await responseJson(
    await githubRequest(`git/refs/heads/${branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false })
    }),
    "content_ref_write"
  );
}

export async function GET() {
  const access = await getAdminAccess();
  if (!access.allowed) return noStoreJson({ error: "unauthorized" }, { status: 401 });

  const { services, faq, ...core } = cabinaContent;
  return noStoreJson({
    content: { core, services, faq },
    publishingConfigured: Boolean(token),
    branch
  });
}

export async function PUT(request: Request) {
  const access = await getAdminAccess();
  const canPublish = access.isOwner || access.organizationRole === "org:admin";
  if (!canPublish) return noStoreJson({ error: "forbidden" }, { status: 403 });
  if (!isSameOriginRequest(request)) return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  if (!token) return noStoreJson({ error: "publishing_not_configured" }, { status: 503 });
  if (exceedsContentLength(request, maxBodyBytes)) {
    return noStoreJson({ error: "payload_too_large" }, { status: 413 });
  }

  let payload: unknown;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
      return noStoreJson({ error: "payload_too_large" }, { status: 413 });
    }
    payload = JSON.parse(body);
  } catch {
    return noStoreJson({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = cabinaPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return noStoreJson({ error: "invalid_content" }, { status: 400 });
  }

  try {
    await createContentCommit([
      { path: files.core, content: jsonText(parsed.data.core) },
      { path: files.services, content: jsonText(parsed.data.services) },
      { path: files.faq, content: jsonText(parsed.data.faq) }
    ]);

    return noStoreJson({ ok: true, branch });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.error("Cabina content publishing failed", { reason });
    return noStoreJson({ error: "publishing_failed" }, { status: 502 });
  }
}
