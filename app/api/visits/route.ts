import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { VisitFormType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CreateVisitData, CreateFormularioCSSData } from "@/interfaces/visits";

/**
 * GET /api/visits?customerId=xxx
 * Get visits for a specific customer
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado. Debe iniciar sesión." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId es requerido" },
        { status: 400 }
      );
    }

    const visits = await prisma.visit.findMany({
      where: { customerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        formularioCSSAnalisis: true,
      },
      orderBy: { visitDate: "desc" },
    });

    return NextResponse.json({ visits }, { status: 200 });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      { error: "Error al obtener las visitas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visits
 * Create a new visit with CSS form
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "No autorizado. Debe iniciar sesión." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { visitData, formularioData } = body as {
      visitData: CreateVisitData;
      formularioData?: CreateFormularioCSSData;
    };

    if (!visitData.customerId || !visitData.formType) {
      return NextResponse.json(
        { error: "customerId y formType son requeridos" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: visitData.customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    if (visitData.formType === VisitFormType.ANALISIS_CSS && !formularioData) {
      return NextResponse.json(
        { error: "Datos del formulario CSS son requeridos" },
        { status: 400 }
      );
    }

    const visit = await prisma.visit.create({
      data: {
        customerId: visitData.customerId,
        userId: session.user.id,
        formType: visitData.formType,
        visitDate: visitData.visitDate || new Date(),
        ...(visitData.formType === VisitFormType.ANALISIS_CSS && formularioData
          ? {
              formularioCSSAnalisis: {
                create: {
                  razonSocial: formularioData.razonSocial,
                  personaContacto: formularioData.personaContacto,
                  email: formularioData.email,
                  direccion: formularioData.direccion,
                  localidad: formularioData.localidad,
                  provinciaEstado: formularioData.provinciaEstado,
                  pais: formularioData.pais,
                  codigoPostal: formularioData.codigoPostal || null,
                  website: formularioData.website || null,
                  numeroIdentificacionFiscal:
                    formularioData.numeroIdentificacionFiscal || null,
                  distribuidor: formularioData.distribuidor || null,
                  contactoDistribuidor:
                    formularioData.contactoDistribuidor || null,
                  fechaCierre: formularioData.fechaCierre || null,
                  datosClienteUsuarioFinal:
                    formularioData.datosClienteUsuarioFinal || null,
                  descripcionProducto: formularioData.descripcionProducto,
                  fotosVideosUrls: formularioData.fotosVideosUrls || [],
                  contenedorTipos: formularioData.contenedorTipos,
                  contenedoresPorSemana:
                    formularioData.contenedoresPorSemana || null,
                  condicionesSuelo: formularioData.condicionesSuelo || null,
                  contenedorMedida: formularioData.contenedorMedida,
                  contenedorMedidaOtro:
                    formularioData.contenedorMedidaOtro || null,
                },
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        formularioCSSAnalisis: true,
      },
    });

    return NextResponse.json(
      { message: "Visita creada exitosamente", visit },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Error al crear la visita" },
      { status: 500 }
    );
  }
}
