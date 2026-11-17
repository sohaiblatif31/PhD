import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, sessionSecret, verifyToken } from '@/lib/server/token';

// First gate only: every layout, route handler and server action also calls requireUser().
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/login' || pathname === '/api/calendar') return NextResponse.next();
  const secret = sessionSecret();
  if (secret && verifyToken(request.cookies.get(SESSION_COOKIE)?.value, secret)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const url = new URL('/login', request.url);
  if (pathname !== '/') url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.png|icon-192.png|icon-512.png|manifest.webmanifest).*)'],
};
