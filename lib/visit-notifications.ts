import { sendEmail } from "@/lib/resend";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { EMAIL_CONFIG, NOTIFICATION_CONFIG } from "@/constants/constants";

import {
  SendVisitNotificationParams,
  VisitNotificationResult,
  VisitEmailData,
  FormularioCSSEmailData,
  FormularioIndustrialEmailData,
  FormularioLogisticaEmailData,
  FormularioStraddleCarrierEmailData,
} from "@/interfaces/email";

import {
  generateVisitCompletedEmailHTML,
  generateVisitCompletedEmailText,
} from "@/lib/email-templates";

import {
  CreateFormularioCSSData,
  CreateFormularioIndustrialData,
  CreateFormularioLogisticaData,
  CreateFormularioStraddleCarrierData,
} from "@/interfaces/visits";

import es from "@/locales/es.json";
import en from "@/locales/en.json";

type Locale = "es" | "en";
const translations = { es, en };

function t(key: string, locale: string = "es"): string {
  const lang = (locale === "en" ? "en" : "es") as Locale;
  const keys = key.split(".");
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key; // Fallback to key if not found
    }
  }

  return typeof value === "string" ? value : key;
}

/**
 * Extract CSS form-specific data for email
 */
function extractCSSFormData(
  data: CreateFormularioCSSData,
): FormularioCSSEmailData {
  return {
    contenedorTipos: data.contenedorTipos,
    contenedoresPorSemana: data.contenedoresPorSemana,
    contenedorMedidas: data.contenedorMedidas,
    contenedorMedidaOtro: data.contenedorMedidaOtro,
    condicionesSuelo: data.condicionesSuelo,
    datosClienteUsuarioFinal: data.datosClienteUsuarioFinal,
  };
}

/**
 * Extract Industrial form-specific data for email
 */
function extractIndustrialFormData(
  data: CreateFormularioIndustrialData,
): FormularioIndustrialEmailData {
  return {
    notasOperacion: data.notasOperacion,
    alturaUltimoNivelEstanteria: data.alturaUltimoNivelEstanteria,
    maximaAlturaElevacion: data.maximaAlturaElevacion,
    pesoCargaMaximaAltura: data.pesoCargaMaximaAltura,
    pesoCargaPrimerNivel: data.pesoCargaPrimerNivel,
    dimensionesAreaTrabajoAncho: data.dimensionesAreaTrabajoAncho,
    dimensionesAreaTrabajoFondo: data.dimensionesAreaTrabajoFondo,
    turnosTrabajo: data.turnosTrabajo,
    alimentacionDeseada: data.alimentacionDeseada,
    dimensionesCargas: data.dimensionesCargas?.map((c: any) => ({
      producto: c.producto,
      largo: c.largo,
      fondo: c.fondo,
      alto: c.alto,
      peso: c.peso,
      porcentaje: c.porcentaje,
    })),
    profundidadProducto: data.especificacionesPasillo?.profundidadProducto,
    anchoLibreEntreProductos:
      data.especificacionesPasillo?.anchoLibreEntreProductos,
    distanciaLibreEntreEstanterias:
      data.especificacionesPasillo?.distanciaLibreEntreEstanterias,
    fondoUtilEstanteria: data.especificacionesPasillo?.fondoUtilEstanteria,
    alturaBaseEstanteria: data.especificacionesPasillo?.alturaBaseEstanteria,
    alturaSueloPrimerBrazo:
      data.especificacionesPasillo?.alturaSueloPrimerBrazo,
    grosorPilarColumna: data.especificacionesPasillo?.grosorPilarColumna,
    alturaMaximaInteriorEdificio:
      data.especificacionesPasillo?.alturaMaximaInteriorEdificio,
    equiposElectricos: data.equiposElectricos
      ? {
          noAplica: data.equiposElectricos.noAplica,
          tipoCorriente: data.equiposElectricos.tipoCorriente,
          voltaje: data.equiposElectricos.voltaje,
          frecuencia: data.equiposElectricos.frecuencia,
          amperaje: data.equiposElectricos.amperaje,
          temperaturaAmbiente: data.equiposElectricos.temperaturaAmbiente,
          horasTrabajoPorDia: data.equiposElectricos.horasTrabajoPorDia,
          notas: data.equiposElectricos.notas,
        }
      : undefined,
  };
}

