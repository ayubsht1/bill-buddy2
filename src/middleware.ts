import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const hasRefreshError = token?.error === "RefreshAccessTokenError";
  const isAuthenticated = !!token && !hasRefreshError;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  if ((!isAuthenticated || hasRefreshError) && !isAuthPage) {
    const signInUrl = new URL("/auth/login", req.url);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    
    const response = NextResponse.redirect(signInUrl);
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    return response;
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};