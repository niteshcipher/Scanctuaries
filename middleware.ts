// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Grab the secure HttpOnly session token from incoming cookies
  const token = request.cookies.get("token")?.value;
  
  const { pathname } = request.nextUrl;

  // 2. Define your security perimeters
  const isAuthPage = pathname === "/";
  const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/diary");

  // Case A: User is trying to access dashboard/diary without a token -> Boot them to login
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Case B: User is already logged in but tries to go back to the login page -> Fast-forward to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow all other requests (API routes, static assets, etc.) to pass through safely
  return NextResponse.next();
}

// 🎯 Optimization: Only run this middleware on front-end pages (ignores image assets, scripts, etc.)
export const config = {
  matcher: ["/", "/dashboard/:path*", "/diary/:path*"],
};