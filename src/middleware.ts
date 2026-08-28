import { NextRequest, NextResponse } from "next/server";

// Slugs served as fully static HTML (bypassing the /lp/[slug] Blob-driven
// template) — the file tree lives under public/lp-static/<slug>/.
// Add a slug here to serve another hand-built static marketing page the
// same way, no other code changes needed.
const STATIC_LP_SLUGS = new Set(["location-bureaux-operes-full-services-paris"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/lp\/([^/]+)(\/.*)?$/);
  if (!match || !STATIC_LP_SLUGS.has(match[1])) return NextResponse.next();

  const rest = match[2] && match[2] !== "/" ? match[2] : "/index.html";
  const url = request.nextUrl.clone();
  url.pathname = `/lp-static/${match[1]}${rest}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/lp/:path*",
};
