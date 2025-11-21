import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const protectedPaths = ["/dashboard", "/(protected)"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path.replace("/(protected)", ""))
  );

  if (isProtectedPath) {
    const token =
      request.cookies.get("next-auth.session-token") ||
      request.cookies.get("__Secure-next-auth.session-token");

    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/(protected)/:path*"],
};
