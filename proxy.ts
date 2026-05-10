import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'containo-super-secret-key-change-this-in-production'
);

const PROTECTED_ROUTES = [
  '/dashboard',
  '/maintenance',
  '/backups',
  '/settings',
  '/deploy',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if it's a protected route
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/';

  if (isProtected) {
    const session = request.cookies.get('containo_session')?.value;

    if (!session) {
      // No session, check if setup is needed via an internal header or just redirect to login
      // We can't check DB here, so we redirect to login. Login/Setup will handle the rest.
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(session, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Prevent accessing login/setup if already logged in
  if (pathname === '/login' || pathname === '/setup') {
    const session = request.cookies.get('containo_session')?.value;
    if (session) {
      try {
        await jwtVerify(session, JWT_SECRET);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (err) {
        // Invalid session, allow login/setup
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo/ (public logos)
     * - asset/ (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo|asset).*)',
  ],
};
