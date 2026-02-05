/**
 * Client Context Utilities
 *
 * Functions to normalize data from different Zoho CRM modules (Accounts, Deals, Leads)
 * into a unified ClientContext structure.
 */

import { ZohoAccount, ZohoDeal, ZohoLead, ZohoTask } from "@/interfaces/zoho";
import {
  ClientContext,
  ClientSourceModule,
  CustomerFromContext,
} from "@/interfaces/client-context";

// ==================== NORMALIZERS ====================

/**
 * Normalize ZohoAccount to ClientContext
 */
export function accountToClientContext(account: ZohoAccount): ClientContext {
  return {
    // Identification
    id: account.id,
    sourceModule: "Accounts",
    sourceId: account.id,
    zohoAccountId: account.id,

    // Basic Info
    name: account.Account_Name,
    accountName: account.Account_Name,
    razonSocial: account.Razon_Social || null,
    accountNumber: account.Account_Number || null,
    cif: account.CIF || null,
    codigoCliente: account.C_digo_Cliente || null,

    // Classification
    accountType: account.Account_Type || null,
    industry: account.Industry || null,
    subSector: account.Sub_Sector || null,

    // Contact Info
    phone: account.Phone || null,
    fax: account.Fax || null,
    email: account.Correo_electr_nico || account.Email || null,
    website: account.Website || null,

    // Billing Address
    billingStreet: account.Billing_Street || null,
    billingCity: account.Billing_City || null,
    billingState: account.Billing_State || null,
    billingCode: account.Billing_Code || null,
    billingCountry: account.Billing_Country || null,

    // Shipping Address
    shippingStreet: account.Shipping_Street || null,
    shippingCity: account.Shipping_City || null,
    shippingState: account.Shipping_State || null,
    shippingCode: account.Shipping_Code || null,
    shippingCountry: account.Shipping_Country || null,

    // Geolocation
    latitude: account.dealsingooglemaps__Latitude || null,
    longitude: account.dealsingooglemaps__Longitude || null,

    // Owner
    zohoOwnerId: account.Owner?.id || null,
    zohoOwnerName: account.Owner?.name || null,
    zohoOwnerEmail: account.Owner?.email || null,

    // Creator
    zohoCreatedById: account.Created_By?.id || null,
    zohoCreatedByName: account.Created_By?.name || null,
    zohoCreatedByEmail: account.Created_By?.email || null,

    // Flags
    clienteConEquipo: account.Cliente_con_Equipo ?? false,
    cuentaNacional: account.Cuenta_Nacional ?? false,
    clienteBooks: account.Cliente_Books ?? false,
    condicionesEspeciales: account.Condiciones_Especiales ?? false,
    proyectoAbierto: account.Proyecto_abierto ?? false,
    revisado: account.Revisado ?? false,
    localizacionesMultiples: account.Localizaciones_multiples ?? false,

    // Metadata
    description: account.Description || null,
    zohoCreatedAt: account.Created_Time || null,
    zohoModifiedAt: account.Modified_Time || null,
    lastActivityTime: account.Last_Activity_Time || null,

    // No deal info for Accounts
    dealInfo: null,
  };
}

/**
 * Normalize ZohoDeal to ClientContext
 *
 * @param deal - The Deal/Project data from Zoho
 * @param linkedAccount - Optional: Full account data if Account_Name was fetched
 */
