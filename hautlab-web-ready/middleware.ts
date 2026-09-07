import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/auth-config";
import { geoHeaders } from "@/lib/geo-personalization";

const rootHost = "hautlabmx.com";
const wwwHost = "www.hautlabmx.com";
const isProtectedRoute = createRouteMatcher(["/admin((?!/iniciar-sesion).*)"]);
const isClerkRoute = createRouteMatcher(["/admin/:path*", "/__clerk/:path*"]);

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
    frontendApiProxy: {
      enabled: true
    }
  }
);

function requestHost(request: NextRequest) {
  return (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();
}

function redirectRootToWww(request: NextRequest) {
  if (requestHost(request) !== rootHost) return null;
  if (request.nextUrl.pathname.startsWith("/__clerk")) return null;

  const target = request.nextUrl.clone();
  target.protocol = "https:";
  target.hostname = wwwHost;
  target.port = "";
  return NextResponse.redirect(target, 308);
}

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Keep the patient-facing site canonical on www, but never redirect Clerk's
  // root-domain proxy path because Clerk requires the proxy to share its domain.
  const canonicalRedirect = redirectRootToWww(request);
  if (canonicalRedirect) return canonicalRedirect;

  // Public pages must never depend on Clerk. A bad Clerk configuration must
  // not be able to take down the patient-facing website.
  if (!isClerkRoute(request)) {
    return publicResponse(request);
  }

  if (!isClerkConfigured()) {
    return publicResponse(request);
  }

  return configuredMiddleware(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};
