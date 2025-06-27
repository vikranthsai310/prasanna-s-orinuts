// middleware.js - Route protection
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/orders', '/profile', '/checkout'];
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for auth token in cookies
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      // Redirect to auth page with return URL
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/profile/:path*', '/checkout/:path*']
};