export function dealToClientContext(
  deal: ZohoDeal,
  linkedAccount?: ZohoAccount | null,
): ClientContext {
  // If we have a linked account, use its data primarily
  if (linkedAccount) {
    const context = accountToClientContext(linkedAccount);
    return {
      ...context,
      // Override source info to indicate this came from a Deal
      sourceModule: "Deals",
      sourceId: deal.id,
      // Add deal-specific info
      dealInfo: {
        dealId: deal.id,
        dealName: deal.Deal_Name,
        stage: deal.Stage || null,
        closingDate: deal.Closing_Date || null,
        amount: deal.Amount || null,
        probability: deal.Probability || null,
      },
    };
  }

  // No linked account - use Deal data directly
  // This is a fallback scenario when Deal doesn't have Account_Name
  return {
    // Identification
    id: deal.id, // Use Deal ID as primary ID
    sourceModule: "Deals",
    sourceId: deal.id,
    zohoAccountId: deal.Account_Name?.id || null, // May be null

    // Basic Info - derive from Deal
    name: deal.Account_Name?.name || deal.Deal_Name,
    accountName: deal.Account_Name?.name || deal.Deal_Name,
    razonSocial: null,
    accountNumber: null,
    cif: null,
    codigoCliente: null,

    // Classification - limited from Deal
    accountType: null,
    industry: null,
    subSector: null,

    // Contact Info - some deals have email
    phone: null,
    fax: null,
    email: (deal as any).Correo_electr_nico || null, // Some Deals have this field
    website: null,

    // Billing Address - from Deal if available
    billingStreet: null,
    billingCity: null,
    billingState: (deal as any).Provincia_Estado || null,
    billingCode: null,
    billingCountry: (deal as any).DealerCountry || null,

    // Shipping Address - not available from Deal
    shippingStreet: null,
    shippingCity: null,
    shippingState: null,
    shippingCode: null,
    shippingCountry: null,

    // Geolocation - not available from Deal
    latitude: null,
    longitude: null,

    // Owner
    zohoOwnerId: deal.Owner?.id || null,
    zohoOwnerName: deal.Owner?.name || null,
    zohoOwnerEmail: deal.Owner?.email || null,

    // Creator
    zohoCreatedById: deal.Created_By?.id || null,
    zohoCreatedByName: deal.Created_By?.name || null,
    zohoCreatedByEmail: deal.Created_By?.email || null,

    // Flags - defaults
    clienteConEquipo: false,
    cuentaNacional: false,
    clienteBooks: false,
    condicionesEspeciales: false,
    proyectoAbierto: true, // Deal implies open project
    revisado: false,
    localizacionesMultiples: false,

    // Metadata
    description: deal.Description || null,
    zohoCreatedAt: deal.Created_Time || null,
    zohoModifiedAt: deal.Modified_Time || null,
    lastActivityTime: deal.Last_Activity_Time || null,

    // Deal info
    dealInfo: {
      dealId: deal.id,
      dealName: deal.Deal_Name,
      stage: deal.Stage || null,
      closingDate: deal.Closing_Date || null,
      amount: deal.Amount || null,
      probability: deal.Probability || null,
    },
  };
}

/**
 * Normalize ZohoLead to ClientContext
 *
 * @param lead - The Lead data from Zoho
 */
export function leadToClientContext(lead: ZohoLead): ClientContext {
  // Construct full name from First_Name and Last_Name
  const fullName =
    lead.Full_Name ||
    [lead.First_Name, lead.Last_Name].filter(Boolean).join(" ") ||
    lead.Company ||
    "Lead";

  return {
    // Identification
    id: lead.id,
    sourceModule: "Leads",
    sourceId: lead.id,
    zohoAccountId: null, // Leads don't have Account ID until converted

    // Basic Info - derive from Lead
    name: lead.Company || fullName,
    accountName: lead.Company || fullName,
    razonSocial: null,
    accountNumber: null,
    cif: null,
    codigoCliente: null,

    // Classification
    accountType: null,
    industry: lead.Industry || null,
    subSector: null,

    // Contact Info
    phone: lead.Phone || null,
    fax: lead.Fax || null,
    email: lead.Email || null,
    website: lead.Website || null,

    // Billing Address (using lead's primary address)
    billingStreet: lead.Street || null,
    billingCity: lead.City || null,
    billingState: lead.State || null,
    billingCode: lead.Zip_Code || null,
    billingCountry: lead.Country || null,

    // Shipping Address - not available from Lead
    shippingStreet: null,
    shippingCity: null,
    shippingState: null,
    shippingCode: null,
    shippingCountry: null,

    // Geolocation - not available from Lead
    latitude: null,
    longitude: null,

    // Owner
    zohoOwnerId: lead.Owner?.id || null,
    zohoOwnerName: lead.Owner?.name || null,
    zohoOwnerEmail: lead.Owner?.email || null,

    // Creator
    zohoCreatedById: lead.Created_By?.id || null,
    zohoCreatedByName: lead.Created_By?.name || null,
    zohoCreatedByEmail: lead.Created_By?.email || null,

    // Flags - defaults for leads
    clienteConEquipo: false,
    cuentaNacional: false,
    clienteBooks: false,
    condicionesEspeciales: false,
    proyectoAbierto: false,
    revisado: false,
    localizacionesMultiples: false,

    // Metadata
    description: lead.Description || null,
    zohoCreatedAt: lead.Created_Time || null,
    zohoModifiedAt: lead.Modified_Time || null,
    lastActivityTime: lead.Last_Activity_Time || null,

    // No deal info for Leads
    dealInfo: null,

    // Lead-specific info (stored in metadata since it's optional)
    leadInfo: {
      leadId: lead.id,
      leadName: fullName,
      company: lead.Company || null,
      title: lead.Title || null,
      leadSource: lead.Lead_Source || null,
      leadStatus: lead.Lead_Status || null,
      rating: lead.Rating || null,
      convertedAccountId: lead.Converted_Account?.id || null,
      convertedContactId: lead.Converted_Contact?.id || null,
      convertedDealId: lead.Converted_Deal?.id || null,
    },
  };
}

