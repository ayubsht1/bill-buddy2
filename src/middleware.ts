import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  // 1. If trying to access auth pages while already logged in -> Send to Dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. If trying to access protected pages while logged out -> Send to Login
  if (!isAuthenticated && !isAuthPage) {
    const signInUrl = new URL("/auth/login", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/auth/:path*", // Include auth routes to restrict logged-in users from re-login
  ],
};
