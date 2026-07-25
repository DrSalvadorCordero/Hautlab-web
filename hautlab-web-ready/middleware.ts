import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/auth-config";
import { geoHeaders } from "@/lib/geo-personalization";

const isProtectedRoute = createRouteMatcher(["/admin((?!/iniciar-sesion).*)"]);

const configuredMiddleware = clerkMiddleware(
  async (auth, request) => {
    if (isProtectedRoute(request)) {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.redirect(new URL("/admin/iniciar-sesion", request.url));
      }
    }

    return NextResponse.next({
      request: {
        headers: geoHeaders(request.headers, request.nextUrl.pathname)
      }
    });
  },
  {
    frontendApiProxy: {
      enabled: true
    }
  }
);

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured()) {
    return NextResponse.next({
      request: {
        headers: geoHeaders(request.headers, request.nextUrl.pathname)
      }
    });
  }

  return configuredMiddleware(request, event);
}

export const config = {
  matcher: ["/", "/en", "/en/:path*", "/admin/:path*", "/api/:path*", "/__clerk/:path*"]
};
