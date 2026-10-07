import { randomUUID } from "node:crypto";

export const VISUAL_INTAKE_BUCKET = "hautlab-intake";
export const VISUAL_INTAKE_CONSENT_VERSION = "visual-intake-v1";
export const VISUAL_INTAKE_MAX_BYTES = 8 * 1024 * 1024;
export const VISUAL_INTAKE_MAX_ASSETS = 4;
export const VISUAL_INTAKE_RETENTION_DAYS = 30;

export const VISUAL_INTAKE_KINDS = [
  "front",
  "left_oblique",
  "right_oblique",
  "detail",
] as const;

export const VISUAL_INTAKE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type VisualIntakeKind = (typeof VISUAL_INTAKE_KINDS)[number];
export type VisualIntakeMimeType = (typeof VISUAL_INTAKE_MIME_TYPES)[number];

type AssetRow = {
  id: string;
  plan_id: string;
  kind: VisualIntakeKind;
  bucket_id: string;
  storage_path: string;
  mime_type: VisualIntakeMimeType;
  declared_size_bytes: number | string;
  status: "pending" | "uploaded" | "deleted";
  consent_version: string;
  consented_at: string;
  retention_until: string;
  uploaded_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VisualIntakeAsset = {
  id: string;
  kind: VisualIntakeKind;
  mimeType: VisualIntakeMimeType;
  sizeBytes: number;
  status: "pending" | "uploaded";
  consentedAt: string;
  retentionUntil: string;
  uploadedAt: string | null;
  createdAt: string;
};

export type AdminVisualIntakeAsset = VisualIntakeAsset & {
  planCode: string;
  whatsappLinked: boolean;
  viewUrl: string | null;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  if (!url || !key) throw new Error("supabase_not_configured");
  return { url, key };
}

function serviceHeaders(extra?: HeadersInit) {
  const { key } = getSupabaseConfig();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

async function dbJson<T>(path: string, init?: RequestInit): Promise<T> {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...serviceHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new Error(`intake_db_error:${response.status}`);
  }

  return payload as T;
}

async function storageJson<T>(path: string, init?: RequestInit): Promise<T> {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/storage/v1/${path}`, {
    ...init,
    headers: {
      ...serviceHeaders({
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      }),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    throw new Error(`intake_storage_error:${response.status}`);
  }

  return payload as T;
}

function encodedPath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function absoluteStorageUrl(value: string) {
  const { url } = getSupabaseConfig();
  if (/^https:\/\//i.test(value)) return value;
  return new URL(value, `${url}/storage/v1/`).toString();
}

function extensionForMime(mimeType: VisualIntakeMimeType) {
  const map: Record<VisualIntakeMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return map[mimeType];
}

function publicAsset(row: AssetRow): VisualIntakeAsset {
  return {
    id: row.id,
    kind: row.kind,
    mimeType: row.mime_type,
    sizeBytes: Number(row.declared_size_bytes),
    status: row.status === "uploaded" ? "uploaded" : "pending",
    consentedAt: row.consented_at,
    retentionUntil: row.retention_until,
    uploadedAt: row.uploaded_at,
    createdAt: row.created_at,
  };
}

function retentionDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + VISUAL_INTAKE_RETENTION_DAYS);
  return date.toISOString();
}

async function getPlanAssets(planId: string) {
  return dbJson<AssetRow[]>(
    `hautlab_plan_assets?plan_id=eq.${encodeURIComponent(planId)}&status=neq.deleted&select=*&order=created_at.asc`,
  );
}

async function signUpload(storagePath: string) {
  const data = await storageJson<{
    url?: string;
    signedURL?: string;
    signedUrl?: string;
    token?: string;
  }>(
    `object/upload/sign/${VISUAL_INTAKE_BUCKET}/${encodedPath(storagePath)}`,
    {
      method: "POST",
      body: JSON.stringify({ allowOverwrite: false }),
    },
  );

  const candidate = data.url ?? data.signedURL ?? data.signedUrl;
  if (!candidate) throw new Error("intake_sign_failed");

  let uploadUrl = absoluteStorageUrl(candidate);
  if (data.token && !/[?&]token=/.test(uploadUrl)) {
    const url = new URL(uploadUrl);
    url.searchParams.set("token", data.token);
    uploadUrl = url.toString();
  }
  return uploadUrl;
}

async function signView(storagePath: string, expiresInSeconds = 600) {
  const data = await storageJson<{
    signedURL?: string;
    signedUrl?: string;
    url?: string;
  }>(
    `object/sign/${VISUAL_INTAKE_BUCKET}/${encodedPath(storagePath)}`,
    {
      method: "POST",
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
    },
  );
  const candidate = data.signedURL ?? data.signedUrl ?? data.url;
  return candidate ? absoluteStorageUrl(candidate) : null;
}

async function removeStoragePaths(paths: string[]) {
  if (!paths.length) return;
  await storageJson(
    `object/${VISUAL_INTAKE_BUCKET}`,
    {
      method: "DELETE",
      body: JSON.stringify({ prefixes: paths }),
    },
  );
}

async function loadAsset(planId: string, assetId: string) {
  const rows = await dbJson<AssetRow[]>(
    `hautlab_plan_assets?id=eq.${encodeURIComponent(assetId)}&plan_id=eq.${encodeURIComponent(planId)}&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function listVisualIntakeAssets(planId: string) {
  const rows = await getPlanAssets(planId);
  return rows.map(publicAsset);
}

export async function createVisualIntakeUpload(input: {
  planId: string;
  kind: VisualIntakeKind;
  mimeType: VisualIntakeMimeType;
  sizeBytes: number;
}) {
  if (
    !VISUAL_INTAKE_KINDS.includes(input.kind) ||
    !VISUAL_INTAKE_MIME_TYPES.includes(input.mimeType) ||
    !Number.isInteger(input.sizeBytes) ||
    input.sizeBytes < 1 ||
    input.sizeBytes > VISUAL_INTAKE_MAX_BYTES
  ) {
    throw new Error("invalid_intake_file");
  }

  const existing = await getPlanAssets(input.planId);
  if (existing.length >= VISUAL_INTAKE_MAX_ASSETS) {
    throw new Error("intake_limit_reached");
  }
  if (existing.some((item) => item.kind === input.kind)) {
    throw new Error("intake_view_exists");
  }

  const id = randomUUID();
  const storagePath = `${input.planId}/${id}.${extensionForMime(input.mimeType)}`;
  const now = new Date().toISOString();

  const rows = await dbJson<AssetRow[]>(
    "hautlab_plan_assets?select=*",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        id,
        plan_id: input.planId,
        kind: input.kind,
        bucket_id: VISUAL_INTAKE_BUCKET,
        storage_path: storagePath,
        mime_type: input.mimeType,
        declared_size_bytes: input.sizeBytes,
        status: "pending",
        consent_version: VISUAL_INTAKE_CONSENT_VERSION,
        consented_at: now,
        retention_until: retentionDate(),
      }),
    },
  );

  const row = rows[0];
  if (!row) throw new Error("intake_metadata_create_failed");

  try {
    return {
      asset: publicAsset(row),
      uploadUrl: await signUpload(storagePath),
    };
  } catch (error) {
    await dbJson(
      `hautlab_plan_assets?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      },
    ).catch(() => undefined);
    throw error;
  }
}

export async function confirmVisualIntakeUpload(planId: string, assetId: string) {
  const asset = await loadAsset(planId, assetId);
  if (!asset || asset.status === "deleted") throw new Error("intake_asset_not_found");
  if (asset.status === "uploaded") return publicAsset(asset);

  const info = await storageJson<Record<string, unknown>>(
    `object/info/${VISUAL_INTAKE_BUCKET}/${encodedPath(asset.storage_path)}`,
  );

  const metadata =
    info.metadata && typeof info.metadata === "object"
      ? (info.metadata as Record<string, unknown>)
      : {};
  const storedSize = Number(metadata.size ?? info.size ?? 0);
  const storedMime = String(
    metadata.mimetype ??
      metadata.contentType ??
      info.mimetype ??
      info.content_type ??
      "",
  ).toLowerCase();

  const badSize =
    Number.isFinite(storedSize) &&
    storedSize > 0 &&
    (storedSize > VISUAL_INTAKE_MAX_BYTES ||
      storedSize !== Number(asset.declared_size_bytes));
  const badMime = Boolean(storedMime) && storedMime !== asset.mime_type;

  if (badSize || badMime) {
    await removeStoragePaths([asset.storage_path]).catch(() => undefined);
    await dbJson(
      `hautlab_plan_assets?id=eq.${encodeURIComponent(asset.id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "deleted",
          deleted_at: new Date().toISOString(),
        }),
      },
    ).catch(() => undefined);
    throw new Error("intake_file_mismatch");
  }

  const rows = await dbJson<AssetRow[]>(
    `hautlab_plan_assets?id=eq.${encodeURIComponent(asset.id)}&select=*`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "uploaded",
        uploaded_at: new Date().toISOString(),
      }),
    },
  );

  if (!rows[0]) throw new Error("intake_complete_failed");
  return publicAsset(rows[0]);
}

