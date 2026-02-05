import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { createZohoCRMService, ZohoCRMService } from "@/service/ZohoCRMService";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role, VisitFormType, VisitStatus } from "@prisma/client";
import { ZohoAccount } from "@/interfaces/zoho";

import {
  VISIT_INCLUDE,
  buildFormularioCreate,
  buildFormularioIndustrialCreate,
  buildFormularioLogisticaCreate,
  buildFormularioStraddleCarrierCreate,
} from "@/lib/visits";

import {
  CreateVisitData,
  CreateFormularioCSSData,
  CreateFormularioIndustrialData,
  CreateFormularioLogisticaData,
  CreateFormularioStraddleCarrierData,
} from "@/interfaces/visits";

import {
  HTTP_STATUS,
  API_SUCCESS,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  createSuccessResponse,
} from "@/lib/api-response";

import {
  sendVisitCompletedNotification,
  shouldSendVisitNotification,
  buildVisitEmailDataExtended,
} from "@/lib/visit-notifications";

// ==================== HELPER: Sync Customer from Zoho ====================
/**
 * Try to sync customer data from Zoho CRM.
 * First tries Accounts, then falls back to Deals (extracting Account_Name).
 * Returns the created/updated customer ID, or null if not found.
 */
async function syncCustomerFromZoho(
  zohoService: ZohoCRMService,
  entityId: string,
): Promise<string | null> {
  // 1. Try fetching as Account
  try {
    const zohoAccount = await zohoService.getAccountById(entityId);
    if (zohoAccount) {
      const customer = await createOrUpdateCustomerFromAccount(zohoAccount);
      return customer.id;
    }
  } catch (accountError) {
    // Account not found, try Deal
    console.log(`Entity ${entityId} not found as Account, trying Deal...`);
  }

  // 2. Try fetching as Deal
  try {
    const deal = await zohoService.getDealById(entityId);
    if (deal) {
      // Check if Deal has linked Account
      if (deal.Account_Name?.id) {
        // Fetch the linked Account
        try {
          const linkedAccount = await zohoService.getAccountById(
            deal.Account_Name.id,
          );
          if (linkedAccount) {
            const customer =
              await createOrUpdateCustomerFromAccount(linkedAccount);
            return customer.id;
          }
        } catch (linkedAccountError) {
          console.warn(
            `Could not fetch linked account ${deal.Account_Name.id} from Deal`,
          );
        }
      }

      // Deal without linked Account - create minimal customer from Deal data
      const customer = await createCustomerFromDeal(deal);
      return customer.id;
    }
  } catch (dealError) {
    console.log(`Entity ${entityId} not found as Deal either`);
  }

  return null;
}

/**
 * Create or update a Customer record from a ZohoAccount
 */
