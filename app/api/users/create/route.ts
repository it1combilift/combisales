import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createUserSchema } from "@/schemas/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "No tienes permisos para crear usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      role,
      country,
      isActive,
      image,
      assignedSellerIds,
    } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    // Si es DEALER, validar que los sellers existan y sean realmente SELLER
    if (
      role === Role.DEALER &&
      assignedSellerIds &&
      assignedSellerIds.length > 0
    ) {
      const sellers = await prisma.user.findMany({
        where: {
          id: { in: assignedSellerIds },
          role: Role.SELLER,
        },
      });

      if (sellers.length !== assignedSellerIds.length) {
        return NextResponse.json(
          { error: "Uno o más vendedores seleccionados no son válidos" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hash(password, 12);

    // Crear usuario con relaciones DEALER-SELLER
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        country: country || null,
        isActive: isActive ?? true,
        image: image || null,
        ...(role === Role.DEALER &&
        assignedSellerIds &&
        assignedSellerIds.length > 0
          ? {
              assignedSellers: {
                create: assignedSellerIds.map((sellerId) => ({
                  sellerId,
                })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
        isActive: true,
        image: true,
        createdAt: true,
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

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      {
        error: "Error al crear el usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