/**
 * Extract Logistica form-specific data for email
 */
function extractLogisticaFormData(
  data: CreateFormularioLogisticaData,
): FormularioLogisticaEmailData {
  return {
    notasOperacion: data.notasOperacion,
    tieneRampas: data.tieneRampas,
    notasRampas: data.notasRampas,
    tienePasosPuertas: data.tienePasosPuertas,
    notasPasosPuertas: data.notasPasosPuertas,
    tieneRestricciones: data.tieneRestricciones,
    notasRestricciones: data.notasRestricciones,
    alturaMaximaNave: data.alturaMaximaNave,
    anchoPasilloActual: data.anchoPasilloActual,
    superficieTrabajo: data.superficieTrabajo,
    condicionesSuelo: data.condicionesSuelo,
    tipoOperacion: data.tipoOperacion,
    alturaUltimoNivelEstanteria: data.alturaUltimoNivelEstanteria,
    maximaAlturaElevacion: data.maximaAlturaElevacion,
    pesoCargaMaximaAltura: data.pesoCargaMaximaAltura,
    pesoCargaPrimerNivel: data.pesoCargaPrimerNivel,
    dimensionesAreaTrabajoAncho: data.dimensionesAreaTrabajoAncho,
    dimensionesAreaTrabajoFondo: data.dimensionesAreaTrabajoFondo,
    turnosTrabajo: data.turnosTrabajo,
    alimentacionDeseada: data.alimentacionDeseada,
    dimensionesCargas: data.dimensionesCargas?.map((c: any) => ({
      producto: c.producto,
      largo: c.largo,
      fondo: c.fondo,
      alto: c.alto,
      peso: c.peso,
      porcentaje: c.porcentaje,
    })),
    pasilloActual: data.pasilloActual
      ? {
          distanciaEntreEstanterias:
            data.pasilloActual.distanciaEntreEstanterias,
          distanciaEntreProductos: data.pasilloActual.distanciaEntreProductos,
          anchoPasilloDisponible: data.pasilloActual.anchoPasilloDisponible,
          tipoEstanterias: data.pasilloActual.tipoEstanterias,
          nivelEstanterias: data.pasilloActual.nivelEstanterias,
          alturaMaximaEstanteria: data.pasilloActual.alturaMaximaEstanteria,
        }
      : undefined,
    equiposElectricos: data.equiposElectricos
      ? {
          noAplica: data.equiposElectricos.noAplica,
          tipoCorriente: data.equiposElectricos.tipoCorriente,
          voltaje: data.equiposElectricos.voltaje,
          frecuencia: data.equiposElectricos.frecuencia,
          amperaje: data.equiposElectricos.amperaje,
          temperaturaAmbiente: data.equiposElectricos.temperaturaAmbiente,
          horasTrabajoPorDia: data.equiposElectricos.horasTrabajoPorDia,
          notas: data.equiposElectricos.notas,
        }
      : undefined,
  };
}

/**
 * Extract Straddle Carrier form-specific data for email
 */
function extractStraddleCarrierFormData(
  data: CreateFormularioStraddleCarrierData,
): FormularioStraddleCarrierEmailData {
  return {
    manejaContenedores: data.manejaContenedores,
    manejaCargaEspecial: data.manejaCargaEspecial,
    manejaContenedoresIndiv: data.manejaContenedoresIndiv,
    dobleApilamiento: data.dobleApilamiento,
    contenedoresTamanios: data.contenedoresTamanios,
    pesoMaximoContenedor: data.pesoMaximoContenedor,
    infoAdicionalContenedores: data.infoAdicionalContenedores,
    productoMasLargo: data.productoMasLargo,
    productoMasCorto: data.productoMasCorto,
    productoMasAncho: data.productoMasAncho,
    productoMasEstrecho: data.productoMasEstrecho,
    puntosElevacionLongitud: data.puntosElevacionLongitud,
    puntosElevacionAncho: data.puntosElevacionAncho,
    pesoMaximoProductoLargo: data.pesoMaximoProductoLargo,
    pesoMaximoProductoCorto: data.pesoMaximoProductoCorto,
    productoMasAlto: data.productoMasAlto,
    zonasPasoAncho: data.zonasPasoAncho,
    zonasPasoAlto: data.zonasPasoAlto,
    condicionesPiso: data.condicionesPiso,
    pisoPlano: data.pisoPlano,
    restriccionesAltura: data.restriccionesAltura,
    restriccionesAnchura: data.restriccionesAnchura,
    notasAdicionales: data.notasAdicionales,
  };
}

