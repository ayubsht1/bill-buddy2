import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

async function backendSessionIsValid(token: { accessToken?: unknown; refreshToken?: unknown }) {
  const configuredUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";
  const apiRoot = `${configuredUrl.replace(/\/+$/, "").replace(/\/api$/i, "")}/api`;
  const accessToken = typeof token.accessToken === "string" ? token.accessToken : "";
  const refreshToken = typeof token.refreshToken === "string" ? token.refreshToken : "";

  try {
    if (accessToken) {
      const verification = await fetch(`${apiRoot}/token/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: accessToken }),
        cache: "no-store",
      });
      if (verification.ok) {
        const result = await verification.json();
        if (result.success && result.data?.is_valid === true) return true;
      }
    }

    if (!refreshToken) return false;
    const refresh = await fetch(`${apiRoot}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
      cache: "no-store",
    });
    if (!refresh.ok) return false;
    const result = await refresh.json();
    return result.success === true && typeof result.data?.access === "string";
  } catch (error) {
    console.error("Could not validate the active account with the backend.", error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const hasRefreshError = token?.error === "RefreshAccessTokenError";
  const hasSessionToken = !!token && !hasRefreshError;
  const isAuthenticated = hasSessionToken && await backendSessionIsValid(token);
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
    "/expenses/:path*",
    "/groups/:path*",
    "/friends/:path*",
    "/messages/:path*",
    "/analytics/:path*",
    "/settlements/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};