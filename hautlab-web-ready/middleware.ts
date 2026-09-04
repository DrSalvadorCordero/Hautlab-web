import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/auth-config";
import { geoHeaders } from "@/lib/geo-personalization";

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

export default function middleware(request: NextRequest, event: NextFetchEvent) {
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
  matcher: ["/", "/en", "/en/:path*", "/admin/:path*", "/api/:path*", "/__clerk/:path*"]
};