// ==================== SAFE STRING HELPER ====================
/**
 * Returns a safe string value, avoiding null/undefined display
 */
function safeString(
  value: string | null | undefined,
  fallback: string = "",
): string {
  if (value === null || value === undefined || value.trim() === "") {
    return fallback;
  }
  return value;
}

// ==================== EXTENDED BUILD PARAMS ====================
export interface BuildVisitEmailDataParams {
  formType: VisitFormType | string;
  formularioData:
    | CreateFormularioCSSData
    | CreateFormularioIndustrialData
    | CreateFormularioLogisticaData
    | CreateFormularioStraddleCarrierData;
  visitDate: Date;
  status: VisitStatus | string;
  locale?: string;
  // Visit identification
  visitId?: string;
  // User who owns the visit (creator)
  owner?: { name: string | null; email: string; role?: string };
  // Seller/P.Manager info
  vendedor?: { name: string | null; email: string };
  // Dealer info (when creator is DEALER)
  dealer?: { name: string | null; email: string };
  // Assigned seller (for visits created by DEALER)
  assignedSeller?: { name: string | null; email: string } | null;
  // Customer name fallback
  customerName?: string;
  // Clone information
  isClone?: boolean;
  originalVisitId?: string;
  originalDealerName?: string;
  // Original visit's files (for cloned visits)
  originalArchivos?: any[];
  // Role of user submitting the form
  submitterRole?: "ADMIN" | "DEALER" | "SELLER";
}

/**
 * Build complete email data with form-specific fields
 * Enhanced version supporting dealer/seller roles and cloned visits
 */
export function buildVisitEmailData(
  formType: VisitFormType | string,
  formularioData:
    | CreateFormularioCSSData
    | CreateFormularioIndustrialData
    | CreateFormularioLogisticaData
    | CreateFormularioStraddleCarrierData,
  visitDate: Date,
  status: VisitStatus | string,
  vendedor?: { name: string; email: string },
  customerName?: string,
  locale: string = "es",
): VisitEmailData {
  // Use the extended builder internally
  return buildVisitEmailDataExtended({
    formType,
    formularioData,
    visitDate,
    status,
    vendedor: vendedor
      ? { name: vendedor.name, email: vendedor.email }
      : undefined,
    customerName,
    locale,
  });
}

/**
 * Extended version of buildVisitEmailData with full support for:
 * - Dealer/Seller role-based information
 * - Cloned visit handling
 * - File consolidation from original + clone
 * - Safe null handling
 */
