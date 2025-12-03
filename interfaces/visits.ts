import {
  VisitFormType,
  VisitStatus,
  ContenedorTipo,
  ContenedorMedida,
} from "@prisma/client";

// ==================== CUSTOMER INTERFACES ====================
// Sincronizado con schema.prisma Customer model
export interface Customer {
  id: string;
  zohoAccountId: string;

  // Información principal
  accountName: string;
  razonSocial?: string | null;
  accountNumber?: string | null;
  cif?: string | null;
  codigoCliente?: string | null;

  // Clasificación
  accountType?: string | null;
  industry?: string | null;
  subSector?: string | null;

  // Contacto
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;

  // Dirección de facturación
  billingStreet?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingCode?: string | null;
  billingCountry?: string | null;

  // Dirección de envío
  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingCode?: string | null;
  shippingCountry?: string | null;

  // Geolocalización
  latitude?: string | null;
  longitude?: string | null;

  // Propietario de la cuenta en Zoho
  zohoOwnerId?: string | null;
  zohoOwnerName?: string | null;
  zohoOwnerEmail?: string | null;

  // Creador de la cuenta en Zoho
  zohoCreatedById?: string | null;
  zohoCreatedByName?: string | null;
  zohoCreatedByEmail?: string | null;

  // Cuenta padre (si es subcuenta)
  parentAccountId?: string | null;
  parentAccountName?: string | null;

  // Estados y flags booleanos
  clienteConEquipo: boolean;
  cuentaNacional: boolean;
  clienteBooks: boolean;
  condicionesEspeciales: boolean;
  proyectoAbierto: boolean;
  revisado: boolean;
  localizacionesMultiples: boolean;

  // Otros campos
  description?: string | null;
  comunidadAutonoma?: string | null;
  tipoPedido?: string | null;
  estadoCuenta?: string | null;

  // Metadatos de Zoho
  zohoCreatedAt?: Date | null;
  zohoModifiedAt?: Date | null;
  lastActivityTime?: Date | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ==================== VISIT INTERFACES ====================
export interface Visit {
  id: string;
  customerId: string;
  userId: string;
  formType: VisitFormType;
  status: VisitStatus;
  visitDate: Date;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  formularioCSSAnalisis?: FormularioCSSAnalisis;
}

export interface VisitWithDetails extends Visit {
  customer: Customer;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// ==================== FORMULARIO CSS ANALYSIS INTERFACES ====================
export interface FormularioCSSAnalisis {
  id: string;
  visitId: string;
  // Datos del cliente
  datosClienteUsuarioFinal?: string | null;
  razonSocial: string;
  personaContacto: string;
  email: string;
  direccion: string;
  localidad: string;
  provinciaEstado: string;
  pais: string;
  codigoPostal?: string | null;
  website?: string | null;
  numeroIdentificacionFiscal?: string | null;
  distribuidor?: string | null;
  contactoDistribuidor?: string | null;
  fechaCierre?: Date | null;
  // Descripción del producto
  descripcionProducto: string;
  fotosVideosUrls: string[];
  // Datos del contenedor
  contenedorTipos: ContenedorTipo[];
  contenedoresPorSemana?: number | null;
  condicionesSuelo?: string | null;
  // Medidas del contenedor
  contenedorMedida: ContenedorMedida;
  contenedorMedidaOtro?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== FORM DATA INTERFACES ====================
// Interface para crear un nuevo cliente desde datos de Zoho
export interface CreateCustomerData {
  zohoAccountId: string;

  // Información principal
  accountName: string;
  razonSocial?: string;
  accountNumber?: string;
  cif?: string;
  codigoCliente?: string;

  // Clasificación
  accountType?: string;
  industry?: string;
  subSector?: string;

  // Contacto
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;

  // Dirección de facturación
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingCode?: string;
  billingCountry?: string;

  // Dirección de envío
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCode?: string;
  shippingCountry?: string;

  // Geolocalización
  latitude?: string;
  longitude?: string;

  // Propietario de la cuenta en Zoho
  zohoOwnerId?: string;
  zohoOwnerName?: string;
  zohoOwnerEmail?: string;

  // Creador de la cuenta en Zoho
  zohoCreatedById?: string;
  zohoCreatedByName?: string;
  zohoCreatedByEmail?: string;

  // Cuenta padre
  parentAccountId?: string;
  parentAccountName?: string;

  // Estados y flags booleanos
  clienteConEquipo?: boolean;
  cuentaNacional?: boolean;
  clienteBooks?: boolean;
  condicionesEspeciales?: boolean;
  proyectoAbierto?: boolean;
  revisado?: boolean;
  localizacionesMultiples?: boolean;

  // Otros campos
  description?: string;
  comunidadAutonoma?: string;
  tipoPedido?: string;
  estadoCuenta?: string;

  // Metadatos de Zoho
  zohoCreatedAt?: Date;
  zohoModifiedAt?: Date;
  lastActivityTime?: Date;
}

export interface CreateVisitData {
  customerId: string;
  formType: VisitFormType;
  status?: VisitStatus;
  visitDate?: Date;
}

export interface CreateFormularioCSSData {
  razonSocial: string;
  personaContacto: string;
  email: string;
  direccion: string;
  localidad: string;
  provinciaEstado: string;
  pais: string;
  codigoPostal?: string;
  website?: string;
  numeroIdentificacionFiscal?: string;
  distribuidor?: string;
  contactoDistribuidor?: string;
  fechaCierre?: Date;
  datosClienteUsuarioFinal?: string;
  descripcionProducto: string;
  fotosVideosUrls?: string[];
  contenedorTipos: ContenedorTipo[];
  contenedoresPorSemana?: number;
  condicionesSuelo?: string;
  contenedorMedida: ContenedorMedida;
  contenedorMedidaOtro?: string;
}

export interface UpdateVisitData {
  status?: VisitStatus;
  visitDate?: Date;
}

// ==================== FORM TYPE LABELS ====================
export const FORM_TYPE_LABELS: Record<VisitFormType, string> = {
  ANALISIS_CSS: "Formulario Análisis CSS",
  ANALISIS_INDUSTRIAL: "Formulario Análisis Industrial",
  ANALISIS_LOGISTICA: "Formulario Análisis Logística",
  ANALISIS_STRADDLE_CARRIER: "Formulario Análisis Straddle Carrier",
};

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  BORRADOR: "Borrador",
  COMPLETADA: "Completada",
  ENVIADA: "Enviada",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
};

export const CONTENEDOR_TIPO_LABELS: Record<ContenedorTipo, string> = {
  SOBRE_CAMION: "Contenedor sobre camión",
  EN_SUELO: "Contenedor en suelo",
  INTERIOR: "Interior",
  EXTERIOR: "Exterior",
};

export const CONTENEDOR_MEDIDA_LABELS: Record<ContenedorMedida, string> = {
  VEINTE_PIES: "20 pies",
  TREINTA_PIES: "30 pies",
  CUARENTA_PIES: "40 pies",
  OTRO: "Otro",
};