// ==================== CONVERSION UTILITIES ====================

/**
 * Convert ClientContext to CustomerFromContext
 * Used for passing to VisitFormDialog component
 */
export function clientContextToCustomer(
  context: ClientContext,
): CustomerFromContext {
  return {
    id: context.zohoAccountId || context.id,
    zohoAccountId: context.zohoAccountId || context.sourceId,
    accountName: context.accountName,
    razonSocial: context.razonSocial,
    accountNumber: context.accountNumber,
    cif: context.cif,
    codigoCliente: context.codigoCliente,
    accountType: context.accountType,
    industry: context.industry,
    subSector: context.subSector,
    phone: context.phone,
    fax: context.fax,
    email: context.email,
    website: context.website,
    billingStreet: context.billingStreet,
    billingCity: context.billingCity,
    billingState: context.billingState,
    billingCode: context.billingCode,
    billingCountry: context.billingCountry,
    shippingStreet: context.shippingStreet,
    shippingCity: context.shippingCity,
    shippingState: context.shippingState,
    shippingCode: context.shippingCode,
    shippingCountry: context.shippingCountry,
    latitude: context.latitude,
    longitude: context.longitude,
    zohoOwnerId: context.zohoOwnerId,
    zohoOwnerName: context.zohoOwnerName,
    zohoOwnerEmail: context.zohoOwnerEmail,
    clienteConEquipo: context.clienteConEquipo ?? false,
    cuentaNacional: context.cuentaNacional ?? false,
    clienteBooks: context.clienteBooks ?? false,
    condicionesEspeciales: context.condicionesEspeciales ?? false,
    proyectoAbierto: context.proyectoAbierto ?? false,
    revisado: context.revisado ?? false,
    localizacionesMultiples: context.localizacionesMultiples ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ==================== MODULE DETECTION ====================

/**
 * Get the source module from a Zoho Task
 * Returns the module type or null if not determinable
 */
export function getTaskSourceModule(task: ZohoTask): ClientSourceModule | null {
  const seModule = task.$se_module;

  if (!seModule) {
    return null;
  }

  // Normalize module name
  switch (seModule.toLowerCase()) {
    case "accounts":
      return "Accounts";
    case "deals":
      return "Deals";
    case "leads":
      return "Leads";
    default:
      console.warn(`Unknown $se_module value: ${seModule}`);
      return null;
  }
}

/**
 * Check if a module is currently supported
 */
export function isModuleSupported(module: ClientSourceModule | null): boolean {
  if (!module) return false;
  return module === "Accounts" || module === "Deals" || module === "Leads";
}

/**
 * Check if task has a related entity (What_Id)
 */
export function hasRelatedEntity(task: ZohoTask): boolean {
  return !!task.What_Id?.id;
}

// ==================== LOGGING HELPERS ====================

/**
 * Log client context resolution for debugging
 */
export function logClientContextResolution(
  taskId: string,
  sourceModule: ClientSourceModule | null,
  success: boolean,
  details?: string,
): void {
  const prefix = success ? "[ClientContext]" : "[ClientContext ERROR]";
  console.log(
    `${prefix} Task ${taskId}: Module=${sourceModule || "UNKNOWN"} ${details || ""}`,
  );
}
