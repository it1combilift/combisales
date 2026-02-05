/**
 * Client Context Interface
 *
 * Unified interface for client data regardless of source (Accounts, Deals, Leads).
 * This abstraction layer normalizes data from different Zoho CRM modules.
 */

// ==================== SOURCE MODULE TYPES ====================
export type ClientSourceModule = "Accounts" | "Deals" | "Leads";

// ==================== DEAL INFO (when source is Deals) ====================
export interface DealInfo {
  dealId: string;
  dealName: string;
  stage?: string | null;
  closingDate?: string | null;
  amount?: number | null;
  probability?: number | null;
}

// ==================== LEAD INFO (when source is Leads) ====================
export interface LeadInfo {
  leadId: string;
  leadName: string;
  company?: string | null;
  title?: string | null;
  leadSource?: string | null;
  leadStatus?: string | null;
  rating?: string | null;
  convertedAccountId?: string | null;
  convertedContactId?: string | null;
  convertedDealId?: string | null;
}

// ==================== CLIENT CONTEXT INTERFACE ====================
export interface ClientContext {
  // ==================== IDENTIFICATION ====================
  /**
   * Primary ID used for customer operations
   * - For Accounts: Account ID
   * - For Deals with Account_Name: Account ID from the Deal
   * - For Deals without Account_Name: Deal ID (fallback)
   */
  id: string;

  /**
   * The Zoho module this data originates from
   */
  sourceModule: ClientSourceModule;

  /**
   * Original ID in Zoho (Account ID, Deal ID, or Lead ID)
   */
  sourceId: string;

  /**
   * Zoho Account ID (if available)
   * - For Accounts: same as sourceId
   * - For Deals: Account_Name.id if present, null otherwise
   * - For Leads: null (leads are not linked to accounts)
   */
  zohoAccountId: string | null;

  // ==================== BASIC INFO ====================
  /**
   * Display name for the client
   */
  name: string;

  /**
   * Account name (for Customer model)
   */
  accountName: string;

  /**
   * Legal/Fiscal name
   */
  razonSocial?: string | null;

  /**
   * Account number
   */
  accountNumber?: string | null;

  /**
   * Tax identification number
   */
  cif?: string | null;

  /**
   * Internal client code
   */
  codigoCliente?: string | null;

  // ==================== CLASSIFICATION ====================
  accountType?: string | null;
  industry?: string | null;
  subSector?: string | null;

  // ==================== CONTACT INFO ====================
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;

  // ==================== BILLING ADDRESS ====================
  billingStreet?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingCode?: string | null;
  billingCountry?: string | null;

  // ==================== SHIPPING ADDRESS ====================
  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingCode?: string | null;
  shippingCountry?: string | null;

  // ==================== GEOLOCATION ====================
  latitude?: string | null;
  longitude?: string | null;

  // ==================== ZOHO OWNER ====================
  zohoOwnerId?: string | null;
  zohoOwnerName?: string | null;
  zohoOwnerEmail?: string | null;

  // ==================== ZOHO CREATOR ====================
  zohoCreatedById?: string | null;
  zohoCreatedByName?: string | null;
  zohoCreatedByEmail?: string | null;

  // ==================== ACCOUNT FLAGS ====================
  clienteConEquipo?: boolean;
  cuentaNacional?: boolean;
  clienteBooks?: boolean;
  condicionesEspeciales?: boolean;
  proyectoAbierto?: boolean;
  revisado?: boolean;
  localizacionesMultiples?: boolean;

  // ==================== METADATA ====================
  description?: string | null;
  zohoCreatedAt?: string | null;
  zohoModifiedAt?: string | null;
  lastActivityTime?: string | null;

  // ==================== DEAL-SPECIFIC INFO ====================
  /**
   * Information about the Deal (only present when sourceModule === "Deals")
   */
  dealInfo?: DealInfo | null;

  // ==================== LEAD-SPECIFIC INFO ====================
  /**
   * Information about the Lead (only present when sourceModule === "Leads")
   */
  leadInfo?: LeadInfo | null;
}

// ==================== HELPER TYPE FOR CUSTOMER CONVERSION ====================
/**
 * Type for creating a Customer from ClientContext
 * Used when passing to VisitFormDialog
 */
export interface CustomerFromContext {
  id: string;
  zohoAccountId: string;
  accountName: string;
  razonSocial?: string | null;
  accountNumber?: string | null;
  cif?: string | null;
  codigoCliente?: string | null;
  accountType?: string | null;
  industry?: string | null;
  subSector?: string | null;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;
  billingStreet?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingCode?: string | null;
  billingCountry?: string | null;
  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingCode?: string | null;
  shippingCountry?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  zohoOwnerId?: string | null;
  zohoOwnerName?: string | null;
  zohoOwnerEmail?: string | null;
  clienteConEquipo: boolean;
  cuentaNacional: boolean;
  clienteBooks: boolean;
  condicionesEspeciales: boolean;
  proyectoAbierto: boolean;
  revisado: boolean;
  localizacionesMultiples: boolean;
  createdAt: Date;
  updatedAt: Date;
}
