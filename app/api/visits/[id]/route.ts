import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { VisitFormType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UpdateVisitData, CreateFormularioCSSData } from "@/interfaces/visits";

/**
 * GET /api/visits/[id]
 * Get a specific visit by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado. Debe iniciar sesión." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const visit = await prisma.visit.findUnique({
      where: { id },
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

    if (!visit) {
      return NextResponse.json(
        { error: "Visita no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ visit }, { status: 200 });
  } catch (error) {
    console.error("Error fetching visit:", error);
    return NextResponse.json(
      { error: "Error al obtener la visita" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/visits/[id]
 * Update an existing visit
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado. Debe iniciar sesión." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { visitData, formularioData } = body as {
      visitData?: UpdateVisitData;
      formularioData?: CreateFormularioCSSData;
    };

    const existingVisit = await prisma.visit.findUnique({
      where: { id },
      include: { formularioCSSAnalisis: true },
    });

    if (!existingVisit) {
      return NextResponse.json(
        { error: "Visita no encontrada" },
        { status: 404 }
      );
    }

    const visit = await prisma.visit.update({
      where: { id },
      data: {
        ...(visitData?.status && { status: visitData.status }),
        ...(visitData?.visitDate && { visitDate: visitData.visitDate }),
        ...(existingVisit.formType === VisitFormType.ANALISIS_CSS &&
        formularioData
          ? {
              formularioCSSAnalisis: {
                upsert: {
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
                  update: {
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
      { message: "Visita actualizada exitosamente", visit },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating visit:", error);
    return NextResponse.json(
      { error: "Error al actualizar la visita" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/visits/[id]
 * Delete a visit
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado. Debe iniciar sesión." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const visit = await prisma.visit.findUnique({
      where: { id },
    });

    if (!visit) {
      return NextResponse.json(
        { error: "Visita no encontrada" },
        { status: 404 }
      );
    }

    await prisma.visit.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Visita eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting visit:", error);
    return NextResponse.json(
      { error: "Error al eliminar la visita" },
      { status: 500 }
    );
  }
}
