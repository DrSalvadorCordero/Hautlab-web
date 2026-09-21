import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVER_NAME = "HAUTLAB Meta Ads MCP";
const SERVER_VERSION = "1.0.0";
const MCP_PROTOCOL = "2025-06-18";
const MCP_KEY_SHA256 = "15a1bd2eca786b0ba095718f3eedb5f6a5ba3bd165b5de4ecca8a4abf9a2f7ea";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type RpcRequest = { jsonrpc?: string; id?: string | number | null; method?: string; params?: any };

function jsonRpc(id: RpcRequest["id"], result: Json, status = 200) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, { status });
}

function jsonRpcError(id: RpcRequest["id"], code: number, message: string, data?: Json, status = 200) {
  return NextResponse.json(
    { jsonrpc: "2.0", id: id ?? null, error: { code, message, ...(data === undefined ? {} : { data }) } },
    { status }
  );
}

function bridgeKey(req: NextRequest) {
  return req.nextUrl.searchParams.get("key") ?? req.headers.get("x-hautlab-mcp-key") ?? "";
}

function validBridgeKey(req: NextRequest) {
  const candidate = bridgeKey(req);
  if (!candidate) return false;
  const actual = createHash("sha256").update(candidate).digest();
  const expected = Buffer.from(MCP_KEY_SHA256, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function graphVersion() {
  return process.env.META_GRAPH_VERSION?.trim() || "v23.0";
}

function metaToken() {
  return (
    process.env.META_MARKETING_ACCESS_TOKEN?.trim() ||
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ||
    ""
  );
}

function normalizeActId(value: string) {
  return value.startsWith("act_") ? value : `act_${value}`;
}

function clampLimit(value: unknown, fallback = 50) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(100, Math.trunc(n)));
}

function textContent(value: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: value
  };
}