async function createOrUpdateCustomerFromAccount(zohoAccount: ZohoAccount) {
  return prisma.customer.upsert({
    where: { zohoAccountId: zohoAccount.id },
    create: {
      zohoAccountId: zohoAccount.id,
      accountName: zohoAccount.Account_Name,
      razonSocial: zohoAccount.Razon_Social,
      accountNumber: zohoAccount.Account_Number,
      cif: zohoAccount.CIF,
      codigoCliente: zohoAccount.C_digo_Cliente,
      accountType: zohoAccount.Account_Type,
      industry: zohoAccount.Industry,
      subSector: zohoAccount.Sub_Sector,
      phone: zohoAccount.Phone,
      fax: zohoAccount.Fax,
      email: zohoAccount.Correo_electr_nico || zohoAccount.Email,
      website: zohoAccount.Website,
      billingStreet: zohoAccount.Billing_Street,
      billingCity: zohoAccount.Billing_City,
      billingState: zohoAccount.Billing_State,
      billingCode: zohoAccount.Billing_Code,
      billingCountry: zohoAccount.Billing_Country,
      shippingStreet: zohoAccount.Shipping_Street,
      shippingCity: zohoAccount.Shipping_City,
      shippingState: zohoAccount.Shipping_State,
      shippingCode: zohoAccount.Shipping_Code,
      shippingCountry: zohoAccount.Shipping_Country,
      latitude: zohoAccount.dealsingooglemaps__Latitude,
      longitude: zohoAccount.dealsingooglemaps__Longitude,
      zohoOwnerId: zohoAccount.Owner?.id,
      zohoOwnerName: zohoAccount.Owner?.name,
      zohoOwnerEmail: zohoAccount.Owner?.email,
      zohoCreatedById: zohoAccount.Created_By?.id,
      zohoCreatedByName: zohoAccount.Created_By?.name,
      zohoCreatedByEmail: zohoAccount.Created_By?.email,
      parentAccountId: zohoAccount.Parent_Account?.id,
      parentAccountName: zohoAccount.Parent_Account?.name,
      clienteConEquipo: zohoAccount.Cliente_con_Equipo ?? false,
      cuentaNacional: zohoAccount.Cuenta_Nacional ?? false,
      clienteBooks: zohoAccount.Cliente_Books ?? false,
      condicionesEspeciales: zohoAccount.Condiciones_Especiales ?? false,
      proyectoAbierto: zohoAccount.Proyecto_abierto ?? false,
      revisado: zohoAccount.Revisado ?? false,
      localizacionesMultiples: zohoAccount.Localizaciones_multiples ?? false,
      description: zohoAccount.Description,
      comunidadAutonoma: zohoAccount.Comunidad_Aut_noma,
      tipoPedido: zohoAccount.Tipo_de_pedido,
      estadoCuenta: zohoAccount.Estado_de_la_Cuenta,
      zohoCreatedAt: zohoAccount.Created_Time
        ? new Date(zohoAccount.Created_Time)
        : null,
      zohoModifiedAt: zohoAccount.Modified_Time
        ? new Date(zohoAccount.Modified_Time)
        : null,
      lastActivityTime: zohoAccount.Last_Activity_Time
        ? new Date(zohoAccount.Last_Activity_Time)
        : null,
    },
    update: {
      accountName: zohoAccount.Account_Name,
      razonSocial: zohoAccount.Razon_Social,
      accountNumber: zohoAccount.Account_Number,
      cif: zohoAccount.CIF,
      codigoCliente: zohoAccount.C_digo_Cliente,
      accountType: zohoAccount.Account_Type,
      industry: zohoAccount.Industry,
      subSector: zohoAccount.Sub_Sector,
      phone: zohoAccount.Phone,
      fax: zohoAccount.Fax,
      email: zohoAccount.Correo_electr_nico || zohoAccount.Email,
      website: zohoAccount.Website,
      billingStreet: zohoAccount.Billing_Street,
      billingCity: zohoAccount.Billing_City,
      billingState: zohoAccount.Billing_State,
      billingCode: zohoAccount.Billing_Code,
      billingCountry: zohoAccount.Billing_Country,
      zohoOwnerId: zohoAccount.Owner?.id,
      zohoOwnerName: zohoAccount.Owner?.name,
      zohoOwnerEmail: zohoAccount.Owner?.email,
      zohoModifiedAt: zohoAccount.Modified_Time
        ? new Date(zohoAccount.Modified_Time)
        : null,
      lastActivityTime: zohoAccount.Last_Activity_Time
        ? new Date(zohoAccount.Last_Activity_Time)
        : null,
    },
  });
}

/**
 * Create a Customer record from a ZohoDeal (when no Account is linked)
 * Uses Deal ID as a fallback for zohoAccountId with a prefix to distinguish
 */
