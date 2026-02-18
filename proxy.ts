import { Role } from "@prisma/client";
import { hasRole } from "@/lib/roles";
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
    "/dashboard/inspections",
  ];

  // Role-based path restrictions
  const adminOnlyPaths = ["/dashboard/users"];

  // Paths accessible by both DEALER and SELLER
  const dealerAndSellerPaths = ["/dashboard/dealers"];

  // Paths accessible by INSPECTOR
  const inspectorPaths = ["/dashboard/inspections"];

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
      const userRoles = token.roles as Role[] | undefined;

      // Redirect based on role - DEALER-only users go to dealers
      if (
        hasRole(userRoles, Role.DEALER) &&
        !hasRole(userRoles, Role.SELLER) &&
        !hasRole(userRoles, Role.ADMIN)
      ) {
        return NextResponse.redirect(
          new URL("/dashboard/dealers", request.url),
        );
      }

      // INSPECTOR-only users go to inspections
      if (
        hasRole(userRoles, Role.INSPECTOR) &&
        !hasRole(userRoles, Role.SELLER) &&
        !hasRole(userRoles, Role.ADMIN)
      ) {
        return NextResponse.redirect(
          new URL("/dashboard/inspections", request.url),
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
    currentPath.startsWith(path),
  );

  if (isProtectedPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (token.isActive === false) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("error", "AccountBlocked");
      return NextResponse.redirect(loginUrl);
    }

    const userRoles = token.roles as Role[] | undefined;

    // ADMIN can access everything
    if (hasRole(userRoles, Role.ADMIN)) {
      return NextResponse.next();
    }

    // DEALER can only access /dashboard/dealers (unless also SELLER)
    if (hasRole(userRoles, Role.DEALER) && !hasRole(userRoles, Role.SELLER)) {
      const isDealerPath = dealerAndSellerPaths.some((path) =>
        currentPath.startsWith(path),
      );
      if (!isDealerPath) {
        return NextResponse.redirect(
          new URL("/dashboard/dealers", request.url),
        );
      }
      return NextResponse.next();
    }

    // INSPECTOR can only access tasks and inspections (unless also SELLER/ADMIN)
    if (
      hasRole(userRoles, Role.INSPECTOR) &&
      !hasRole(userRoles, Role.SELLER) &&
      !hasRole(userRoles, Role.ADMIN)
    ) {
      const isInspectorPath = inspectorPaths.some((path) =>
        currentPath.startsWith(path),
      );
      if (!isInspectorPath) {
        return NextResponse.redirect(
          new URL("/dashboard/inspections", request.url),
        );
      }
      return NextResponse.next();
    }

    // SELLER can access tasks, clients, equipment, and dealers (for assigned visits)
    if (hasRole(userRoles, Role.SELLER)) {
      const isAdminOnlyPath = adminOnlyPaths.some((path) =>
        currentPath.startsWith(path),
      );

      if (isAdminOnlyPath) {
        return NextResponse.redirect(new URL("/dashboard/tasks", request.url));
      }

      // SELLER can access dealers path (for viewing assigned visits)
      return NextResponse.next();
    }

    // Unknown role - deny access
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
