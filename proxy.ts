import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/auth/utils";
import fs from "fs";
import path from "path";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/maintenance",
  "/backups",
  "/settings",
  "/deploy",
];

let isSetupDoneCached = false;

// Global middleware — runs on every request (see matcher config below).
// Flow: setup check → protected route guard → API auth guard → login redirect.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === Setup Gate ===
  // Redirect everything to /setup until the admin creates the first user.
  if (!isSetupDoneCached) {
    const flagPath = path.join(process.cwd(), "data", ".setup_done");
    isSetupDoneCached = fs.existsSync(flagPath);
  }
  const isSetupDone = isSetupDoneCached;

  if (
    !isSetupDone &&
    pathname !== "/setup" &&
    !pathname.startsWith("/api/auth/setup")
  ) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  // Block /setup if already configured
  if (isSetupDone && pathname === "/setup") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // === Page Route Guard ===
  // Protected pages require a valid JWT session cookie.
  const isProtected =
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname === "/";

  if (isProtected) {
    const session = request.cookies.get("containo_session")?.value;

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const sessionPayload = await verifySession(session);
    if (sessionPayload) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // === API Route Guard ===
  // All /api/* routes (except auth) require JWT. Returns 401, not a redirect.
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const session = request.cookies.get("containo_session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionPayload = await verifySession(session);
    if (!sessionPayload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // === Login Redirect ===
  // Already-logged-in users visiting /login or /setup go straight to dashboard.
  if (pathname === "/login" || pathname === "/setup") {
    const session = request.cookies.get("containo_session")?.value;
    if (session) {
      const sessionPayload = await verifySession(session);
      if (sessionPayload) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - logo/ (public logos)
     * - asset/ (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo|asset).*)",
  ],
};
