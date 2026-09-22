type JsonRecord = Record<string, unknown>;

export type NimboIntegrationConfig = {
  id: "global";
  enabled: boolean;
  base_url: string | null;
  doctor_account_id: number | null;
  doctor_name: string | null;
  organization_id: number | null;
  organization_slug: string | null;
  location_id: number | null;
  timezone: string;
  consultation_duration_minutes: number | null;
  portal_url: string | null;
  access_token_expires_at: string | null;
  last_connected_at: string | null;
  last_verified_at: string | null;
  last_error: string | null;
  updated_at: string;
};

export type NimboAvailabilityDay = {
  date: string;
  available: boolean;
  slots: Array<{ startsAt: string; label: string }>;
};

export type NimboPatient = {
  id: number;
  fullName: string | null;
};

export type NimboCreatedSchedule = {
  id: number;
  startsAt: string;
  endsAt: string;
};

type TokenPayload = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
};

class NimboApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "NimboApiError";
    this.status = status;
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

function supabaseHeaders(key: string, prefer?: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function supabaseJson<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("supabase_not_configured");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...supabaseHeaders(config.key),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
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
    throw new Error(`supabase_${response.status}`);
  }

  return payload as T;
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asFiniteNumber(value: unknown): number | null {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanString(value: unknown, max = 500): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : null;
}

function normalizeBaseUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new NimboApiError("nimbo_invalid_base_url");
  }
  if (url.protocol !== "https:") {
    throw new NimboApiError("nimbo_base_url_requires_https");
  }
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function endpoint(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function tokenAttempt(
  baseUrl: string,
  payload: Record<string, string>,
  encoding: "multipart" | "json" | "form",
) {
  let body: BodyInit;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (encoding === "multipart") {
    const form = new FormData();
    for (const [key, value] of Object.entries(payload)) form.append(key, value);
    body = form;
  } else if (encoding === "json") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(payload);
  } else {
    headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
    body = new URLSearchParams(payload).toString();
  }

  const response = await fetch(endpoint(baseUrl, "oauth/token"), {
    method: "POST",
    headers,
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const result = await parseResponse(response);
  return { response, result };
}

async function requestToken(baseUrl: string, payload: Record<string, string>) {
  const normalized = normalizeBaseUrl(baseUrl);
  const attempts: Array<"multipart" | "json" | "form"> =
    payload.grant_type === "password"
      ? ["multipart", "form", "json"]
      : ["json", "form", "multipart"];
  let lastStatus: number | null = null;
  let lastDiagnostic: string | null = null;

  for (const encoding of attempts) {
    const { response, result } = await tokenAttempt(normalized, payload, encoding);
    lastStatus = response.status;
    const diagnosticRecord = asRecord(result);
    const diagnostic =
      cleanString(diagnosticRecord?.error_description, 180) ??
      cleanString(diagnosticRecord?.error, 120) ??
      cleanString(diagnosticRecord?.message, 180) ??
      (typeof result === "string" ? cleanString(result, 180) : null);
    if (diagnostic) {
      lastDiagnostic = diagnostic
        .replace(/(password|access_token|refresh_token|token)\\s*[=:]\\s*[^\\s,;]+/gi, "$1=[redacted]")
        .slice(0, 180);
    }
    const record = diagnosticRecord as TokenPayload | null;
    const accessToken = cleanString(record?.access_token, 8_000);
    const refreshToken = cleanString(record?.refresh_token, 8_000);

    if (response.ok && accessToken && refreshToken) {
      return {
        accessToken,
        refreshToken,
        expiresIn: asFiniteNumber(record?.expires_in),
      };
    }

    if (response.status !== 400 && response.status !== 401 && response.status !== 415) {
      break;
    }
  }

  const suffix = [
    lastStatus ? `http_${lastStatus}` : null,
    lastDiagnostic ? lastDiagnostic.replace(/[^a-zA-Z0-9_. -]+/g, " ").trim() : null,
  ]
    .filter(Boolean)
    .join(":");
  throw new NimboApiError(
    suffix ? `nimbo_authentication_failed:${suffix}` : "nimbo_authentication_failed",
    lastStatus,
  );
}

type NimboSecretName = "refresh_token" | "access_token";

async function storeSecret(name: NimboSecretName, value: string) {
  await supabaseJson("rpc/hautlab_nimbo_set_secret", {
    method: "POST",
    body: JSON.stringify({ p_name: name, p_secret: value }),
  });
}

async function readSecret(name: NimboSecretName) {
  return supabaseJson<string>("rpc/hautlab_nimbo_secret", {
    method: "POST",
    body: JSON.stringify({ p_name: name }),
  });
}

async function deleteSecret(name: NimboSecretName) {
  await supabaseJson("rpc/hautlab_nimbo_delete_secret", {
    method: "POST",
    body: JSON.stringify({ p_name: name }),
  });
}

export async function getNimboConfig(): Promise<NimboIntegrationConfig> {
  const rows = await supabaseJson<NimboIntegrationConfig[]>(
    "nimbo_integration_config?id=eq.global&limit=1",
  );
  const row = rows[0];
  if (!row) throw new Error("nimbo_config_missing");
  return row;
}

async function patchNimboConfig(
  patch: Partial<Omit<NimboIntegrationConfig, "id" | "created_at" | "updated_at">>,
) {
  const rows = await supabaseJson<NimboIntegrationConfig[]>(
    "nimbo_integration_config?id=eq.global",
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    },
  );
  const row = rows[0];
  if (!row) throw new Error("nimbo_config_update_failed");
  return row;
}

function deepFind(
  value: unknown,
  predicate: (key: string, candidate: unknown) => boolean,
  depth = 0,
): unknown {
  if (depth > 7 || value === null || value === undefined) return undefined;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 25)) {
      const found = deepFind(item, predicate, depth + 1);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  const record = asRecord(value);
  if (!record) return undefined;
  for (const [key, candidate] of Object.entries(record)) {
    if (predicate(key, candidate)) return candidate;
  }
  for (const candidate of Object.values(record)) {
    const found = deepFind(candidate, predicate, depth + 1);
    if (found !== undefined) return found;
  }
  return undefined;
}

