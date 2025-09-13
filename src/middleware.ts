import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// A full auth middleware is not feasible in this environment because it requires
// the Firebase Admin SDK and a service account, which causes the app to crash.
// We will rely on client-side auth checks and Firestore security rules.
// This basic middleware just passes all requests through.

export function middleware(request: NextRequest) {
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
