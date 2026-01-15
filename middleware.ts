import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Lightweight auth gate:
// - Protects dashboard routes by requiring the Supabase access token cookie.
// - Redirects signed-in users away from /login.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sb-access-token")?.value;

  // Allow API and static assets through without checks.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access the dashboard.
  if (pathname.startsWith("/dashboard") && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from the login page.
  if (pathname === "/login" && token) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
