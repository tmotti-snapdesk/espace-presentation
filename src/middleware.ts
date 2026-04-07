import { NextRequest, NextResponse } from "next/server";

// Pre-computed SHA-256 of "admin:Snapdesk2026:snapdesk-session"
const SESSION_TOKEN = "snapdesk_auth_2026";

function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get("snapdesk_session");
  return cookie?.value === SESSION_TOKEN;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — never block
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/auth") return NextResponse.next();
  if (pathname === "/api/leads") return NextResponse.next();

  // Protected: /admin pages
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated(request)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Protected: sensitive API routes
  if (
    pathname.startsWith("/api/espaces") ||
    pathname.startsWith("/api/generate") ||
    pathname.startsWith("/api/upload")
  ) {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/espaces/:path*", "/api/generate", "/api/upload"],
};