function nestedRecord(payload: unknown, keys: string[]) {
  const root = asRecord(payload);
  if (!root) return null;
  for (const key of keys) {
    const candidate = asRecord(root[key]);
    if (candidate) return candidate;
  }
  return root;
}

function discoverAccount(payload: unknown) {
  const record = nestedRecord(payload, ["account", "data"]);
  const id = asFiniteNumber(record?.id);
  const fullName =
    cleanString(record?.full_name, 180) ??
    cleanString(record?.name, 180) ??
    cleanString(
      deepFind(payload, (key, candidate) =>
        ["full_name", "display_name"].includes(key) && typeof candidate === "string"
      ),
      180,
    );

  const duration = asFiniteNumber(
    deepFind(
      payload,
      (key, candidate) =>
        key === "consultation_duration" &&
        (typeof candidate === "number" || typeof candidate === "string"),
    ),
  );
  const timezone = cleanString(
    deepFind(
      payload,
      (key, candidate) => key === "timezone" && typeof candidate === "string",
    ),
    120,
  );

  return { id, fullName, duration, timezone };
}


function organizationMemberArray(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  for (const key of ["organization_members", "members", "accounts", "data"]) {
    if (Array.isArray(root?.[key])) return root![key] as unknown[];
  }
  return [];
}

function discoverAccountFromMembers(payload: unknown, username: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const members = organizationMemberArray(payload);

  for (const item of members) {
    const row = asRecord(item);
    if (!row) continue;
    const nestedAccount = asRecord(row.account);

    const email =
      cleanString(nestedAccount?.email, 240) ??
      cleanString(row.email, 240) ??
      cleanString(
        deepFind(
          item,
          (key, candidate) =>
            ["email", "username"].includes(key) && typeof candidate === "string",
        ),
        240,
      );

    if (!email || email.toLowerCase() !== normalizedUsername) continue;

    const id =
      asFiniteNumber(row.account_id) ??
      asFiniteNumber(nestedAccount?.id) ??
      asFiniteNumber(
        deepFind(
          item,
          (key, candidate) =>
            key === "account_id" &&
            (typeof candidate === "number" || typeof candidate === "string"),
        ),
      );

    const accountLike = nestedAccount ?? row;
    const discovered = discoverAccount(accountLike);
    return {
      id: id ?? discovered.id,
      fullName: discovered.fullName,
      duration: discovered.duration,
      timezone: discovered.timezone,
    };
  }

  return { id: null, fullName: null, duration: null, timezone: null };
}

