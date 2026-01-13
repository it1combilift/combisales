import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updateCurrentUserSchema } from "@/schemas/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateCurrentUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, image, currentPassword, newPassword } = validation.data;

    if (newPassword && currentPassword) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { password: true },
      });

      if (!user?.password) {
        return NextResponse.json(
          { error: "Usuario no tiene contraseña configurada" },
          { status: 400 }
        );
      }

      const { compare } = await import("bcryptjs");
      const isValid = await compare(currentPassword, user.password);

      if (!isValid) {
        return NextResponse.json(
          { error: "Contraseña actual incorrecta" },
          { status: 401 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (image !== undefined) updateData.image = image;
    if (newPassword) {
      updateData.password = await hash(newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      {
        error: "Error al actualizar el usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