async function createCustomerFromDeal(deal: any) {
  const dealAccountId = `DEAL_${deal.id}`; // Prefix to distinguish from real Account IDs

  return prisma.customer.upsert({
    where: { zohoAccountId: dealAccountId },
    create: {
      zohoAccountId: dealAccountId,
      accountName: deal.Account_Name?.name || deal.Deal_Name,
      razonSocial: null,
      accountNumber: deal.Numeraci_n_autom_tica_1 || null,
      cif: null,
      codigoCliente: null,
      accountType: deal.Tipo_de_proyecto || null,
      industry: deal.Sector || null,
      subSector: null,
      phone: null,
      fax: null,
      email: deal.Correo_electr_nico || null,
      website: null,
      billingStreet: null,
      billingCity: null,
      billingState: deal.Provincia_Estado || null,
      billingCode: null,
      billingCountry: deal.DealerCountry || null,
      shippingStreet: null,
      shippingCity: null,
      shippingState: null,
      shippingCode: null,
      shippingCountry: null,
      latitude: null,
      longitude: null,
      zohoOwnerId: deal.Owner?.id,
      zohoOwnerName: deal.Owner?.name,
      zohoOwnerEmail: deal.Owner?.email,
      zohoCreatedById: deal.Created_By?.id,
      zohoCreatedByName: deal.Created_By?.name,
      zohoCreatedByEmail: deal.Created_By?.email,
      parentAccountId: null,
      parentAccountName: null,
      clienteConEquipo: false,
      cuentaNacional: false,
      clienteBooks: false,
      condicionesEspeciales: false,
      proyectoAbierto: true,
      revisado: false,
      localizacionesMultiples: false,
      description: deal.Description || `Project: ${deal.Deal_Name}`,
      comunidadAutonoma: null,
      tipoPedido: null,
      estadoCuenta: deal.Stage || null,
      zohoCreatedAt: deal.Created_Time ? new Date(deal.Created_Time) : null,
      zohoModifiedAt: deal.Modified_Time ? new Date(deal.Modified_Time) : null,
      lastActivityTime: deal.Last_Activity_Time
        ? new Date(deal.Last_Activity_Time)
        : null,
    },
    update: {
      accountName: deal.Account_Name?.name || deal.Deal_Name,
      email: deal.Correo_electr_nico || null,
      billingState: deal.Provincia_Estado || null,
      billingCountry: deal.DealerCountry || null,
      zohoOwnerId: deal.Owner?.id,
      zohoOwnerName: deal.Owner?.name,
      zohoOwnerEmail: deal.Owner?.email,
      estadoCuenta: deal.Stage || null,
      zohoModifiedAt: deal.Modified_Time ? new Date(deal.Modified_Time) : null,
      lastActivityTime: deal.Last_Activity_Time
        ? new Date(deal.Last_Activity_Time)
        : null,
    },
  });
}

