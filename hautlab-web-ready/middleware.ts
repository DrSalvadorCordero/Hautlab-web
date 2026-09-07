import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/auth-config";
import { geoHeaders } from "@/lib/geo-personalization";

const isProtectedRoute = createRouteMatcher(["/admin((?!/iniciar-sesion).*)"]);
const isClerkRoute = createRouteMatcher(["/admin/:path*", "/__clerk/:path*"]);
const clerkProxyUrl = "https://hautlabmx.com/__clerk";

const publicResponse = (request: NextRequest) =>
  NextResponse.next({
    request: {
      headers: geoHeaders(request.headers, request.nextUrl.pathname)
    }
  });

const configuredMiddleware = clerkMiddleware(
  async (auth, request) => {
    if (isProtectedRoute(request)) {
      const { userId } = await auth();

      if (!userId) {
        const signInUrl = new URL("/admin/iniciar-sesion", request.url);
        const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
        signInUrl.searchParams.set("redirect_url", returnTo);
        return NextResponse.redirect(signInUrl);
      }
    }

    return publicResponse(request);
  },
  {
    proxyUrl: clerkProxyUrl,
    frontendApiProxy: {
      enabled: true
    }
  }
);

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Public pages must never depend on Clerk. A bad Clerk configuration must
  // not be able to take down the patient-facing website.
  if (!isClerkRoute(request)) {
    return publicResponse(request);
  }

  if (!isClerkConfigured()) {
    return publicResponse(request);
  }

  // Clerk is configured for the root domain hautlabmx.com, while the public
  // site is served on www.hautlabmx.com. Preserve NextRequest semantics
  // (including nextUrl) while forwarding the canonical host/protocol Clerk
  // expects for its proxy.
  const clerkHeaders = new Headers(request.headers);
  clerkHeaders.set("x-forwarded-host", "hautlabmx.com");
  clerkHeaders.set("x-forwarded-proto", "https");
  const clerkRequest = new NextRequest(request, { headers: clerkHeaders });

  return configuredMiddleware(clerkRequest, event);
}

export const config = {
  matcher: ["/", "/en", "/en/:path*", "/admin/:path*", "/api/:path*", "/__clerk/:path*"]
};
