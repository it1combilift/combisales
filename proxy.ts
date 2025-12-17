import { Role } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const protectedPaths = ["/dashboard/clients", "/dashboard/users"];
  const adminOnlyPaths = ["/dashboard/users"];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("=== MIDDLEWARE CHECK ===");
    console.log("Path:", request.nextUrl.pathname);
    console.log("Token exists:", !!token);
    console.log("Token isActive:", token?.isActive);
    console.log("Token role:", token?.role);

    if (!token) {
      const loginUrl = new URL("/", request.url);
      console.log("Redirecting to login: no token");
      return NextResponse.redirect(loginUrl);
    }

    if (token.isActive === false) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("error", "AccountBlocked");
      console.log("Redirecting to login: account blocked");
      return NextResponse.redirect(loginUrl);
    }

    const isAdminOnlyPath = adminOnlyPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (isAdminOnlyPath && token.role !== Role.ADMIN) {
      console.log("Access denied: ADMIN role required");
      const forbiddenUrl = new URL("/dashboard/clients", request.url);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
