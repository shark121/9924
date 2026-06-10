import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Next 16 renamed `middleware` to `proxy` (runs on the Node.js runtime, which is
// why we can use node:crypto inside lib/auth). This is an optimistic gate — it
// keeps unauthenticated users out of /admin and bounces them to the login page.
// Routes/actions re-verify the session via lib/admin-session for defense in depth.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard the admin area; the login page must stay reachable.
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (verifySessionToken(token)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
