import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { deleteMultipleUsersSchema } from "@/schemas/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Delete multiple users (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true },
    });

    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = deleteMultipleUsersSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { ids } = validation.data;

    if (ids.includes(currentUser.id)) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo" },
        { status: 400 }
      );
    }

    const result = await prisma.user.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      message: `${result.count} usuario(s) eliminado(s) exitosamente`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error al eliminar usuarios:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar los usuarios",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
