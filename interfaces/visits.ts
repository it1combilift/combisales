import { FormularioCSSSchema, ArchivoSubido } from "@/schemas/visits";
import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";

import {
  CheckCircle,
  ClipboardList,
  Clock,
  Factory,
  Forklift,
  Ship,
  Timer,
} from "lucide-react";

import {
  VisitFormType,
  VisitStatus,
  ContenedorTipo,
  ContenedorMedida,
  TipoArchivo,
  Role,
} from "@prisma/client";

// Re-export enums for easier import
export {
  VisitFormType,
  VisitStatus,
  ContenedorTipo,
  ContenedorMedida,
  TipoArchivo,
  Role,
};

// ==================== CUSTOMER INTERFACES ====================
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
  customerId?: string; // Opcional: visita asociada a cliente
  zohoTaskId?: string; // Opcional: visita asociada a tarea de Zoho
  userId: string;
  formType: VisitFormType;
  status: VisitStatus;
  visitDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // Para visitas creadas por DEALER: vendedor asignado
  assignedSellerId?: string | null;
  // Campos de clonación (cuando SELLER clona una visita de DEALER)
  clonedFromId?: string | null;
  clonedAt?: Date | null;
  customer?: Customer;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role?: string;
    image?: string | null;
  };
  // Vendedor asignado (cuando un DEALER crea la visita)
  assignedSeller?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  // Clones of this visit (for unified row logic in SELLER view)
  // Phase 4: Each original visit can have at most one clone
  clones?: Array<{
    id: string;
    status: VisitStatus;
    visitDate: Date;
    createdAt: Date;
    user?: {
      id: string;
      name: string | null;
      email: string;
      image?: string | null;
    };
  }>;
  // Visita original (si esta es un clon)
  // Incluye los formularios con archivos para mostrar los adjuntos del original
  clonedFrom?: {
    id: string;
    visitDate: Date;
    user?: {
      id: string;
      name: string | null;
      email: string;
      image?: string | null;
    };
    // Formularios del original con sus archivos
    formularioCSSAnalisis?: FormularioCSSAnalisis;
    formularioIndustrialAnalisis?: FormularioIndustrialAnalisis;
    formularioLogisticaAnalisis?: FormularioLogisticaAnalisis;
    formularioStraddleCarrierAnalisis?: FormularioStraddleCarrierAnalisis;
  } | null;
  formularioCSSAnalisis?: FormularioCSSAnalisis;
  formularioIndustrialAnalisis?: FormularioIndustrialAnalisis;
  formularioLogisticaAnalisis?: FormularioLogisticaAnalisis;
  formularioStraddleCarrierAnalisis?: FormularioStraddleCarrierAnalisis;
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
export interface FormularioArchivo {
  id: string;
  nombre: string;
  tipoArchivo: TipoArchivo;
  mimeType: string;
  tamanio: number;
  cloudinaryId: string;
  cloudinaryUrl: string;
  cloudinaryType: string;
  ancho?: number | null;
  alto?: number | null;
  duracion?: number | null;
  formato: string;
  createdAt: Date;
}

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
  contenedorMedidas: ContenedorMedida[];
  contenedorMedidaOtro?: string | null;
  // Archivos adjuntos
  archivos?: FormularioArchivo[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== FORMULARIO INDUSTRIAL ANALYSIS INTERFACE ====================
export interface FormularioIndustrialAnalisis {
  id: string;
  visitId: string;
  // 1. Datos del cliente
  razonSocial: string;
  personaContacto: string;
  email: string;
  direccion: string;
  localidad: string;
  provinciaEstado: string;
  pais: string;
  codigoPostal: string;
  website?: string | null;
  numeroIdentificacionFiscal: string;
  distribuidor?: string | null;
  contactoDistribuidor?: string | null;
  fechaCierre?: Date | null;
  // 2. Descripción operación
  notasOperacion: string;
  // 3. Datos aplicación
  descripcionProducto: string;
  alturaUltimoNivelEstanteria?: number | null;
  maximaAlturaElevacion?: number | null;
  pesoCargaMaximaAltura?: number | null;
  pesoCargaPrimerNivel?: number | null;
  dimensionesAreaTrabajoAncho?: number | null;
  dimensionesAreaTrabajoFondo?: number | null;
  turnosTrabajo?: number | null;
  fechaEstimadaDefinicion?: Date | null;
  alimentacionDeseada: string;
  // 4. Equipos eléctricos (JSON)
  equiposElectricos?: {
    tipoCorriente?: string;
    voltaje?: number;
    frecuencia?: number;
    potenciaDisponible?: number;
    distanciaPuntoRecarga?: number;
  } | null;
  // 5. Dimensiones cargas (JSON array)
  dimensionesCargas: Array<{
    producto: string;
    largo?: number;
    ancho?: number;
    alto?: number;
    peso?: number;
    porcentaje?: number;
  }>;
  // 6. Especificaciones pasillo (JSON)
  especificacionesPasillo: {
    profundidadProducto?: number;
    anchoLibreEntreProductos?: number;
    distanciaLibreEntreEstanterias?: number;
    fondoUtilEstanteria?: number;
    alturaBaseEstanteria?: number;
    distanciaBajoRielesGuia?: number;
    alturaSueloPrimerBrazo?: number;
    distanciaEntreRielesGuia?: number;
    alturaLibreHastaGuia?: number;
    grosorPilarColumna?: number;
    alturaUltimoNivel?: number;
    alturaMaximaInteriorEdificio?: number;
  };
  // 7. Archivos adjuntos
  archivos?: FormularioArchivo[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== FORMULARIO LOGÍSTICA ANALYSIS INTERFACE ====================
export interface FormularioLogisticaAnalisis {
  id: string;
  visitId: string;
  // 1. Datos del cliente
  razonSocial: string;
  personaContacto: string;
  email: string;
  direccion: string;
  localidad: string;
  provinciaEstado: string;
  pais: string;
  codigoPostal: string;
  website?: string | null;
  numeroIdentificacionFiscal: string;
  distribuidor?: string | null;
  contactoDistribuidor?: string | null;
  fechaCierre?: Date | null;
  // 2. Descripción operación
  notasOperacion: string;
  tieneRampas: boolean;
  notasRampas?: string | null;
  tienePasosPuertas: boolean;
  notasPasosPuertas?: string | null;
  tieneRestricciones: boolean;
  notasRestricciones?: string | null;
  alturaMaximaNave?: number | null;
  anchoPasilloActual?: number | null;
  superficieTrabajo?: number | null;
  condicionesSuelo?: string | null;
  tipoOperacion?: string | null;
  // 3. Datos aplicación
  descripcionProducto: string;
  alturaUltimoNivelEstanteria?: number | null;
  maximaAlturaElevacion?: number | null;
  pesoCargaMaximaAltura?: number | null;
  pesoCargaPrimerNivel?: number | null;
  dimensionesAreaTrabajoAncho?: number | null;
  dimensionesAreaTrabajoFondo?: number | null;
  turnosTrabajo?: number | null;
  fechaEstimadaDefinicion?: Date | null;
  alimentacionDeseada: string;
  // 4. Equipos eléctricos (JSON)
  equiposElectricos?: {
    noAplica?: boolean;
    tipoCorriente?: string;
    voltaje?: number;
    frecuencia?: number;
    amperaje?: number;
    temperaturaAmbiente?: number;
    horasTrabajoPorDia?: number;
  } | null;
  // 5. Dimensiones cargas (JSON array)
  dimensionesCargas: Array<{
    id: string;
    producto: string;
    largo?: number | null;
    fondo?: number | null;
    alto?: number | null;
    peso?: number | null;
    porcentaje?: number | null;
  }>;
  // 6. Pasillo actual (JSON)
  pasilloActual: {
    distanciaEntreEstanterias?: number | null;
    distanciaEntreProductos?: number | null;
    anchoPasilloDisponible?: number | null;
    tipoEstanterias?: string | null;
    nivelEstanterias?: number | null;
    alturaMaximaEstanteria?: number | null;
  };
  // 7. Archivos adjuntos
  archivos?: FormularioArchivo[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== FORMULARIO STRADDLE CARRIER ANALYSIS INTERFACE ====================
export interface FormularioStraddleCarrierAnalisis {
  id: string;
  visitId: string;
  // 1. Datos del cliente
  razonSocial: string;
  personaContacto: string;
  email: string;
  direccion: string;
  localidad: string;
  provinciaEstado: string;
  pais: string;
  codigoPostal: string;
  website?: string | null;
  numeroIdentificacionFiscal: string;
  distribuidor?: string | null;
  contactoDistribuidor?: string | null;
  fechaCierre?: Date | null;
  // 2. Cuadro 1 - Contenedores
  manejaContenedores: boolean;
  manejaContenedoresIndiv: boolean;
  dobleApilamiento: boolean;
  contenedoresTamanios?: {
    size20ft?: { selected: boolean; cantidad: number | null };
    size30ft?: { selected: boolean; cantidad: number | null };
    size40ft?: { selected: boolean; cantidad: number | null };
    size45ft?: { selected: boolean; cantidad: number | null };
    size53ft?: { selected: boolean; cantidad: number | null };
  } | null;
  pesoMaximoContenedor?: number | null;
  infoAdicionalContenedores?: string | null;
  // 3. Cuadro 2 - Carga especial
  manejaCargaEspecial: boolean;
  productoMasLargo?: number | null;
  productoMasCorto?: number | null;
  productoMasAncho?: number | null;
  productoMasEstrecho?: number | null;
  puntosElevacionLongitud?: number | null;
  puntosElevacionAncho?: number | null;
  pesoMaximoProductoLargo?: number | null;
  pesoMaximoProductoCorto?: number | null;
  productoMasAlto?: number | null;
  // 4. Otros
  zonasPasoAncho?: number | null;
  zonasPasoAlto?: number | null;
  condicionesPiso?: string | null;
  pisoPlano: boolean;
  restriccionesAltura?: number | null;
  restriccionesAnchura?: number | null;
  notasAdicionales?: string | null;
  // 5. Archivos adjuntos
  archivos?: FormularioArchivo[];
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
  customerId?: string; // Opcional: visita de cliente
  zohoTaskId?: string; // Opcional: visita de tarea
  formType: VisitFormType;
  status?: VisitStatus;
  visitDate?: Date;
  locale?: string; // Idioma para la generación de emails
  // Para visitas creadas por DEALER: vendedor al que se asigna
  assignedSellerId?: string;
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
  contenedorTipos: ContenedorTipo[];
  contenedoresPorSemana?: number;
  condicionesSuelo?: string;
  contenedorMedidas: ContenedorMedida[];
  contenedorMedidaOtro?: string;
  archivos?: ArchivoSubido[];
}

export interface CreateFormularioIndustrialData {
  razonSocial: string;
  personaContacto: string;
  email: string;
  direccion: string;
  localidad: string;
  provinciaEstado: string;
  pais: string;
  codigoPostal: string;
  website?: string;
  numeroIdentificacionFiscal: string;
  distribuidor?: string;
  contactoDistribuidor?: string;
  fechaCierre?: Date;
  notasOperacion: string;
  descripcionProducto: string;
  alturaUltimoNivelEstanteria?: number;
  maximaAlturaElevacion?: number;
  pesoCargaMaximaAltura?: number;
  pesoCargaPrimerNivel?: number;
  dimensionesAreaTrabajoAncho?: number;
  dimensionesAreaTrabajoFondo?: number;
  turnosTrabajo?: number;
  fechaEstimadaDefinicion?: Date;
  alimentacionDeseada: string;
  equiposElectricos?: any;
  dimensionesCargas: any;
  especificacionesPasillo: any;
  archivos?: ArchivoSubido[];
}

export interface CreateFormularioLogisticaData {
  razonSocial: string;
  personaContacto: string;
  email: string;
  direccion: string;
  localidad: string;
  provinciaEstado: string;
  pais: string;
  codigoPostal: string;
  website?: string;
  numeroIdentificacionFiscal: string;
  distribuidor?: string;
  contactoDistribuidor?: string;
  fechaCierre?: Date;
  notasOperacion: string;
  tieneRampas: boolean;
  notasRampas?: string;
  tienePasosPuertas: boolean;
  notasPasosPuertas?: string;
  tieneRestricciones: boolean;
  notasRestricciones?: string;
  alturaMaximaNave?: number;
  anchoPasilloActual?: number;
  superficieTrabajo?: number;
  condicionesSuelo?: string;
  tipoOperacion?: string;
  descripcionProducto: string;
  alturaUltimoNivelEstanteria?: number;
  maximaAlturaElevacion?: number;
  pesoCargaMaximaAltura?: number;
  pesoCargaPrimerNivel?: number;
  dimensionesAreaTrabajoAncho?: number;
  dimensionesAreaTrabajoFondo?: number;
  turnosTrabajo?: number;
  fechaEstimadaDefinicion?: Date;
  alimentacionDeseada: string;
  equiposElectricos?: any;
  dimensionesCargas: any;
  pasilloActual: any;
  archivos?: ArchivoSubido[];
}

export interface CreateFormularioStraddleCarrierData {
  razonSocial: string;
  personaContacto: string;
  email: string;
  direccion: string;
  localidad: string;
  provinciaEstado: string;
  pais: string;
  codigoPostal: string;
  website?: string;
  numeroIdentificacionFiscal: string;
  distribuidor?: string;
  contactoDistribuidor?: string;
  fechaCierre?: Date;
  // Cuadro 1 - Contenedores
  manejaContenedores: boolean;
  manejaContenedoresIndiv: boolean;
  dobleApilamiento: boolean;
  contenedoresTamanios?: any;
  pesoMaximoContenedor?: number;
  infoAdicionalContenedores?: string;
  // Cuadro 2 - Carga especial
  manejaCargaEspecial: boolean;
  productoMasLargo?: number;
  productoMasCorto?: number;
  productoMasAncho?: number;
  productoMasEstrecho?: number;
  puntosElevacionLongitud?: number;
  puntosElevacionAncho?: number;
  pesoMaximoProductoLargo?: number;
  pesoMaximoProductoCorto?: number;
  productoMasAlto?: number;
  // Otros
  zonasPasoAncho?: number;
  zonasPasoAlto?: number;
  condicionesPiso?: string;
  pisoPlano: boolean;
  restriccionesAltura?: number;
  restriccionesAnchura?: number;
  notasAdicionales?: string;
  archivos?: ArchivoSubido[];
}

export interface UpdateVisitData {
  status?: VisitStatus;
  visitDate?: Date;
  locale?: string; // Idioma para la generación de emails
}

export interface VisitDetailPageProps {
  params: Promise<{ id: string; visitId: string }>;
}

// ==================== FORM TYPE LABELS ====================
export const FORM_TYPE_LABELS: Record<VisitFormType, string> = {
  ANALISIS_CSS: "Análisis CSS",
  ANALISIS_INDUSTRIAL: "Análisis Industrial",
  ANALISIS_LOGISTICA: "Análisis Logística",
  ANALISIS_STRADDLE_CARRIER: "Análisis Straddle Carrier",
};

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  BORRADOR: "Borrador",
  EN_PROGRESO: "En Progreso",
  COMPLETADA: "Completada",
};

export const STATUS_CONFIG: Record<
  VisitStatus,
  {
    label: string;
    icon: React.ElementType;
    variant:
      | "default"
      | "secondary"
      | "success"
      | "warning"
      | "destructive"
      | "info";
    bgColor: string;
    textColor: string;
  }
> = {
  BORRADOR: {
    label: "Borrador",
    icon: Timer,
    variant: "warning",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  EN_PROGRESO: {
    label: "En Progreso",
    icon: Clock,
    variant: "info",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  COMPLETADA: {
    label: "Completada",
    icon: CheckCircle,
    variant: "success",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
};

export const VISIT_STATUS_ICONS: Record<VisitStatus, React.ElementType> = {
  BORRADOR: Timer,
  EN_PROGRESO: Clock,
  COMPLETADA: CheckCircle,
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
  CUARENTA_Y_CINCO_PIES: "45 pies",
  TODOS: "Todos los tamaños",
  OTRO: "Otro",
};

export interface FormularioCSSAnalisisProps {
  customer?: Customer; // Opcional: para visitas de cliente
  zohoTaskId?: string; // Opcional: para visitas de tarea
  onBack: () => void;
  onSuccess: () => void;
  existingVisit?: Visit;
}

export interface StepConfig {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  fields: (keyof FormularioCSSSchema)[];
}

export interface VisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer; // Opcional: para visitas de cliente
  zohoTaskId?: string; // Opcional: para visitas de tarea
  onSuccess: () => void;
  existingVisit?: Visit;
}

export const FORM_OPTIONS = [
  {
    type: VisitFormType.ANALISIS_CSS,
    icon: ClipboardList,
    description: "Análisis de Combi CSS para manejo de contenedores.",
    available: true,
  },
  {
    type: VisitFormType.ANALISIS_INDUSTRIAL,
    icon: Factory,
    description: "Análisis de soluciones industriales y logística interna.",
    available: true,
  },
  {
    type: VisitFormType.ANALISIS_LOGISTICA,
    icon: Forklift,
    description: "Análisis de operaciones logísticas y almacenamiento.",
    available: true,
  },
  {
    type: VisitFormType.ANALISIS_STRADDLE_CARRIER,
    icon: Ship,
    description: "Análisis de Straddle Carrier para terminales portuarias.",
    available: true,
  },
];

export const FORM_TYPE_ICONS: Record<VisitFormType, React.ElementType> = {
  ANALISIS_CSS: ClipboardList,
  ANALISIS_INDUSTRIAL: Factory,
  ANALISIS_LOGISTICA: Forklift,
  ANALISIS_STRADDLE_CARRIER: Ship,
};

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  rowSelection?: Record<string, boolean>;
  setRowSelection?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
  columnFilters?: ColumnFiltersState;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  onView?: (visit: Visit) => void;
  onEdit?: (visit: Visit) => void;
  onDelete?: (visit: Visit) => void;
  onCreateVisit?: () => void;
  customerName?: string;
  userRole?: Role | null;
  // Clone handlers
  onClone?: (visit: Visit) => void;
  onViewClone?: (visit: Visit) => void;
  onEditClone?: (visit: Visit) => void;
  onDeleteClone?: (visit: Visit) => void;
  onViewForm?: (visit: Visit) => void;
}

export interface ColumnsConfig {
  onView?: (visit: Visit) => void;
  onEdit?: (visit: Visit) => void;
  onDelete?: (visit: Visit) => void;
  onClone?: (visit: Visit) => void;
  onViewForm?: (visit: Visit) => void;
  // Phase 4: Handlers for unified clone UX
  onViewClone?: (visit: Visit) => void; // View the clone of this original visit
  onEditClone?: (visit: Visit) => void; // Edit the clone of this original visit
  onDeleteClone?: (visit: Visit) => void; // Delete the clone of this original visit
}
