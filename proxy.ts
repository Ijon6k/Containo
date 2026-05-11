import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth-utils';


const PROTECTED_ROUTES = [
  '/dashboard',
  '/maintenance',
  '/backups',
  '/settings',
  '/deploy',
];

import fs from 'fs';
import path from 'path';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Check if setup is completed
  const flagPath = path.join(process.cwd(), 'data', '.setup_done');
  const isSetupDone = fs.existsSync(flagPath);

  if (!isSetupDone && pathname !== '/setup' && !pathname.startsWith('/api/auth/setup')) {
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  // If setup is already done, don't allow access to /setup
  if (isSetupDone && pathname === '/setup') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 1. Check if it's a protected route
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/';

  if (isProtected) {
    const session = request.cookies.get('containo_session')?.value;

    if (!session) {
      // No session, check if setup is needed via an internal header or just redirect to login
      // We can't check DB here, so we redirect to login. Login/Setup will handle the rest.
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const sessionPayload = await verifySession(session);
    if (sessionPayload) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Prevent accessing login/setup if already logged in
  if (pathname === '/login' || pathname === '/setup') {
    const session = request.cookies.get('containo_session')?.value;
    if (session) {
      const sessionPayload = await verifySession(session);
      if (sessionPayload) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
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