function discoverOrganization(payload: unknown) {
  const record = nestedRecord(payload, ["organization", "data"]);
  return {
    id:
      asFiniteNumber(record?.id) ??
      asFiniteNumber(
        deepFind(payload, (key, candidate) =>
          key === "organization_id" &&
          (typeof candidate === "number" || typeof candidate === "string")
        ),
      ),
    slug:
      cleanString(record?.slug, 160) ??
      cleanString(
        deepFind(
          payload,
          (key, candidate) =>
            ["organization_slug", "slug"].includes(key) && typeof candidate === "string",
        ),
        160,
      ),
  };
}

function discoverLocation(payload: unknown) {
  const root = asRecord(payload);
  const list = Array.isArray(root?.locations)
    ? root?.locations
    : Array.isArray(payload)
      ? payload
      : [];
  const first = list.find((item) => asFiniteNumber(asRecord(item)?.id) !== null);
  return asFiniteNumber(asRecord(first)?.id);
}

function discoverPortalUrl(payloads: unknown[]) {
  for (const payload of payloads) {
    const found = deepFind(payload, (key, candidate) => {
      if (typeof candidate !== "string") return false;
      if (!/^https:\/\//i.test(candidate)) return false;
      return /(portal|booking|appointment|site|public_url|schedule)/i.test(key);
    });
    const url = cleanString(found, 1_000);
    if (url) return url;
  }
  return null;
}

async function rawNimboFetch(
  baseUrl: string,
  path: string,
  accessToken: string,
  init?: RequestInit,
) {
  const response = await fetch(endpoint(baseUrl, path), {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new NimboApiError(`nimbo_api_${response.status}`, response.status);
  }
  return payload;
}

export async function connectNimbo(input: {
  baseUrl: string;
  username: string;
  password: string;
}) {
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  const username = input.username.trim();
  const password = input.password;
  if (!username || !password) throw new NimboApiError("nimbo_credentials_required");

  const token = await requestToken(baseUrl, {
    grant_type: "password",
    username,
    password,
  });

  const [accountPayload, organizationPayload, membersPayload, locationsPayload] =
    await Promise.all([
      // Some production accounts do not expose accounts/me even though the
      // public API token is valid, so keep this as an optional fast path.
      rawNimboFetch(baseUrl, "accounts/me", token.accessToken).catch(() => null),
      rawNimboFetch(baseUrl, "organizations/current", token.accessToken),
      rawNimboFetch(baseUrl, "organization_members", token.accessToken).catch(
        () => null,
      ),
      rawNimboFetch(baseUrl, "locations", token.accessToken).catch(() => null),
    ]);

  const directAccount = discoverAccount(accountPayload);
  const memberAccount = discoverAccountFromMembers(membersPayload, username);
  const account = directAccount.id ? directAccount : memberAccount;
  if (!account.id) {
    throw new NimboApiError("nimbo_doctor_account_not_found");
  }
  const organization = discoverOrganization(organizationPayload);
  const portalUrl = discoverPortalUrl([
    accountPayload,
    organizationPayload,
    membersPayload,
    locationsPayload,
  ]);

  await Promise.all([
    storeSecret("access_token", token.accessToken),
    storeSecret("refresh_token", token.refreshToken),
  ]);
  const now = new Date().toISOString();
  const accessTokenExpiresAt = new Date(
    Date.now() + Math.max(60, token.expiresIn ?? 86_400) * 1_000,
  ).toISOString();
  return patchNimboConfig({
    enabled: true,
    base_url: baseUrl,
    doctor_account_id: account.id,
    doctor_name: account.fullName,
    organization_id: organization.id,
    organization_slug: organization.slug,
    location_id: discoverLocation(locationsPayload),
    timezone: account.timezone ?? "America/Merida",
    consultation_duration_minutes: account.duration,
    portal_url: portalUrl,
    access_token_expires_at: accessTokenExpiresAt,
    last_connected_at: now,
    last_verified_at: now,
    last_error: null,
  });
}

async function refreshAccessToken(config: NimboIntegrationConfig) {
  if (!config.base_url) throw new NimboApiError("nimbo_not_connected");

  const expiresAt = config.access_token_expires_at
    ? Date.parse(config.access_token_expires_at)
    : NaN;
  if (Number.isFinite(expiresAt) && expiresAt > Date.now() + 60_000) {
    try {
      return await readSecret("access_token");
    } catch {
      // Missing access token: fall through to refresh.
    }
  }

  const refreshToken = await readSecret("refresh_token");
  try {
    const token = await requestToken(config.base_url, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    await Promise.all([
      storeSecret("access_token", token.accessToken),
      token.refreshToken !== refreshToken
        ? storeSecret("refresh_token", token.refreshToken)
        : Promise.resolve(),
    ]);

    await patchNimboConfig({
      access_token_expires_at: new Date(
        Date.now() + Math.max(60, token.expiresIn ?? 86_400) * 1_000,
      ).toISOString(),
      last_error: null,
    });

    return token.accessToken;
  } catch (error) {
    // Another serverless instance may have rotated the refresh token first.
    const latest = await getNimboConfig();
    const latestExpiry = latest.access_token_expires_at
      ? Date.parse(latest.access_token_expires_at)
      : NaN;
    if (Number.isFinite(latestExpiry) && latestExpiry > Date.now() + 30_000) {
      try {
        return await readSecret("access_token");
      } catch {
        // Preserve the original refresh error below.
      }
    }
    throw error;
  }
}

async function nimboFetch(
  config: NimboIntegrationConfig,
  path: string,
  init?: RequestInit,
) {
  const accessToken = await refreshAccessToken(config);
  return rawNimboFetch(config.base_url!, path, accessToken, init);
}

export async function verifyNimboConnection() {
  const config = await getNimboConfig();
  if (!config.base_url) throw new NimboApiError("nimbo_not_connected");
  try {
    const [accountPayload, organizationPayload] = await Promise.all([
      nimboFetch(config, "accounts/me").catch(() => null),
      // organizations/current is part of Nimbo's published API and is enough
      // to prove that the stored OAuth token is still valid.
      nimboFetch(config, "organizations/current"),
    ]);
    const account = discoverAccount(accountPayload);
    const organization = discoverOrganization(organizationPayload);
    const doctorAccountId = account.id ?? config.doctor_account_id;
    if (!doctorAccountId) {
      throw new NimboApiError("nimbo_doctor_account_not_found");
    }
    return patchNimboConfig({
      enabled: true,
      doctor_account_id: doctorAccountId,
      doctor_name: account.fullName ?? config.doctor_name,
      organization_id: organization.id ?? config.organization_id,
      organization_slug: organization.slug ?? config.organization_slug,
      timezone: account.timezone ?? config.timezone,
      consultation_duration_minutes:
        account.duration ?? config.consultation_duration_minutes,
      last_verified_at: new Date().toISOString(),
      last_error: null,
    });
  } catch (error) {
    await patchNimboConfig({
      enabled: false,
      last_error: error instanceof Error ? error.message.slice(0, 300) : "nimbo_verify_failed",
    });
    throw error;
  }
}

export async function updateNimboSettings(input: {
  enabled?: boolean;
  portalUrl?: string | null;
  consultationDurationMinutes?: number | null;
}) {
  const patch: Partial<NimboIntegrationConfig> = {};
  if (typeof input.enabled === "boolean") patch.enabled = input.enabled;

  if (input.portalUrl !== undefined) {
    const candidate = input.portalUrl?.trim() || null;
    if (candidate) {
      const url = new URL(candidate);
      if (url.protocol !== "https:") throw new NimboApiError("nimbo_portal_requires_https");
      patch.portal_url = url.toString();
    } else {
      patch.portal_url = null;
    }
  }

  if (input.consultationDurationMinutes !== undefined) {
    const value = input.consultationDurationMinutes;
    if (value !== null && (!Number.isInteger(value) || value < 10 || value > 240)) {
      throw new NimboApiError("nimbo_invalid_duration");
    }
    patch.consultation_duration_minutes = value;
  }

  return patchNimboConfig(patch);
}

export async function disconnectNimbo() {
  await Promise.all([
    deleteSecret("access_token").catch(() => undefined),
    deleteSecret("refresh_token").catch(() => undefined),
  ]);
  return patchNimboConfig({
    enabled: false,
    base_url: null,
    doctor_account_id: null,
    doctor_name: null,
    organization_id: null,
    organization_slug: null,
    location_id: null,
    consultation_duration_minutes: null,
    portal_url: null,
    access_token_expires_at: null,
    last_error: null,
  });
}

function timezoneOffset(date: string, timeZone: string) {
  try {
    const probe = new Date(`${date}T12:00:00Z`);
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
      hour: "2-digit",
    })
      .formatToParts(probe)
      .find((item) => item.type === "timeZoneName")?.value;
    if (!part || part === "GMT") return "+00:00";
    const offset = part.replace("GMT", "");
    return /^[+-]\d{2}:\d{2}$/.test(offset) ? offset : "+00:00";
  } catch {
    return "-06:00";
  }
}

function parseClock(value: string) {
  const normalized = value.trim().toUpperCase();
  const twelve = normalized.match(/\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/);
  if (twelve) {
    let hour = Number(twelve[1]) % 12;
    if (twelve[3] === "PM") hour += 12;
    return `${String(hour).padStart(2, "0")}:${twelve[2]}`;
  }
  const twentyFour = normalized.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFour) {
    return `${String(Number(twentyFour[1])).padStart(2, "0")}:${twentyFour[2]}`;
  }
  return null;
}

