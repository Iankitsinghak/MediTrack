import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a simulated user context.
// In a real app, you'd get this from your auth provider (e.g., Firebase Auth, Supabase, etc.)
const getUserRole = (request: NextRequest): string | null => {
  // For demonstration, we'll check the path for the role.
  // A real implementation would involve session cookies or auth tokens.
  const path = request.nextUrl.pathname;
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/doctor')) return 'doctor';
  if (path.startsWith('/receptionist')) return 'receptionist';
  if (path.startsWith('/pharmacist')) return 'pharmacist';
  return null; // Or a default/guest role
};

export function middleware(request: NextRequest) {
  const userRole = getUserRole(request);
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (['/', '/login', '/signup'].includes(pathname)) {
    return NextResponse.next();
  }

  // If there's a user role, verify they are accessing their own dashboard
  if (userRole) {
    const isAllowed = pathname.startsWith(`/${userRole}`);
    if (!isAllowed) {
      // If not allowed, redirect to their correct dashboard
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
    }
  }

  // If no role and not a public route, redirect to login
  if (!userRole && !['/', '/login', '/signup'].some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
