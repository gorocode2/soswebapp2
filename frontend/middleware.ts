import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🦈 School of Sharks Authentication Middleware
 * Protect apex cycling routes from unauthorized access
 */
export function middleware(request: NextRequest) {
  // Get user session from cookie
  const userSession = request.cookies.get('user_session')?.value;

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/training',
    '/profile',
    '/analytics',
    '/premium'
  ];

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing protected route without session, redirect to auth
  if (isProtectedPath && !userSession) {
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(authUrl);
  }

  // If logged in user tries to access auth page, redirect to dashboard
  if (userSession && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
