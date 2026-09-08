import { NextResponse } from "next/server";
import { resolve4, resolve6, resolveCname } from "node:dns/promises";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const targets = [
  "https://clerk.hautlabmx.com/v1/environment",
  "https://clerk.hautlabmx.com/npm/@clerk/clerk-js@6/dist/clerk.browser.js",
  "https://accounts.hautlabmx.com/sign-in?redirect_url=https%3A%2F%2Fwww.hautlabmx.com%2Fadmin%2Fwhatsapp"
];

async function dns(hostname: string) {
  const settled = await Promise.allSettled([
    resolveCname(hostname),
    resolve4(hostname),
    resolve6(hostname)
  ]);

  return {
    cname: settled[0].status === "fulfilled" ? settled[0].value : String(settled[0].reason),
    a: settled[1].status === "fulfilled" ? settled[1].value : String(settled[1].reason),
    aaaa: settled[2].status === "fulfilled" ? settled[2].value : String(settled[2].reason)
  };
}

async function probe(url: string) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: {
        "user-agent": "HAUTLAB-Clerk-Diagnostic/1.0",
        accept: "text/html,application/json,*/*"
      }
    });

    const text = await response.text();
    return {
      url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      location: response.headers.get("location"),
      contentType: response.headers.get("content-type"),
      server: response.headers.get("server"),
      cfRay: response.headers.get("cf-ray"),
      bodyPrefix: text.slice(0, 500)
    };
  } catch (error) {
    const err = error as Error & { cause?: unknown };
    return {
      url,
      ok: false,
      error: `${err.name}: ${err.message}`,
      cause: err.cause ? String(err.cause) : null
    };
  }
}

export async function GET() {
  const [clerkDns, accountsDns, ...probes] = await Promise.all([
    dns("clerk.hautlabmx.com"),
    dns("accounts.hautlabmx.com"),
    ...targets.map(probe)
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    dns: {
      "clerk.hautlabmx.com": clerkDns,
      "accounts.hautlabmx.com": accountsDns
    },
    probes
  }, {
    headers: {
      "cache-control": "no-store",
      "x-robots-tag": "noindex"
    }
  });
}