/**
 * GET /api/visits
 * Query params:
 * - customerId: Get visits for a specific customer
 * - zohoTaskId: Get visits for a specific Zoho task
 * - dealerVisits: Get dealer visits (for DealersPage)
 *   - ADMIN: Returns ALL visits created by DEALER users + clones by SELLERs
 *   - DEALER: Returns only visits created by the current user
 *   - SELLER: Returns visits assigned to them by DEALERs + their own clones
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const zohoTaskId = searchParams.get("zohoTaskId");
    const dealerVisits = searchParams.get("dealerVisits");
    const myVisits = searchParams.get("myVisits");

    if (dealerVisits === "true" || myVisits === "true") {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (!currentUser) {
        return unauthorizedResponse();
      }

      // ADMIN: puede ver TODAS las visitas creadas por usuarios DEALER (incluyendo BORRADOR)
      // Los clones se acceden vía la relación `clones` en VISIT_INCLUDE (misma lógica que SELLER)
      // Esto permite mostrar UNA fila unificada por visita original con vista dual cuando existe clon
      if (currentUser.role === Role.ADMIN) {
        const visits = await prisma.visit.findMany({
          where: {
            // Solo visitas originales creadas por DEALERs
            user: { role: Role.DEALER },
            clonedFromId: null, // Solo originales - los clones vienen vía VISIT_INCLUDE.clones
          },
          include: VISIT_INCLUDE,
          orderBy: { visitDate: "desc" },
        });
        return createSuccessResponse({ visits, userRole: currentUser.role });
      }

      // DEALER: solo puede ver sus propias visitas
      if (currentUser.role === Role.DEALER) {
        const visits = await prisma.visit.findMany({
          where: {
            userId: session.user.id,
          },
          include: VISIT_INCLUDE,
          orderBy: { visitDate: "desc" },
        });
        return createSuccessResponse({ visits, userRole: currentUser.role });
      }

      // SELLER: sees ONLY original visits assigned to them by DEALERs that are NOT in BORRADOR
      // IMPORTANTE: NO mostrar visitas en BORRADOR del DEALER (solo el DEALER ve sus borradores)
      // Phase 4: Unified row logic - clones are accessed via the `clones` relation
      // The UI will show ONE row per dealer visit with dropdown options based on clone status
      if (currentUser.role === Role.SELLER) {
        const visits = await prisma.visit.findMany({
          where: {
            // Only original visits assigned to this SELLER by DEALERs
            assignedSellerId: session.user.id,
            user: { role: Role.DEALER },
            clonedFromId: null, // Only originals - clones are NOT shown as separate rows
            // FILTRO CRÍTICO: Solo visitas que NO están en BORRADOR
            // El DEALER debe haber enviado (COMPLETADA o EN_PROGRESO) para que el SELLER la vea
            status: { not: VisitStatus.BORRADOR },
          },
          include: VISIT_INCLUDE,
          orderBy: { visitDate: "desc" },
        });
        return createSuccessResponse({ visits, userRole: currentUser.role });
      }

      // Otros roles: sin acceso a esta funcionalidad
      return unauthorizedResponse();
    }

    if (!customerId && !zohoTaskId) {
      return badRequestResponse("CUSTOMER_ID_OR_TASK_ID");
    }

    const whereClause: any = {};
    if (customerId) {
      whereClause.customerId = customerId;
    }
    if (zohoTaskId) {
      whereClause.zohoTaskId = zohoTaskId;
    }

    const visits = await prisma.visit.findMany({
      where: whereClause,
      include: VISIT_INCLUDE,
      orderBy: { visitDate: "desc" },
    });

    return createSuccessResponse({ visits });
  } catch (error) {
    return serverErrorResponse("FETCH_VISITS", error);
  }
}

/**
 * POST /api/visits
 * Create a new visit
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { visitData, formularioData } = body as {
      visitData: CreateVisitData;
      formularioData?:
        | CreateFormularioCSSData
        | CreateFormularioIndustrialData
        | CreateFormularioLogisticaData
        | CreateFormularioStraddleCarrierData;
    };

    // Obtener el usuario actual para verificar su rol
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isDealer = currentUser?.role === "DEALER";

    // Para DEALERS: pueden crear visitas sin customerId ni zohoTaskId (documentación propia)
    // Para otros usuarios: deben proporcionar customerId O zohoTaskId
    if (!isDealer && !visitData.customerId && !visitData.zohoTaskId) {
      return badRequestResponse("CUSTOMER_ID_OR_TASK_ID");
    }

    // Si se proporcionan ambos, error
    // if (visitData.customerId && visitData.zohoTaskId) {
    //   return badRequestResponse("ONLY_ONE_ASSOCIATION");
    // }

    // Para DEALERS: validar que assignedSellerId esté presente
    if (isDealer && !visitData.assignedSellerId) {
      return badRequestResponse("ASSIGNED_SELLER_REQUIRED");
    }

    if (!visitData.formType) {
      return badRequestResponse("FORM_TYPE");
    }

    // Logic to validate/link customer: Find existing, Find by Zoho ID, or Sync from Zoho
    let validCustomerId: string | null = null;

    if (visitData.customerId) {
      // 1. Try finding by local DB ID
      const customerById = await prisma.customer.findUnique({
        where: { id: visitData.customerId },
      });

      if (customerById) {
        validCustomerId = customerById.id;
      } else {
        // 2. Try finding by Zoho Account ID (maybe already synced)
        const customerByZoho = await prisma.customer.findFirst({
          where: { zohoAccountId: visitData.customerId },
        });

        if (customerByZoho) {
          validCustomerId = customerByZoho.id;
        } else {
          // 3. Not found locally. Try fetching from Zoho (Accounts or Deals) and sync/create
          try {
            const zohoService = await createZohoCRMService(session.user.id);
            if (zohoService) {
              validCustomerId = await syncCustomerFromZoho(
                zohoService,
                visitData.customerId,
              );
            }
          } catch (error) {
            console.error(
              "Error syncing customer from Zoho during visit create:",
              error,
            );
            // If explicit customerId was requested (not dealer fallback), we should probably fail if we can't find/sync it
            if (!visitData.zohoTaskId && !isDealer) {
              return notFoundResponse("CUSTOMER");
            }
            // Proceed without customer (e.g. just task link)
            validCustomerId = null;
          }
        }
      }

      // Final check: if we expected a customer but failed to resolve one
      if (
        visitData.customerId &&
        !validCustomerId &&
        !visitData.zohoTaskId &&
        !isDealer
      ) {
        return notFoundResponse("CUSTOMER");
      }
    }

    // Validar que el vendedor asignado existe y pertenece a los sellers del DEALER
    if (visitData.assignedSellerId) {
      const sellerExists = await prisma.user.findFirst({
        where: {
          id: visitData.assignedSellerId,
          role: "SELLER",
          isActive: true,
        },
      });

      if (!sellerExists) {
        return notFoundResponse("ASSIGNED_SELLER");
      }
    }

    if (
      (visitData.formType === VisitFormType.ANALISIS_CSS ||
        visitData.formType === VisitFormType.ANALISIS_INDUSTRIAL ||
        visitData.formType === VisitFormType.ANALISIS_LOGISTICA ||
        visitData.formType === VisitFormType.ANALISIS_STRADDLE_CARRIER) &&
      !formularioData
    ) {
      return badRequestResponse("FORM_DATA");
    }

    let formDataCreate = {};
    if (visitData.formType === VisitFormType.ANALISIS_CSS && formularioData) {
      formDataCreate = {
        formularioCSSAnalisis: {
          create: buildFormularioCreate(
            formularioData as CreateFormularioCSSData,
          ),
        },
      };
    } else if (
      visitData.formType === VisitFormType.ANALISIS_INDUSTRIAL &&
      formularioData
    ) {
      formDataCreate = {
        formularioIndustrialAnalisis: {
          create: buildFormularioIndustrialCreate(
            formularioData as CreateFormularioIndustrialData,
          ),
        },
      };
    } else if (
      visitData.formType === VisitFormType.ANALISIS_LOGISTICA &&
      formularioData
    ) {
      formDataCreate = {
        formularioLogisticaAnalisis: {
          create: buildFormularioLogisticaCreate(
            formularioData as CreateFormularioLogisticaData,
          ),
        },
      };
    } else if (
      visitData.formType === VisitFormType.ANALISIS_STRADDLE_CARRIER &&
      formularioData
    ) {
      formDataCreate = {
        formularioStraddleCarrierAnalisis: {
          create: buildFormularioStraddleCarrierCreate(
            formularioData as CreateFormularioStraddleCarrierData,
          ),
        },
      };
    }

    const visit = await prisma.visit.create({
      data: {
        customerId: validCustomerId,
        zohoTaskId: visitData.zohoTaskId,
        userId: session.user.id,
        formType: visitData.formType,
        status: visitData.status || VisitStatus.COMPLETADA,
        visitDate: visitData.visitDate || new Date(),
        // Para visitas creadas por DEALER: asignar vendedor
        assignedSellerId: visitData.assignedSellerId || null,
        ...formDataCreate,
      },
      include: VISIT_INCLUDE,
    });

    const finalStatus = visitData.status || VisitStatus.COMPLETADA;

    // Get user role for email notifications
    const userRole = currentUser?.role;

    if (shouldSendVisitNotification(finalStatus, userRole) && formularioData) {
      // Determine context name (customer or task)
      let contextName = "";
      if (visitData.customerId && visit.customer) {
        contextName = visit.customer.accountName || "";
      } else if (visitData.zohoTaskId) {
        contextName = `#${visitData.zohoTaskId}`;
      }

      // Build email data with extended parameters
      const emailData = buildVisitEmailDataExtended({
        formType: visitData.formType,
        formularioData,
        visitDate: visitData.visitDate || new Date(),
        status: finalStatus,
        locale: visitData.locale || "es",
        visitId: visit.id,
        // Owner is the user who created the visit
        owner: visit.user
          ? {
              name: visit.user.name,
              email: visit.user.email,
              role: visit.user.role,
            }
          : undefined,
        // For DEALER: the dealer is the owner
        dealer:
          userRole === Role.DEALER && visit.user
            ? {
                name: visit.user.name,
                email: visit.user.email,
              }
            : undefined,
        // Seller is either the owner (if SELLER) or the assigned seller (if DEALER created)
        vendedor:
          userRole === Role.SELLER && visit.user
            ? {
                name: visit.user.name,
                email: visit.user.email,
              }
            : visit.assignedSeller
              ? {
                  name: visit.assignedSeller.name,
                  email: visit.assignedSeller.email,
                }
              : undefined,
        customerName: contextName,
        submitterRole: userRole,
        isClone: false,
      });

      // Enviar notificacion de forma asincrona (no bloquea la respuesta)
      sendVisitCompletedNotification({ visitData: emailData })
        .then((result) => {
          if (result.success) {
            console.log(
              `[Email] Notificacion enviada para visita ${visit.id} (${finalStatus}):`,
              result.data?.id,
              `Destinatarios: ${result.sentTo.join(", ")}`,
            );
          } else {
            console.error(
              `[Email] Error enviando notificacion para visita ${visit.id}:`,
              result.error,
            );
          }
        })
        .catch((error) => {
          console.error(
            `[Email] Error inesperado enviando notificacion para visita ${visit.id}:`,
            error,
          );
        });
    }

    return createSuccessResponse(
      { message: API_SUCCESS.VISIT_CREATED, visit },
      HTTP_STATUS.CREATED,
    );
  } catch (error) {
    return serverErrorResponse("CREATE_VISIT", error);
  }
}
