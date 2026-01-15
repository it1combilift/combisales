import { Role } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const protectedPaths = [
    "/dashboard/clients",
    "/dashboard/users",
    "/dashboard/equipment",
    "/dashboard/tasks",
    "/dashboard/dealers",
  ];

  // Role-based path restrictions
  const adminOnlyPaths = ["/dashboard/users"];

  const sellerPaths = [
    "/dashboard/tasks",
    "/dashboard/clients",
    "/dashboard/equipment",
  ];

  const dealerOnlyPaths = ["/dashboard/dealers"];

  const currentPath = request.nextUrl.pathname;

  // ==================== REDIRECT AUTHENTICATED USERS FROM LOGIN ====================
  // If user is on the login page (/) and is authenticated, redirect to appropriate dashboard
  if (currentPath === "/") {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Only redirect if user has a valid, active token
    if (token && token.isActive !== false) {
      const userRole = token.role as Role;

      console.log("=== LOGIN PAGE REDIRECT ===");
      console.log("User is authenticated, role:", userRole);

      // Redirect based on role
      if (userRole === Role.DEALER) {
        return NextResponse.redirect(
          new URL("/dashboard/dealers", request.url)
        );
      }

      // ADMIN and SELLER go to /dashboard/tasks
      return NextResponse.redirect(new URL("/dashboard/tasks", request.url));
    }

    // User not authenticated, show login page
    return NextResponse.next();
  }

  // ==================== PROTECTED PATHS LOGIC ====================
  const isProtectedPath = protectedPaths.some((path) =>
    currentPath.startsWith(path)
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

    const userRole = token.role as Role;

    // ADMIN can access everything
    if (userRole === Role.ADMIN) {
      return NextResponse.next();
    }

    // DEALER can only access /dashboard/dealers
    if (userRole === Role.DEALER) {
      const isDealerPath = dealerOnlyPaths.some((path) =>
        currentPath.startsWith(path)
      );
      if (!isDealerPath) {
        console.log("Access denied: DEALER can only access /dashboard/dealers");
        return NextResponse.redirect(
          new URL("/dashboard/dealers", request.url)
        );
      }
      return NextResponse.next();
    }

    // SELLER can access tasks, clients, equipment
    if (userRole === Role.SELLER) {
      const isAdminOnlyPath = adminOnlyPaths.some((path) =>
        currentPath.startsWith(path)
      );
      const isDealerOnlyPath = dealerOnlyPaths.some((path) =>
        currentPath.startsWith(path)
      );

      if (isAdminOnlyPath) {
        console.log("Access denied: ADMIN role required");
        return NextResponse.redirect(new URL("/dashboard/tasks", request.url));
      }

      if (isDealerOnlyPath) {
        console.log("Access denied: DEALER role required for this path");
        return NextResponse.redirect(new URL("/dashboard/tasks", request.url));
      }

      return NextResponse.next();
    }

    // Unknown role - deny access
    console.log("Access denied: Unknown role");
    return NextResponse.redirect(new URL("/", request.url));
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