export function buildVisitEmailDataExtended(
  params: BuildVisitEmailDataParams,
): VisitEmailData {
  const {
    formType,
    formularioData,
    visitDate,
    status,
    locale = "es",
    visitId,
    owner,
    vendedor,
    dealer,
    assignedSeller,
    customerName,
    isClone = false,
    originalVisitId,
    originalDealerName,
    originalArchivos = [],
    submitterRole,
  } = params;

  const baseData = formularioData as CreateFormularioCSSData;

  // ==================== CONSOLIDATE FILES ====================
  // For cloned visits: combine original files + clone's new files
  const currentArchivos = baseData.archivos || [];
  let allArchivos = [...currentArchivos];

  if (isClone && originalArchivos.length > 0) {
    // Add original files that aren't already in the clone
    const currentIds = new Set(currentArchivos.map((a: any) => a.cloudinaryId));
    const originalFilesToAdd = originalArchivos.filter(
      (a: any) => !currentIds.has(a.cloudinaryId),
    );
    allArchivos = [...originalFilesToAdd, ...currentArchivos];
  }

  // ==================== SAFE VALUE EXTRACTION ====================
  const razonSocialRaw = baseData.razonSocial || customerName;
  const razonSocial = safeString(
    razonSocialRaw,
    t("email.common.notSpecified", locale),
  );

  // ==================== BUILD EMAIL DATA ====================
  const emailData: VisitEmailData = {
    visitId: visitId,
    razonSocial: razonSocial,
    personaContacto: safeString(baseData.personaContacto),
    email: safeString(baseData.email),
    direccion: safeString(baseData.direccion),
    localidad: safeString(baseData.localidad),
    provinciaEstado: safeString(baseData.provinciaEstado),
    pais: safeString(baseData.pais),
    codigoPostal: baseData.codigoPostal || undefined,
    website: baseData.website || undefined,
    numeroIdentificacionFiscal:
      baseData.numeroIdentificacionFiscal || undefined,
    distribuidor: baseData.distribuidor || undefined,
    contactoDistribuidor: baseData.contactoDistribuidor || undefined,
    descripcionProducto: safeString(baseData.descripcionProducto),
    formType: formType,
    visitDate: visitDate,
    status: status as "BORRADOR" | "COMPLETADA" | "EN_PROGRESO",
    archivos: allArchivos,
    locale,
    // Role-based info
    owner: owner
      ? {
          name: safeString(owner.name, t("email.common.notSpecified", locale)),
          email: owner.email,
          role: owner.role,
        }
      : undefined,
    vendedor: vendedor
      ? {
          name: safeString(
            vendedor.name,
            t("email.common.notSpecified", locale),
          ),
          email: vendedor.email,
        }
      : assignedSeller
        ? {
            name: safeString(
              assignedSeller.name,
              t("email.common.notSpecified", locale),
            ),
            email: assignedSeller.email,
          }
        : undefined,
    dealer: dealer
      ? {
          name: safeString(dealer.name, t("email.common.notSpecified", locale)),
          email: dealer.email,
        }
      : undefined,
    // Clone info
    isClone: isClone,
    originalVisitId: originalVisitId,
    originalDealerName: originalDealerName
      ? safeString(originalDealerName)
      : undefined,
    submitterRole: submitterRole,
  };

  // Add form-specific data based on form type
  switch (formType) {
    case VisitFormType.ANALISIS_CSS:
    case "ANALISIS_CSS":
      emailData.formularioCSS = extractCSSFormData(
        formularioData as CreateFormularioCSSData,
      );
      break;
    case VisitFormType.ANALISIS_INDUSTRIAL:
    case "ANALISIS_INDUSTRIAL":
      emailData.formularioIndustrial = extractIndustrialFormData(
        formularioData as CreateFormularioIndustrialData,
      );
      break;
    case VisitFormType.ANALISIS_LOGISTICA:
    case "ANALISIS_LOGISTICA":
      emailData.formularioLogistica = extractLogisticaFormData(
        formularioData as CreateFormularioLogisticaData,
      );
      break;
    case VisitFormType.ANALISIS_STRADDLE_CARRIER:
    case "ANALISIS_STRADDLE_CARRIER":
      emailData.formularioStraddleCarrier = extractStraddleCarrierFormData(
        formularioData as CreateFormularioStraddleCarrierData,
      );
      break;
  }

  return emailData;
}

/**
 * Get email recipients based on visit status
 * - BORRADOR: Only draft recipients
 * - COMPLETADA: All completed recipients
 */
export function getEmailRecipients(status: string): string[] {
  if (status === VisitStatus.COMPLETADA) {
    return EMAIL_CONFIG.completedRecipients as unknown as string[];
  }
  return EMAIL_CONFIG.draftRecipients as unknown as string[];
}

/**
 * Generate email subject based on visit data and status
 * Now with safe null handling and clone awareness
 */