export async function deleteVisualIntakeAsset(planId: string, assetId: string) {
  const asset = await loadAsset(planId, assetId);
  if (!asset) return false;
  if (asset.status !== "deleted") {
    await removeStoragePaths([asset.storage_path]).catch((error) => {
      if (!(error instanceof Error) || !/404/.test(error.message)) throw error;
    });
    await dbJson(
      `hautlab_plan_assets?id=eq.${encodeURIComponent(asset.id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "deleted",
          deleted_at: new Date().toISOString(),
        }),
      },
    );
  }
  return true;
}

export async function cleanupExpiredVisualIntake() {
  let deleted = 0;

  for (let batch = 0; batch < 10; batch += 1) {
    const rows = await dbJson<AssetRow[]>(
      `hautlab_plan_assets?status=neq.deleted&retention_until=lt.${encodeURIComponent(new Date().toISOString())}&select=*&order=retention_until.asc&limit=100`,
    );
    if (!rows.length) break;

    await removeStoragePaths(rows.map((item) => item.storage_path));
    const ids = rows.map((item) => item.id).join(",");
    await dbJson(
      `hautlab_plan_assets?id=in.(${ids})`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          status: "deleted",
          deleted_at: new Date().toISOString(),
        }),
      },
    );
    deleted += rows.length;
  }

  return { deleted };
}

export async function listAdminVisualIntake(limit = 60) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const rows = await dbJson<Array<AssetRow & {
    hautlab_plans: { public_code: string; conversation_id: string | null } | null;
  }>>(
    `hautlab_plan_assets?status=eq.uploaded&select=*,hautlab_plans(public_code,conversation_id)&order=created_at.desc&limit=${safeLimit}`,
  );

  return Promise.all(
    rows.map(async (row) => ({
      ...publicAsset(row),
      planCode: row.hautlab_plans?.public_code ?? "Plan",
      whatsappLinked: Boolean(row.hautlab_plans?.conversation_id),
      viewUrl: await signView(row.storage_path, 600).catch(() => null),
    } satisfies AdminVisualIntakeAsset)),
  );
}
