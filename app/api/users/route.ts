import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/users?role=INSPECTOR or ?roles=INSPECTOR,SELLER
 * Returns users filtered by role(s).
 * Admin only.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { roles: true },
    });

    if (!currentUser || !hasRole(currentUser.roles, Role.ADMIN)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role") as Role | null;
    const rolesFilter = searchParams.get("roles"); // comma-separated: "INSPECTOR,SELLER"

    const where: any = {};

    if (rolesFilter) {
      // Support multiple roles filter: ?roles=INSPECTOR,SELLER
      const roleList = rolesFilter
        .split(",")
        .filter((r) => Object.values(Role).includes(r as Role)) as Role[];
      if (roleList.length > 0) {
        where.OR = roleList.map((r) => ({ roles: { has: r } }));
      }
    } else if (roleFilter && Object.values(Role).includes(roleFilter)) {
      where.roles = { has: roleFilter };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        roles: true,
        isActive: true,
        createdAt: true,
        assignedVehicles: {
          select: {
            id: true,
            model: true,
            plate: true,
            status: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            inspections: true,
            assignedVehicles: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