function scheduleToIso(date: string, schedule: string, timeZone: string) {
  const trimmed = schedule.trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : trimmed;
  }
  const clock = parseClock(trimmed);
  if (!clock) return null;
  return `${date}T${clock}:00${timezoneOffset(date, timeZone)}`;
}

function slotLabel(startsAt: string, timeZone: string) {
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return startsAt;
  return new Intl.DateTimeFormat("es-MX", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function parseAvailability(
  payload: unknown,
  timeZone: string,
): NimboAvailabilityDay[] {
  const root = asRecord(payload);
  const hours = Array.isArray(root?.hours) ? root.hours : [];
  const result: NimboAvailabilityDay[] = [];

  for (const item of hours) {
    const row = asRecord(item);
    const date = cleanString(row?.date, 20);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const schedules = Array.isArray(row?.schedules)
      ? row.schedules
          .map((value) => cleanString(value, 120))
          .filter((value): value is string => Boolean(value))
      : [];
    const slots = schedules
      .map((schedule) => scheduleToIso(date, schedule, timeZone))
      .filter((value): value is string => Boolean(value))
      .map((startsAt) => ({
        startsAt,
        label: slotLabel(startsAt, timeZone),
      }));
    result.push({
      date,
      available: row?.available === true || slots.length > 0,
      slots,
    });
  }
  return result;
}

export async function getNimboAvailability(input: {
  from: string;
  to: string;
}): Promise<NimboAvailabilityDay[]> {
  const config = await getNimboConfig();
  if (!config.enabled || !config.base_url || !config.doctor_account_id) return [];

  const params = new URLSearchParams({
    from: input.from,
    to: input.to,
    monthly: "false",
  });

  if (config.organization_slug) {
    params.set("slug", config.organization_slug);
    try {
      const orgPayload = await nimboFetch(
        config,
        `calendar/available_hours_organization?${params.toString()}`,
      );
      const parsed = parseAvailability(orgPayload, config.timezone);
      if (parsed.some((day) => day.slots.length > 0)) return parsed;
    } catch {
      // Personal-calendar fallback below.
    }
    params.delete("slug");
  }

  params.set("account", String(config.doctor_account_id));
  const payload = await nimboFetch(
    config,
    `calendar/available_hours?${params.toString()}`,
  );
  return parseAvailability(payload, config.timezone);
}

function phoneCandidates(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const values = new Set<string>();
  if (digits) values.add(digits);

  const mexicoLegacy = digits.match(/^521(\d{10})$/);
  if (mexicoLegacy) {
    values.add("52" + mexicoLegacy[1]);
    values.add(mexicoLegacy[1]);
  }

  const mexico = digits.match(/^52(\d{10})$/);
  if (mexico) {
    values.add("521" + mexico[1]);
    values.add(mexico[1]);
  }

  const us = digits.match(/^1(\d{10})$/);
  if (us) values.add(us[1]);

  return [...values];
}

function patientArray(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  for (const key of ["people", "persons", "accounts", "data"]) {
    if (Array.isArray(root?.[key])) return root![key] as unknown[];
  }
  return [];
}

export async function findNimboPatientByPhone(
  phone: string,
): Promise<NimboPatient | null> {
  const config = await getNimboConfig();
  if (!config.enabled || !config.doctor_account_id) return null;

  for (const candidate of phoneCandidates(phone)) {
    const params = new URLSearchParams({ telephone2: candidate });
    try {
      const payload = await nimboFetch(
        config,
        `accounts/${config.doctor_account_id}/people?${params.toString()}`,
      );
      for (const item of patientArray(payload)) {
        const row = asRecord(item);
        const id = asFiniteNumber(row?.id);
        if (!id) continue;
        return {
          id,
          fullName:
            cleanString(row?.full_name, 180) ??
            ([cleanString(row?.first_name, 80), cleanString(row?.last_name, 100)]
              .filter(Boolean)
              .join(" ") ||
              null),
        };
      }
    } catch {
      // Try the next normalized phone representation.
    }
  }
  return null;
}


function splitFullName(value: string) {
  const normalized = value
    .replace(/[^\\p{L}\\p{M}'’.-]+/gu, " ")
    .replace(/\\s+/g, " ")
    .trim();
  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length < 2 || normalized.length < 5) {
    throw new NimboApiError("nimbo_full_name_required");
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function createNimboPatient(input: {
  phone: string;
  fullName: string;
}): Promise<NimboPatient> {
  const config = await getNimboConfig();
  if (!config.enabled || !config.doctor_account_id) {
    throw new NimboApiError("nimbo_booking_not_ready");
  }

  const { firstName, lastName } = splitFullName(input.fullName);
  const rawDigits = input.phone.replace(/\D/g, "");
  const isMexican = /^52(?:1)?\d{10}$/.test(rawDigits);
  if (!isMexican) {
    throw new NimboApiError("nimbo_new_patient_country_requires_human_review");
  }

  const candidates = phoneCandidates(input.phone);
  const telephone2 = candidates.find((value) => value.length === 10);
  if (!telephone2) throw new NimboApiError("nimbo_invalid_phone");

  const payload = await nimboFetch(config, "people", {
    method: "POST",
    body: JSON.stringify({
      person: {
        first_name: firstName,
        last_name: lastName,
        telephone2,
        phone_country_id: "142",
        account_id: String(config.doctor_account_id),
        without_cellphone: false,
        send_welcome_email: false,
        person_attributes: {
          send_reminders: false,
        },
      },
    }),
  });

  const root = asRecord(payload);
  const person = asRecord(root?.person) ?? root;
  const id = asFiniteNumber(person?.id);
  if (!id) throw new NimboApiError("nimbo_patient_creation_unverified");

  return {
    id,
    fullName:
      cleanString(person?.full_name, 180) ??
      [firstName, lastName].join(" "),
  };
}

function addMinutes(iso: string, minutes: number) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) throw new NimboApiError("nimbo_invalid_slot");
  return new Date(date.getTime() + minutes * 60_000).toISOString();
}

export async function createNimboSchedule(input: {
  personId: number;
  startsAt: string;
  cause: string;
}) {
  const config = await getNimboConfig();
  if (
    !config.enabled ||
    !config.doctor_account_id ||
    !config.consultation_duration_minutes
  ) {
    throw new NimboApiError("nimbo_booking_not_ready");
  }

  const date = input.startsAt.slice(0, 10);
  const availability = await getNimboAvailability({ from: date, to: date });
  const exact = availability
    .flatMap((day) => day.slots)
    .some((slot) => new Date(slot.startsAt).getTime() === new Date(input.startsAt).getTime());
  if (!exact) throw new NimboApiError("nimbo_slot_no_longer_available", 409);

  const endsAt = addMinutes(
    input.startsAt,
    config.consultation_duration_minutes,
  );

  const payload = await nimboFetch(config, "consultation_schedules", {
    method: "POST",
    body: JSON.stringify({
      consultation_schedule: {
        cause: input.cause.trim().slice(0, 220) || "Cita HAUTLAB",
        starts_at: input.startsAt,
        ends_at: endsAt,
        reminder: true,
        person_id: String(input.personId),
        account_id: String(config.doctor_account_id),
      },
    }),
  });

  const root = asRecord(payload);
  const schedule = asRecord(root?.consultation_schedule) ?? root;
  const id = asFiniteNumber(schedule?.id);
  const startsAt = cleanString(schedule?.starts_at, 80) ?? input.startsAt;
  const responseEndsAt = cleanString(schedule?.ends_at, 80) ?? endsAt;
  if (!id) throw new NimboApiError("nimbo_schedule_creation_unverified");

  return {
    id,
    startsAt,
    endsAt: responseEndsAt,
  } satisfies NimboCreatedSchedule;
}

export function isNimboReadyForAutobooking(config: NimboIntegrationConfig) {
  return Boolean(
    config.enabled &&
      config.base_url &&
      config.doctor_account_id &&
      config.consultation_duration_minutes,
  );
}
