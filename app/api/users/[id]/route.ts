import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UpdateUserInput } from "@/interfaces/user";
import { updateUserSchema, deleteUserSchema } from "@/schemas/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasRole } from "@/lib/roles";

// Get user by ID (Admin only)
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { roles: true },
    });

    if (!currentUser || !hasRole(currentUser.roles, Role.ADMIN)) {
      return NextResponse.json(
        { error: "No tienes permisos para ver usuarios" },
        { status: 403 },
      );
    }

    const params = await context.params;
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        image: true,
        country: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        assignedSellers: {
          select: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      {
        error: "Error al obtener el usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// Update user by ID (Admin only)
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { roles: true },
    });

    if (!currentUser || !hasRole(currentUser.roles, Role.ADMIN)) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar usuarios" },
        { status: 403 },
      );
    }

    const params = await context.params;
    const body = await request.json();
    const validation = updateUserSchema.safeParse({
      ...body,
      id: params.id,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      id,
      name,
      email,
      roles,
      country,
      isActive,
      password,
      image,
      assignedSellerId,
    } = validation.data;

    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    if (email && email !== userToUpdate.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "El email ya está en uso" },
          { status: 409 },
        );
      }
    }

    // Determinar si el usuario tiene/tendrá rol DEALER
    const hadDealer = userToUpdate.roles.includes(Role.DEALER);
    const hasDealer = roles?.includes(Role.DEALER) ?? hadDealer;

    // Si tiene rol DEALER y se proporciona seller, validar
    if ((hasDealer || hadDealer) && assignedSellerId !== undefined) {
      if (assignedSellerId) {
        const seller = await prisma.user.findUnique({
          where: {
            id: assignedSellerId,
            roles: { has: Role.SELLER },
          },
        });

        if (!seller) {
          return NextResponse.json(
            { error: "El P. Manager seleccionado no es válido" },
            { status: 400 },
          );
        }
      }

      // Actualizar relación DEALER-SELLER (un solo seller)
      await prisma.dealerSeller.deleteMany({
        where: { dealerId: id },
      });

      if (assignedSellerId) {
        await prisma.dealerSeller.create({
          data: {
            dealerId: id,
            sellerId: assignedSellerId,
          },
        });
      }
    }

    // Si ya no tiene rol DEALER, eliminar todas las relaciones
    if (roles && !roles.includes(Role.DEALER) && hadDealer) {
      await prisma.dealerSeller.deleteMany({
        where: { dealerId: id },
      });
    }

    const updateData: UpdateUserInput = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (roles !== undefined) updateData.roles = roles;
    if (country !== undefined) updateData.country = country;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (image !== undefined) updateData.image = image;
    if (password) {
      updateData.password = await hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        image: true,
        country: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        assignedSellers: {
          select: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
      { status: 500 },
    );
  }
}

// Delete user by ID (Admin only)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { roles: true, id: true },
    });

    if (!currentUser || !hasRole(currentUser.roles, Role.ADMIN)) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar usuarios" },
        { status: 403 },
      );
    }

    const params = await context.params;
    const validation = deleteUserSchema.safeParse({ id: params.id });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "ID de usuario inválido",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { id } = validation.data;

    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo" },
        { status: 400 },
      );
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Usuario eliminado exitosamente",
      user: {
        id: userToDelete.id,
        email: userToDelete.email,
        name: userToDelete.name,
      },
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar el usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
