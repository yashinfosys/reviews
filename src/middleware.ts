import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const user = decodeMiddlewareToken(request.cookies.get("reviewboost_token")?.value);
  const path = request.nextUrl.pathname;
  if ((path.startsWith("/admin") || path.startsWith("/super-admin")) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (path.startsWith("/super-admin") && user?.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*"]
};

function decodeMiddlewareToken(token?: string) {
  if (!token) return null;
  const [, payload] = token.split(".");
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json) as { role?: string; exp?: number };
  } catch {
    return null;
  }
}
