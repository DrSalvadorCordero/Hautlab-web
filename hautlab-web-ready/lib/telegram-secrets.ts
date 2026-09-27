export type TelegramSecretName =
  | "bot_token"
  | "webhook_secret"
  | "pairing_secret_doctor"
  | "pairing_secret_karen"
  | "setup_key"
  | "mcp_key"
  | "cron_key";

const envMap: Record<TelegramSecretName, string> = {
  bot_token: "TELEGRAM_BOT_TOKEN",
  webhook_secret: "TELEGRAM_WEBHOOK_SECRET",
  pairing_secret_doctor: "TELEGRAM_PAIRING_SECRET_DOCTOR",
  pairing_secret_karen: "TELEGRAM_PAIRING_SECRET_KAREN",
  setup_key: "TELEGRAM_SETUP_KEY",
  mcp_key: "TELEGRAM_MCP_KEY",
  cron_key: "CRON_SECRET",
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = (
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

async function readVaultSecret(name: TelegramSecretName) {
  const config = supabaseConfig();
  if (!config) throw new Error("supabase_not_configured");

  const response = await fetch(
    `${config.url}/rest/v1/rpc/hautlab_telegram_secret`,
    {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ p_name: name }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    },
  );

  if (!response.ok) {
    throw new Error(`telegram_secret_${response.status}`);
  }

  const value = (await response.json().catch(() => null)) as unknown;
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export async function getTelegramSecret(
  name: TelegramSecretName,
  options?: { allowMissing?: boolean },
) {
  const envValue = process.env[envMap[name]]?.trim();
  if (envValue) return envValue;

  try {
    const value = await readVaultSecret(name);
    if (value) return value;
  } catch (error) {
    if (!options?.allowMissing) throw error;
  }

  if (options?.allowMissing) return "";
  throw new Error("telegram_secret_not_configured");
}

export async function hasTelegramSecret(name: TelegramSecretName) {
  return Boolean(await getTelegramSecret(name, { allowMissing: true }));
}