function generateEmailSubject(
  data: VisitEmailData,
  locale: string = "es",
): string {
  const status = data.status as string;
  const formType = data.formType;
  const archivosCount = data.archivos?.length || 0;

  // Status prefix - only show for draft/in-progress (completed doesn't need prefix)
  let statusPrefix = "";
  if (status === VisitStatus.BORRADOR || status === "BORRADOR") {
    statusPrefix = `[${t("email.status.draft", locale)}] `;
  } else if (status === VisitStatus.EN_PROGRESO || status === "EN_PROGRESO") {
    statusPrefix = `[${t("email.status.inProgress", locale)}] `;
  }

  // Clone indicator
  const clonePrefix = data.isClone ? `[${t("email.clone", locale)}] ` : "";

  // Map form type to translated name
  const formTypeKeys: Record<string, string> = {
    ANALISIS_CSS: "visits.formTypes.css",
    ANALISIS_INDUSTRIAL: "visits.formTypes.industrial",
    ANALISIS_LOGISTICA: "visits.formTypes.logistica",
    ANALISIS_STRADDLE_CARRIER: "visits.formTypes.straddleCarrier",
  };
  const formTypeName = t(
    formTypeKeys[formType] || "email.subject.visit",
    locale,
  );

  // Build identifier: razonSocial > dealer > visitId > fallback
  let identifier = "";
  if (
    data.razonSocial &&
    data.razonSocial.trim() !== "" &&
    data.razonSocial !== t("email.common.notSpecified", locale)
  ) {
    identifier = data.razonSocial;
  } else if (data.dealer?.name && data.dealer.name.trim() !== "") {
    identifier = `${t("email.byDealer", locale)}: ${data.dealer.name}`;
  } else if (data.visitId) {
    identifier = `#${data.visitId.substring(0, 8)}`;
  } else {
    identifier = t("email.subject.newVisit", locale);
  }

  // Files count
  const archivosText =
    archivosCount > 0
      ? ` (${archivosCount} ${
          archivosCount > 1
            ? t("email.subject.files", locale)
            : t("email.subject.file", locale)
        })`
      : "";

  return `${statusPrefix}${clonePrefix}${t(
    "email.subject.visit",
    locale,
  )}: ${identifier} - ${formTypeName}${archivosText}`;
}

/**
 * Enviar notificacion de visita
 * Envia siempre, tanto para BORRADOR como COMPLETADA
 * Los destinatarios varian segun el estado
 */
export async function sendVisitNotification({
  visitData,
  to,
}: SendVisitNotificationParams): Promise<VisitNotificationResult> {
  const recipients = to
    ? Array.isArray(to)
      ? to
      : [to]
    : getEmailRecipients(visitData.status);

  const locale = visitData.locale || "es";

  const subject = generateEmailSubject(visitData, locale);

  try {
    const result = await sendEmail({
      to: recipients,
      subject,
      html: generateVisitCompletedEmailHTML(visitData),
      text: generateVisitCompletedEmailText(visitData),
      replyTo: visitData.email || undefined,
    });

    if (result.success) {
      console.log(
        `[Email] Notificacion enviada exitosamente a ${recipients.join(", ")}`,
      );
    }

    return {
      ...result,
      sentTo: recipients,
    };
  } catch (error) {
    console.error("[Email] Error enviando notificacion de visita:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      sentTo: [],
    };
  }
}

/**
 * Legacy function name for backwards compatibility
 * @deprecated Use sendVisitNotification instead
 */
export const sendVisitCompletedNotification = sendVisitNotification;

/**
 * Determinar si se debe enviar notificacion de visita
 * Solo envía notificaciones cuando la visita está COMPLETADA
 * Los borradores (BORRADOR) y en progreso (EN_PROGRESO) no envían emails
 */
export function shouldSendVisitNotification(status: string): boolean {
  // Only send email notifications when visit is submitted (COMPLETADA)
  // Draft saves and in-progress status do not trigger emails
  return (
    status === VisitStatus.COMPLETADA &&
    NOTIFICATION_CONFIG.visitCompleted.enabled
  );
}
