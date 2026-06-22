// middleware.ts
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config"; // 🛡️ Must point to the light config!

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/";
  const isProtectedPage = pathname.startsWith("/dashboard") || pathname.startsWith("/diary");

  // Case A: Not logged in and trying to view diaries -> Kick them to landing page
  if (!isLoggedIn && isProtectedPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Case B: Logged in and trying to view the login screen -> Send them to the dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // ✅ SAFELY CONTINUE: If they are NOT logged in and are on an Auth page (like "/"),
  // let them pass through instead of firing another redirect!
  return NextResponse.next();
});

export const config = {
  // Matches base pages, dashboard sub-directories, and diary sub-directories
  matcher: ["/", "/dashboard/:path*", "/diary/:path*"],
};