import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/firebase-admin';
import { UserRole } from './lib/types';


// This function decodes the token and gets the user's role from custom claims or firestore
// NOTE: This is a simplified version. A real-world app would have more robust error handling
async function getUserRoleFromToken(request: NextRequest): Promise<UserRole | null> {
  const token = request.cookies.get('firebase-auth-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Check custom claims first
    if (decodedToken.role) {
      return decodedToken.role as UserRole;
    }

    // Fallback to checking Firestore
    const roles: UserRole[] = [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist, UserRole.Pharmacist];
    for (const role of roles) {
        const doc = await auth.firestore().collection(`${role.toLowerCase()}s`).doc(uid).get();
        if (doc.exists) {
            return role;
        }
    }
    return null;

  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}


export async function middleware(request: NextRequest) {
  const userRole = await getUserRoleFromToken(request);
  const { pathname } = request.nextUrl;
  
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isPublicRoute = pathname === '/';

  if (isPublicRoute) {
      return NextResponse.next();
  }

  // If user is logged in and tries to access login/signup, redirect them to their dashboard
  if (userRole && isAuthRoute) {
    let dashboardPath = `/${userRole.toLowerCase()}/dashboard`;
     if (userRole === UserRole.Doctor) {
        const token = request.cookies.get('firebase-auth-token')?.value;
        const decodedToken = await auth.verifyIdToken(token!);
        dashboardPath += `?doctorId=${decodedToken.uid}`;
     }
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!userRole && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is logged in, check if they are authorized to access the route
  if (userRole && !isAuthRoute) {
    const allowedPath = `/${userRole.toLowerCase()}`;
    if (!pathname.startsWith(allowedPath)) {
       let dashboardPath = `/${userRole.toLowerCase()}/dashboard`;
       if (userRole === UserRole.Doctor) {
          const token = request.cookies.get('firebase-auth-token')?.value;
          const decodedToken = await auth.verifyIdToken(token!);
          dashboardPath += `?doctorId=${decodedToken.uid}`;
       }
       // If they are trying to access a path they don't have a role for, redirect to their own dashboard
       return NextResponse.redirect(new URL(dashboardPath, request.url));
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