async function graphGet(path: string, params: Record<string, string | number | undefined> = {}) {
  const token = metaToken();
  if (!token) throw new Error("Meta Marketing API token is not configured on the server.");

  const url = new URL(`https://graph.facebook.com/${graphVersion()}/${path.replace(/^\/+/, "")}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = body?.error ?? {};
    throw new Error(
      `Meta Graph API ${response.status}: ${err.message ?? "request_failed"}` +
      (err.code ? ` (code ${err.code})` : "")
    );
  }
  return body;
}

function encodeForm(input: Record<string, unknown>) {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "object") form.set(key, JSON.stringify(value));
    else form.set(key, String(value));
  }
  return form;
}

async function graphPost(path: string, body: Record<string, unknown>) {
  const token = metaToken();
  if (!token) throw new Error("Meta Marketing API token is not configured on the server.");

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion()}/${path.replace(/^\/+/, "")}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: encodeForm(body),
      cache: "no-store"
    }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = payload?.error ?? {};
    throw new Error(
      `Meta Graph API ${response.status}: ${err.message ?? "request_failed"}` +
      (err.code ? ` (code ${err.code})` : "")
    );
  }
  return payload;
}

function requireApproved(args: any) {
  if (args?.confirmation !== "APPROVED") {
    throw new Error('Write blocked. The tool requires confirmation="APPROVED" after the user explicitly approves the exact change.');
  }
}

function pickChanges(input: any, allowed: string[]) {
  const changes = input && typeof input === "object" ? input : {};
  const output: Record<string, unknown> = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(changes, key)) output[key] = changes[key];
  }
  if (!Object.keys(output).length) throw new Error("No supported changes were supplied.");
  return output;
}

const tools = [
  {
    name: "meta_connection_status",
    description: "Verify the server-side Meta token and report granted Meta permissions. Read-only.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "meta_list_ad_accounts",
    description: "List Meta ad accounts accessible to the configured token. Read-only.",
    inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 100 } }, additionalProperties: false }
  },
  {
    name: "meta_list_campaigns",
    description: "List campaigns for one Meta ad account, including status, objective, budget and bidding fields. Read-only.",
    inputSchema: {
      type: "object",
      required: ["ad_account_id"],
      properties: {
        ad_account_id: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 100 }
      },
      additionalProperties: false
    }
  },
  {
    name: "meta_get_campaign",
    description: "Get detailed configuration for one Meta campaign. Read-only.",
    inputSchema: { type: "object", required: ["campaign_id"], properties: { campaign_id: { type: "string" } }, additionalProperties: false }
  },
  {
    name: "meta_campaign_insights",
    description: "Get Meta campaign performance metrics such as spend, impressions, clicks, CTR, CPC, CPM and actions. Read-only.",
    inputSchema: {
      type: "object",
      required: ["campaign_id"],
      properties: {
        campaign_id: { type: "string" },
        date_preset: { type: "string", description: "Examples: today, yesterday, last_7d, last_14d, last_30d, maximum" }
      },
      additionalProperties: false
    }
  },
  {
    name: "meta_list_adsets",
    description: "List ad sets in an account or campaign with targeting, optimization, budget, bid and delivery configuration. Read-only.",
    inputSchema: {
      type: "object",
      properties: {
        ad_account_id: { type: "string" },
        campaign_id: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 100 }
      },
      anyOf: [{ required: ["ad_account_id"] }, { required: ["campaign_id"] }],
      additionalProperties: false
    }
  },
  {
    name: "meta_get_adset",
    description: "Get detailed configuration for one Meta ad set. Read-only.",
    inputSchema: { type: "object", required: ["adset_id"], properties: { adset_id: { type: "string" } }, additionalProperties: false }
  },
  {
    name: "meta_adset_insights",
    description: "Get performance metrics for one Meta ad set. Read-only.",
    inputSchema: {
      type: "object",
      required: ["adset_id"],
      properties: { adset_id: { type: "string" }, date_preset: { type: "string" } },
      additionalProperties: false
    }
  },
  {
    name: "meta_list_ads",
    description: "List ads in an ad account, campaign, or ad set, including creative metadata and delivery state. Read-only.",
    inputSchema: {
      type: "object",
      properties: {
        ad_account_id: { type: "string" },
        campaign_id: { type: "string" },
        adset_id: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 100 }
      },
      anyOf: [{ required: ["ad_account_id"] }, { required: ["campaign_id"] }, { required: ["adset_id"] }],
      additionalProperties: false
    }
  },
  {
    name: "meta_get_ad",
    description: "Get one Meta ad and its creative metadata. Read-only.",
    inputSchema: { type: "object", required: ["ad_id"], properties: { ad_id: { type: "string" } }, additionalProperties: false }
  },
  {
    name: "meta_ad_insights",
    description: "Get performance metrics for one Meta ad. Read-only.",
    inputSchema: {
      type: "object",
      required: ["ad_id"],
      properties: { ad_id: { type: "string" }, date_preset: { type: "string" } },
      additionalProperties: false
    }
  },
  {
    name: "meta_update_campaign",
    description: "Update an existing Meta campaign. WRITE TOOL. Only call after the user explicitly approved the exact change; confirmation must equal APPROVED.",
    inputSchema: {
      type: "object",
      required: ["campaign_id", "changes", "confirmation"],
      properties: {
        campaign_id: { type: "string" },
        changes: {
          type: "object",
          description: "Supported: name, status, daily_budget, lifetime_budget, bid_strategy.",
          additionalProperties: true
        },
        confirmation: { type: "string", enum: ["APPROVED"] }
      },
      additionalProperties: false
    }
  },
  {
    name: "meta_update_adset",
    description: "Update an existing Meta ad set. WRITE TOOL. Only call after explicit approval; confirmation must equal APPROVED.",
    inputSchema: {
      type: "object",
      required: ["adset_id", "changes", "confirmation"],
      properties: {
        adset_id: { type: "string" },
        changes: {
          type: "object",
          description: "Supported: name, status, daily_budget, lifetime_budget, bid_amount, bid_strategy, billing_event, optimization_goal, targeting, destination_type, start_time, end_time, attribution_spec.",
          additionalProperties: true
        },
        confirmation: { type: "string", enum: ["APPROVED"] }
      },
      additionalProperties: false
    }
  },
  {
    name: "meta_update_ad",
    description: "Update supported fields on an existing Meta ad. WRITE TOOL. Only call after explicit approval; confirmation must equal APPROVED.",
    inputSchema: {
      type: "object",
      required: ["ad_id", "changes", "confirmation"],
      properties: {
        ad_id: { type: "string" },
        changes: {
          type: "object",
          description: "Supported: name, status, tracking_specs, conversion_specs.",
          additionalProperties: true
        },
        confirmation: { type: "string", enum: ["APPROVED"] }
      },
      additionalProperties: false
    }
  }
] as const;

async function callTool(name: string, args: any) {
  switch (name) {
    case "meta_connection_status": {
      const configured = Boolean(metaToken());
      if (!configured) return textContent({ configured: false, reason: "missing_meta_token" });
      const [me, permissions] = await Promise.all([
        graphGet("me", { fields: "id,name" }),
        graphGet("me/permissions", { limit: 100 })
      ]);
      return textContent({ configured: true, graph_version: graphVersion(), identity: me, permissions: permissions?.data ?? [] });
    }
    case "meta_list_ad_accounts":
      return textContent(
        await graphGet("me/adaccounts", {
          fields: "id,name,account_status,currency,timezone_name,business_name,amount_spent,balance",
          limit: clampLimit(args?.limit)
        })
      );

    case "meta_list_campaigns":
      return textContent(
        await graphGet(`${normalizeActId(String(args.ad_account_id))}/campaigns`, {
          fields: "id,name,status,effective_status,objective,buying_type,daily_budget,lifetime_budget,bid_strategy,start_time,stop_time,special_ad_categories,created_time,updated_time",
          limit: clampLimit(args?.limit)
        })
      );

    case "meta_get_campaign":
      return textContent(
        await graphGet(String(args.campaign_id), {
          fields: "id,name,status,effective_status,objective,buying_type,daily_budget,lifetime_budget,bid_strategy,start_time,stop_time,special_ad_categories,created_time,updated_time"
        })
      );

    case "meta_campaign_insights":
      return textContent(
        await graphGet(`${String(args.campaign_id)}/insights`, {
          fields: "campaign_id,campaign_name,impressions,reach,frequency,clicks,inline_link_clicks,ctr,cpc,cpm,spend,actions,cost_per_action_type,action_values",
          date_preset: String(args?.date_preset || "last_7d")
        })
      );

    case "meta_list_adsets": {
      const parent = args?.campaign_id ? String(args.campaign_id) : normalizeActId(String(args.ad_account_id));
      return textContent(
        await graphGet(`${parent}/adsets`, {
          fields: "id,name,status,effective_status,campaign_id,daily_budget,lifetime_budget,bid_amount,bid_strategy,billing_event,optimization_goal,targeting,promoted_object,destination_type,start_time,end_time,created_time,updated_time",
          limit: clampLimit(args?.limit)
        })
      );
    }

    case "meta_get_adset":
      return textContent(
        await graphGet(String(args.adset_id), {
          fields: "id,name,status,effective_status,campaign_id,daily_budget,lifetime_budget,bid_amount,bid_strategy,billing_event,optimization_goal,targeting,promoted_object,destination_type,start_time,end_time,attribution_spec,created_time,updated_time"
        })
      );

    case "meta_adset_insights":
      return textContent(
        await graphGet(`${String(args.adset_id)}/insights`, {
          fields: "adset_id,adset_name,impressions,reach,frequency,clicks,inline_link_clicks,ctr,cpc,cpm,spend,actions,cost_per_action_type,action_values",
          date_preset: String(args?.date_preset || "last_7d")
        })
      );

    case "meta_list_ads": {
      const parent = args?.adset_id
        ? String(args.adset_id)
        : args?.campaign_id
          ? String(args.campaign_id)
          : normalizeActId(String(args.ad_account_id));
      return textContent(
        await graphGet(`${parent}/ads`, {
          fields: "id,name,status,effective_status,adset_id,campaign_id,creative{id,name,title,body,object_story_spec,asset_feed_spec,effective_object_story_id},tracking_specs,conversion_specs,created_time,updated_time",
          limit: clampLimit(args?.limit)
        })
      );
    }

    case "meta_get_ad":
      return textContent(
        await graphGet(String(args.ad_id), {
          fields: "id,name,status,effective_status,adset_id,campaign_id,creative{id,name,title,body,object_story_spec,asset_feed_spec,effective_object_story_id},tracking_specs,conversion_specs,created_time,updated_time"
        })
      );

    case "meta_ad_insights":
      return textContent(
        await graphGet(`${String(args.ad_id)}/insights`, {
          fields: "ad_id,ad_name,impressions,reach,frequency,clicks,inline_link_clicks,ctr,cpc,cpm,spend,actions,cost_per_action_type,action_values,quality_ranking,engagement_rate_ranking,conversion_rate_ranking",
          date_preset: String(args?.date_preset || "last_7d")
        })
      );

    case "meta_update_campaign": {
      requireApproved(args);
      const changes = pickChanges(args.changes, ["name", "status", "daily_budget", "lifetime_budget", "bid_strategy"]);
      return textContent(await graphPost(String(args.campaign_id), changes));
    }

    case "meta_update_adset": {
      requireApproved(args);
      const changes = pickChanges(args.changes, [
        "name", "status", "daily_budget", "lifetime_budget", "bid_amount", "bid_strategy",
        "billing_event", "optimization_goal", "targeting", "destination_type",
        "start_time", "end_time", "attribution_spec"
      ]);
      return textContent(await graphPost(String(args.adset_id), changes));
    }

    case "meta_update_ad": {
      requireApproved(args);
      const changes = pickChanges(args.changes, ["name", "status", "tracking_specs", "conversion_specs"]);
      return textContent(await graphPost(String(args.ad_id), changes));
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleRpc(request: RpcRequest) {
  const id = request.id ?? null;
  const method = request.method ?? "";

  if (method === "initialize") {
    const requested = request.params?.protocolVersion;
    const protocolVersion =
      requested === "2025-03-26" || requested === "2025-06-18" ? requested : MCP_PROTOCOL;
    return jsonRpc(id, {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: SERVER_NAME, version: SERVER_VERSION }
    });
  }

  if (method === "ping") return jsonRpc(id, {});
  if (method === "tools/list") return jsonRpc(id, { tools: tools as any });
  if (method === "notifications/initialized" || method.startsWith("notifications/")) {
    return new NextResponse(null, { status: 202 });
  }

  if (method === "tools/call") {
    const name = String(request.params?.name ?? "");
    const args = request.params?.arguments ?? {};
    try {
      const result = await callTool(name, args);
      return jsonRpc(id, result as any);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tool execution failed";
      return jsonRpc(id, {
        content: [{ type: "text", text: message }],
        isError: true
      } as any);
    }
  }

  return jsonRpcError(id, -32601, "Method not found");
}

export async function POST(req: NextRequest) {
  if (!validBridgeKey(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: RpcRequest;
  try {
    payload = await req.json();
  } catch {
    return jsonRpcError(null, -32700, "Parse error", undefined, 400);
  }

  if (Array.isArray(payload)) {
    return jsonRpcError(null, -32600, "Batch requests are not supported", undefined, 400);
  }

  return handleRpc(payload);
}

export async function GET(req: NextRequest) {
  if (!validBridgeKey(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    server: SERVER_NAME,
    version: SERVER_VERSION,
    transport: "streamable-http",
    meta_token_configured: Boolean(metaToken())
  });
}

export async function DELETE(req: NextRequest) {
  if (!validBridgeKey(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return new NextResponse(null, { status: 204 });
}
