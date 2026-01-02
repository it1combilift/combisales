import { ArchivoSubido } from "@/schemas/visits";
import { ContenedorMedida, ContenedorTipo } from "@prisma/client";

// ==================== FORM-SPECIFIC DATA TYPES ====================

/**
 * Dimension de carga para Industrial y Logistica
 */
export interface DimensionCargaEmail {
  producto: string;
  largo?: number | null;
  fondo?: number | null;
  alto?: number | null;
  peso?: number | null;
  porcentaje?: number | null;
}

/**
 * Datos especificos del formulario CSS
 */
export interface FormularioCSSEmailData {
  contenedorTipos?: ContenedorTipo[];
  contenedoresPorSemana?: number | null;
  contenedorMedidas?: ContenedorMedida[];
  contenedorMedidaOtro?: string;
  condicionesSuelo?: string;
  datosClienteUsuarioFinal?: string;
}

/**
 * Datos especificos del formulario Industrial
 */
export interface FormularioIndustrialEmailData {
  notasOperacion?: string;
  alturaUltimoNivelEstanteria?: number | null;
  maximaAlturaElevacion?: number | null;
  pesoCargaMaximaAltura?: number | null;
  pesoCargaPrimerNivel?: number | null;
  dimensionesAreaTrabajoAncho?: number | null;
  dimensionesAreaTrabajoFondo?: number | null;
  turnosTrabajo?: number | null;
  alimentacionDeseada?: string;
  dimensionesCargas?: DimensionCargaEmail[];
  // Especificaciones pasillo
  profundidadProducto?: number | null;
  anchoLibreEntreProductos?: number | null;
  distanciaLibreEntreEstanterias?: number | null;
  fondoUtilEstanteria?: number | null;
  alturaBaseEstanteria?: number | null;
  alturaSueloPrimerBrazo?: number | null;
  grosorPilarColumna?: number | null;
  alturaMaximaInteriorEdificio?: number | null;
  // Equipos electricos
  equiposElectricos?: {
    noAplica?: boolean;
    tipoCorriente?: string | null;
    voltaje?: number | null;
    frecuencia?: number | null;
    amperaje?: number | null;
    temperaturaAmbiente?: number | null;
    horasTrabajoPorDia?: number | null;
    notas?: string;
  };
}

/**
 * Datos especificos del formulario Logistica
 */
export interface FormularioLogisticaEmailData {
  notasOperacion?: string;
  tieneRampas?: boolean;
  notasRampas?: string;
  tienePasosPuertas?: boolean;
  notasPasosPuertas?: string;
  tieneRestricciones?: boolean;
  notasRestricciones?: string;
  alturaMaximaNave?: number | null;
  anchoPasilloActual?: number | null;
  superficieTrabajo?: number | null;
  condicionesSuelo?: string;
  tipoOperacion?: string;
  alturaUltimoNivelEstanteria?: number | null;
  maximaAlturaElevacion?: number | null;
  pesoCargaMaximaAltura?: number | null;
  pesoCargaPrimerNivel?: number | null;
  dimensionesAreaTrabajoAncho?: number | null;
  dimensionesAreaTrabajoFondo?: number | null;
  turnosTrabajo?: number | null;
  alimentacionDeseada?: string;
  dimensionesCargas?: DimensionCargaEmail[];
  // Pasillo actual
  pasilloActual?: {
    distanciaEntreEstanterias?: number | null;
    distanciaEntreProductos?: number | null;
    anchoPasilloDisponible?: number | null;
    tipoEstanterias?: string | null;
    nivelEstanterias?: number | null;
    alturaMaximaEstanteria?: number | null;
  };
  // Equipos electricos
  equiposElectricos?: {
    noAplica?: boolean;
    tipoCorriente?: string | null;
    voltaje?: number | null;
    frecuencia?: number | null;
    amperaje?: number | null;
    temperaturaAmbiente?: number | null;
    horasTrabajoPorDia?: number | null;
    notas?: string;
  };
}

/**
 * Datos especificos del formulario Straddle Carrier
 */
export interface FormularioStraddleCarrierEmailData {
  manejaContenedores?: boolean;
  manejaCargaEspecial?: boolean;
  // Contenedores
  manejaContenedoresIndiv?: boolean;
  dobleApilamiento?: boolean;
  contenedoresTamanios?: {
    size20ft?: { selected: boolean; cantidad?: number | null };
    size30ft?: { selected: boolean; cantidad?: number | null };
    size40ft?: { selected: boolean; cantidad?: number | null };
    size45ft?: { selected: boolean; cantidad?: number | null };
    size53ft?: { selected: boolean; cantidad?: number | null };
  };
  pesoMaximoContenedor?: number | null;
  infoAdicionalContenedores?: string;
  // Carga especial
  productoMasLargo?: number | null;
  productoMasCorto?: number | null;
  productoMasAncho?: number | null;
  productoMasEstrecho?: number | null;
  puntosElevacionLongitud?: number | null;
  puntosElevacionAncho?: number | null;
  pesoMaximoProductoLargo?: number | null;
  pesoMaximoProductoCorto?: number | null;
  productoMasAlto?: number | null;
  // Otros
  zonasPasoAncho?: number | null;
  zonasPasoAlto?: number | null;
  condicionesPiso?: string;
  pisoPlano?: boolean;
  restriccionesAltura?: number | null;
  restriccionesAnchura?: number | null;
  notasAdicionales?: string;
}

// ==================== MAIN EMAIL DATA INTERFACE ====================

export interface VisitEmailData {
  // Datos basicos del cliente
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

  // Descripcion comun
  descripcionProducto: string;

  // Metadatos de la visita
  formType: string;
  visitDate: Date;
  status: "BORRADOR" | "COMPLETADA" | "EN_PROGRESO";

  // Archivos
  archivos?: ArchivoSubido[];

  // Vendedor
  vendedor?: {
    name: string;
    email: string;
  };

  locale?: string;

  // Datos especificos por tipo de formulario (solo uno estara presente)
  formularioCSS?: FormularioCSSEmailData;
  formularioIndustrial?: FormularioIndustrialEmailData;
  formularioLogistica?: FormularioLogisticaEmailData;
  formularioStraddleCarrier?: FormularioStraddleCarrierEmailData;
}

export interface SendVisitNotificationParams {
  visitData: VisitEmailData;
  to?: string | string[];
}

export interface VisitNotificationResult extends SendEmailResult {
  sentTo: string[];
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}
