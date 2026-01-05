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
  data: CreateFormularioCSSData
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
  data: CreateFormularioIndustrialData
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
  data: CreateFormularioLogisticaData
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
  data: CreateFormularioStraddleCarrierData
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

/**
 * Build complete email data with form-specific fields
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
  locale: string = "es"
): VisitEmailData {
  const baseData = formularioData as CreateFormularioCSSData;

  const emailData: VisitEmailData = {
    razonSocial: baseData.razonSocial || customerName || "",
    personaContacto: baseData.personaContacto || "",
    email: baseData.email || "",
    direccion: baseData.direccion || "",
    localidad: baseData.localidad || "",
    provinciaEstado: baseData.provinciaEstado || "",
    pais: baseData.pais || "",
    codigoPostal: baseData.codigoPostal,
    website: baseData.website,
    numeroIdentificacionFiscal: baseData.numeroIdentificacionFiscal,
    distribuidor: baseData.distribuidor,
    contactoDistribuidor: baseData.contactoDistribuidor,
    descripcionProducto: baseData.descripcionProducto || "",
    formType: formType,
    visitDate: visitDate,
    status: status as "BORRADOR" | "COMPLETADA" | "EN_PROGRESO",
    archivos: baseData.archivos || [],
    vendedor,
    locale,
  };

  // Add form-specific data based on form type
  switch (formType) {
    case VisitFormType.ANALISIS_CSS:
    case "ANALISIS_CSS":
      emailData.formularioCSS = extractCSSFormData(
        formularioData as CreateFormularioCSSData
      );
      break;
    case VisitFormType.ANALISIS_INDUSTRIAL:
    case "ANALISIS_INDUSTRIAL":
      emailData.formularioIndustrial = extractIndustrialFormData(
        formularioData as CreateFormularioIndustrialData
      );
      break;
    case VisitFormType.ANALISIS_LOGISTICA:
    case "ANALISIS_LOGISTICA":
      emailData.formularioLogistica = extractLogisticaFormData(
        formularioData as CreateFormularioLogisticaData
      );
      break;
    case VisitFormType.ANALISIS_STRADDLE_CARRIER:
    case "ANALISIS_STRADDLE_CARRIER":
      emailData.formularioStraddleCarrier = extractStraddleCarrierFormData(
        formularioData as CreateFormularioStraddleCarrierData
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
 */
function generateEmailSubject(
  razonSocial: string,
  formType: string,
  status: string,
  archivosCount: number,
  locale: string = "es"
): string {
  const statusPrefix =
    status === VisitStatus.BORRADOR
      ? `[${t("email.status.draft", locale)}] `
      : "";

  // Map form type to translated name
  const formTypeKeys: Record<string, string> = {
    ANALISIS_CSS: "visits.formTypes.css",
    ANALISIS_INDUSTRIAL: "visits.formTypes.industrial",
    ANALISIS_LOGISTICA: "visits.formTypes.logistica",
    ANALISIS_STRADDLE_CARRIER: "visits.formTypes.straddleCarrier",
  };
  const formTypeName = t(
    formTypeKeys[formType] || "email.subject.visit",
    locale
  );

  const archivosText =
    archivosCount > 0
      ? ` (${archivosCount} ${
          archivosCount > 1
            ? t("email.subject.files", locale)
            : t("email.subject.file", locale)
        })`
      : "";

  return `${statusPrefix}${t(
    "email.subject.visit",
    locale
  )}: ${razonSocial} - ${formTypeName}${archivosText}`;
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

  const archivosCount = visitData.archivos?.length || 0;
  const locale = visitData.locale || "es";

  const subject = generateEmailSubject(
    visitData.razonSocial,
    visitData.formType,
    visitData.status,
    archivosCount,
    locale
  );

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
        `[Email] Notificacion enviada exitosamente a ${recipients.join(", ")}`
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
 * Ahora siempre envia si las notificaciones estan habilitadas
 */
export function shouldSendVisitNotification(status: string): boolean {
  const validStatuses = [VisitStatus.BORRADOR, VisitStatus.COMPLETADA];
  return (
    validStatuses.includes(status as VisitStatus) &&
    NOTIFICATION_CONFIG.visitCompleted.enabled
  );
}
