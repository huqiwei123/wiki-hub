import { NextResponse, type NextRequest } from "next/server";
import { getSessionUserFromToken, sessionCookieName } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const user = await getSessionUserFromToken(request.cookies.get(sessionCookieName)?.value);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/bookmarks") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/bookmarks/:path*", "/login", "/signup"],
};
