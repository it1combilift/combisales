import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { CreateCustomerData } from "@/interfaces/visits";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * POST /api/customers
 * Create or update a customer record with complete Zoho data (upsert)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado. Debe iniciar sesión." },
        { status: 401 }
      );
    }

    const data: CreateCustomerData = await req.json();

    if (!data.zohoAccountId || !data.accountName) {
      return NextResponse.json(
        { error: "zohoAccountId y accountName son requeridos" },
        { status: 400 }
      );
    }

    // Datos completos del cliente
    const customerData = {
      // Información principal
      accountName: data.accountName,
      razonSocial: data.razonSocial || null,
      accountNumber: data.accountNumber || null,
      cif: data.cif || null,
      codigoCliente: data.codigoCliente || null,

      // Clasificación
      accountType: data.accountType || null,
      industry: data.industry || null,
      subSector: data.subSector || null,

      // Contacto
      phone: data.phone || null,
      fax: data.fax || null,
      email: data.email || null,
      website: data.website || null,

      // Dirección de facturación
      billingStreet: data.billingStreet || null,
      billingCity: data.billingCity || null,
      billingState: data.billingState || null,
      billingCode: data.billingCode || null,
      billingCountry: data.billingCountry || null,

      // Dirección de envío
      shippingStreet: data.shippingStreet || null,
      shippingCity: data.shippingCity || null,
      shippingState: data.shippingState || null,
      shippingCode: data.shippingCode || null,
      shippingCountry: data.shippingCountry || null,

      // Geolocalización
      latitude: data.latitude || null,
      longitude: data.longitude || null,

      // Propietario de la cuenta en Zoho
      zohoOwnerId: data.zohoOwnerId || null,
      zohoOwnerName: data.zohoOwnerName || null,
      zohoOwnerEmail: data.zohoOwnerEmail || null,

      // Creador de la cuenta en Zoho
      zohoCreatedById: data.zohoCreatedById || null,
      zohoCreatedByName: data.zohoCreatedByName || null,
      zohoCreatedByEmail: data.zohoCreatedByEmail || null,

      // Cuenta padre
      parentAccountId: data.parentAccountId || null,
      parentAccountName: data.parentAccountName || null,

      // Estados y flags booleanos
      clienteConEquipo: data.clienteConEquipo ?? false,
      cuentaNacional: data.cuentaNacional ?? false,
      clienteBooks: data.clienteBooks ?? false,
      condicionesEspeciales: data.condicionesEspeciales ?? false,
      proyectoAbierto: data.proyectoAbierto ?? false,
      revisado: data.revisado ?? false,
      localizacionesMultiples: data.localizacionesMultiples ?? false,

      // Otros campos
      description: data.description || null,
      comunidadAutonoma: data.comunidadAutonoma || null,
      tipoPedido: data.tipoPedido || null,
      estadoCuenta: data.estadoCuenta || null,

      // Metadatos de Zoho
      zohoCreatedAt: data.zohoCreatedAt || null,
      zohoModifiedAt: data.zohoModifiedAt || null,
      lastActivityTime: data.lastActivityTime || null,
    };

    // Usar upsert: crear si no existe, actualizar si ya existe
    const customer = await prisma.customer.upsert({
      where: { zohoAccountId: data.zohoAccountId },
      create: {
        zohoAccountId: data.zohoAccountId,
        ...customerData,
      },
      update: customerData,
    });

    return NextResponse.json(
      { message: "Cliente sincronizado exitosamente", customer },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating/updating customer:", error);
    return NextResponse.json(
      { error: "Error al sincronizar el cliente" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/customers?zohoAccountId=xxx
 * Get a customer by their Zoho Account ID
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
    const zohoAccountId = searchParams.get("zohoAccountId");

    if (!zohoAccountId) {
      return NextResponse.json(
        { error: "zohoAccountId es requerido" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { zohoAccountId },
      include: {
        visits: {
          orderBy: { visitDate: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado", exists: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer, exists: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Error al obtener el cliente" },
      { status: 500 }
    );
  }
}
