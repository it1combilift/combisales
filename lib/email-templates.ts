import { formatDateShort } from "@/lib/utils";
import { EMAIL_CONFIG } from "@/constants/constants";
import { Role, TipoAlimentacion, VisitStatus } from "@prisma/client";
import { formatFileSize } from "@/components/formulario-css-analisis/utils/file-utils";

import {
  VisitEmailData,
  DimensionCargaEmail,
  FormularioCSSEmailData,
  FormularioIndustrialEmailData,
  FormularioLogisticaEmailData,
  FormularioStraddleCarrierEmailData,
} from "@/interfaces/email";

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
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}

// ==================== DESIGN SYSTEM ====================
const DESIGN = {
  // Brand Colors
  colors: {
    primary: "#679436",
    primaryLight: "#A5D6A7",
    primaryDark: "#4e7c14",
    accent: "#4CAF50",

    // Neutrals
    white: "#FFFFFF",
    gray50: "#FAFAFA",
    gray100: "#F5F5F5",
    gray200: "#EEEEEE",
    gray300: "#E0E0E0",
    gray400: "#BDBDBD",
    gray500: "#9E9E9E",
    gray600: "#757575",
    gray700: "#616161",
    gray800: "#424242",
    gray900: "#212121",
    black: "#121212",

    // Status
    successBg: "#E8F5E9",
    successText: "#1B5E20",
    successBorder: "#4CAF50",
    warningBg: "#FFF8E1",
    warningText: "#E65100",
    warningBorder: "#FF9800",
    infoBg: "#DBEAFE",
    infoText: "#1E40AF",
    infoBorder: "#93C5FD",

    // File Types
    image: "#1976D2",
    pdf: "#C62828",
    video: "#6A1B9A",
    document: "#1565C0",
    excel: "#2E7D32",
    file: "#757575",
  },

  // Typography
  fonts: {
    family:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif",
    sizes: {
      xs: "11px",
      sm: "12px",
      base: "14px",
      md: "15px",
      lg: "16px",
      xl: "18px",
      xxl: "24px",
    },
    weights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Spacing
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "24px",
    xxxl: "32px",
  },

  // Border Radius
  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
  },
} as const;

// ==================== HELPER FUNCTIONS ====================

function getStatusConfig(status: string, locale: string = "es") {
  switch (status) {
    case VisitStatus.COMPLETADA:
      return {
        label: t("email.status.completed", locale),
        bgColor: DESIGN.colors.successBg,
        textColor: DESIGN.colors.successText,
        borderColor: DESIGN.colors.successBorder,
        icon: "✓",
      };
    case VisitStatus.EN_PROGRESO:
      return {
        label: t("email.status.inProgress", locale),
        bgColor: DESIGN.colors.infoBg,
        textColor: DESIGN.colors.infoText,
        borderColor: DESIGN.colors.infoBorder,
        icon: "◐",
      };
    case VisitStatus.BORRADOR:
      return {
        label: t("email.status.draft", locale),
        bgColor: DESIGN.colors.warningBg,
        textColor: DESIGN.colors.warningText,
        borderColor: DESIGN.colors.warningBorder,
        icon: "○",
      };
    default:
      return {
        label: t("email.status.draft", locale),
        bgColor: DESIGN.colors.warningBg,
        textColor: DESIGN.colors.warningText,
        borderColor: DESIGN.colors.warningBorder,
        icon: "○",
      };
  }
}

function getFileTypeLabel(tipoArchivo: string, locale: string = "es") {
  const type = tipoArchivo.toLowerCase();
  if (
    type.includes("image") ||
    type.includes("jpg") ||
    type.includes("png") ||
    type.includes("jpeg") ||
    type.includes("gif") ||
    type.includes("webp") ||
    type === "imagen"
  ) {
    return {
      label: t("email.files.fileTypes.image", locale),
      color: DESIGN.colors.image,
    };
  }
  if (type.includes("pdf")) {
    return {
      label: t("email.files.fileTypes.pdf", locale),
      color: DESIGN.colors.pdf,
    };
  }
  if (
    type.includes("video") ||
    type.includes("mp4") ||
    type.includes("mov") ||
    type.includes("avi")
  ) {
    return {
      label: t("email.files.fileTypes.video", locale),
      color: DESIGN.colors.video,
    };
  }
  if (
    type.includes("doc") ||
    type.includes("word") ||
    type.includes("documento")
  ) {
    return {
      label: t("email.files.fileTypes.document", locale),
      color: DESIGN.colors.document,
    };
  }
  if (
    type.includes("xls") ||
    type.includes("excel") ||
    type.includes("spreadsheet")
  ) {
    return {
      label: t("email.files.fileTypes.excel", locale),
      color: DESIGN.colors.excel,
    };
  }
  return {
    label: t("email.files.fileTypes.file", locale),
    color: DESIGN.colors.file,
  };
}

function formatNumber(
  value: number | null | undefined,
  unit?: string,
  locale: string = "es",
): string {
  if (value === null || value === undefined) return "-";
  const formatted = value.toLocaleString(locale === "en" ? "en-US" : "es-ES");
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatBoolean(
  value: boolean | undefined,
  locale: string = "es",
): string {
  return value ? t("email.common.yes", locale) : t("email.common.no", locale);
}

function getFormTypeName(formType: string, locale: string = "es"): string {
  const formTypeKeys: Record<string, string> = {
    ANALISIS_CSS: "visits.formTypes.css",
    ANALISIS_INDUSTRIAL: "visits.formTypes.industrial",
    ANALISIS_LOGISTICA: "visits.formTypes.logistica",
    ANALISIS_STRADDLE_CARRIER: "visits.formTypes.straddleCarrier",
  };
  return t(formTypeKeys[formType] || "email.subject.visit", locale);
}

// ==================== BUILDING BLOCKS ====================

function buildSectionHeader(title: string): string {
  return `<tr>
    <td colspan="2" style="padding: 14px 20px; background-color: ${DESIGN.colors.primary}; border-radius: 8px 8px 0 0;">
      <span style="font-family: ${DESIGN.fonts.family}; font-size: 13px; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.white}; text-transform: uppercase; letter-spacing: 1.2px;">${title}</span>
    </td>
  </tr>`;
}

function buildSubsectionHeader(title: string): string {
  return `<tr>
    <td colspan="2" style="padding: 12px 20px; background-color: ${DESIGN.colors.gray100}; border-bottom: 1px solid ${DESIGN.colors.gray300};">
      <span style="font-family: ${DESIGN.fonts.family}; font-size: 11px; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.primary}; text-transform: uppercase; letter-spacing: 0.8px;">${title}</span>
    </td>
  </tr>`;
}

function buildRow(
  label: string,
  value: string | null | undefined,
  options?: { highlight?: boolean; fullWidth?: boolean },
): string {
  if (!value || value === "-" || value.trim() === "") return "";

  const valueColor = options?.highlight
    ? DESIGN.colors.primary
    : DESIGN.colors.gray900;
  const valueWeight = options?.highlight
    ? DESIGN.fonts.weights.normal
    : DESIGN.fonts.weights.normal;

  if (options?.fullWidth) {
    return `<tr>
      <td colspan="2" style="padding: 12px 20px; border-bottom: 1px solid ${DESIGN.colors.gray200}; background-color: ${DESIGN.colors.white};">
        <div style="font-family: ${DESIGN.fonts.family}; font-size: 11px; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.gray600}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">${label}</div>
        <div style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.base}; color: ${valueColor}; font-weight: ${valueWeight}; line-height: 1.6;">${value}</div>
      </td>
    </tr>`;
  }

  return `<tr>
    <td style="padding: 12px 20px; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.gray600}; width: 38%; vertical-align: top; border-bottom: 1px solid ${DESIGN.colors.gray200}; background-color: ${DESIGN.colors.gray50};">${label}</td>
    <td style="padding: 12px 20px; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.base}; color: ${valueColor}; font-weight: ${valueWeight}; border-bottom: 1px solid ${DESIGN.colors.gray200}; background-color: ${DESIGN.colors.white};">${value}</td>
  </tr>`;
}

function buildNotesBlock(label: string, content: string): string {
  if (!content) return "";
  return `<tr>
    <td colspan="2" style="padding: 16px 20px; background-color: ${DESIGN.colors.gray50}; border-bottom: 1px solid ${DESIGN.colors.gray200};">
      <div style="font-family: ${DESIGN.fonts.family}; font-size: 11px; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.gray700}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">${label}</div>
      <div style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.base}; color: ${DESIGN.colors.gray900}; line-height: 1.7; white-space: pre-wrap; background-color: ${DESIGN.colors.white}; padding: 14px 16px; border-radius: 6px; border-left: 4px solid ${DESIGN.colors.primary};">${content}</div>
    </td>
  </tr>`;
}

function startSection(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; margin-bottom: 20px; border: 1px solid ${DESIGN.colors.gray300}; border-radius: 8px; border-collapse: separate;">`;
}

function endSection(): string {
  return `</table>`;
}

// ==================== CUSTOMER INFO SECTION ====================

function buildCustomerInfoSection(
  data: VisitEmailData,
  locale: string = "es",
): string {
  let html = "";

  const hasCustomerData =
    data.razonSocial ||
    data.personaContacto ||
    data.email ||
    data.direccion ||
    data.localidad ||
    data.pais;

  if (!hasCustomerData) return "";

  html += startSection();
  html += buildSectionHeader(t("email.sections.customerInfo", locale));

  html += buildRow(
    t("email.customer.company", locale),
    data.razonSocial || null,
    { highlight: true },
  );
  html += buildRow(
    t("email.customer.contact", locale),
    data.personaContacto || null,
  );

  if (data.email) {
    html += buildRow(
      t("email.customer.email", locale),
      `<a href="mailto:${data.email}" style="color: ${DESIGN.colors.primary}; text-decoration: none; font-weight: ${DESIGN.fonts.weights.normal};">${data.email}</a>`,
    );
  }

  const addressParts = [data.direccion].filter(Boolean);
  const address = addressParts.join("");
  if (address) {
    html += buildRow(t("email.customer.address", locale), address);
  }

  const locationParts = [
    data.localidad,
    data.provinciaEstado,
    data.codigoPostal,
  ].filter(Boolean);
  const location = locationParts.join(", ");
  if (location) {
    html += buildRow(t("email.customer.city", locale), location);
  }

  html += buildRow(t("email.customer.country", locale), data.pais || null);

  if (data.website) {
    html += buildRow(
      t("email.customer.website", locale),
      `<a href="${data.website.startsWith("http") ? data.website : `https://${data.website}`}" target="_blank" style="color: ${DESIGN.colors.primary}; text-decoration: none;">${data.website}</a>`,
    );
  }

  html += buildRow(
    t("email.customer.taxId", locale),
    data.numeroIdentificacionFiscal || null,
  );

  if (data.distribuidor) {
    html += buildSubsectionHeader(t("email.customer.distributor", locale));
    html += buildRow(
      t("email.customer.distributor", locale),
      data.distribuidor,
    );
    html += buildRow(
      t("email.customer.distributorContact", locale),
      data.contactoDistribuidor || null,
    );
  }

  html += endSection();
  return html;
}

// ==================== CSS FORM CONTENT ====================

function buildCSSFormContent(
  data: FormularioCSSEmailData,
  locale: string = "es",
): string {
  let html = "";

  // Section: Contenedor
  html += startSection();
  html += buildSectionHeader(t("forms.css.steps.container.title", locale));
  html += buildRow(
    t("forms.css.fields.containerType.label", locale),
    data.contenedorTipos
      ?.map((tipo) => t(`visits.containerTypes.${tipo}`, locale))
      .join(", ") || null,
  );
  html += buildRow(
    t("forms.css.fields.containersPerWeek.label", locale),
    formatNumber(data.contenedoresPorSemana, undefined, locale),
  );
  html += buildRow(
    t("forms.css.fields.floorConditions.label", locale),
    data.condicionesSuelo || null,
  );
  html += endSection();

  // Section: Medidas
  html += startSection();
  html += buildSectionHeader(t("forms.css.fields.measurements.label", locale));
  html += buildRow(
    t("forms.css.fields.measurements.label", locale),
    data.contenedorMedidas
      ?.map((medida) => t(`visits.containerMeasures.${medida}`, locale))
      .join(", ") || null,
  );

  if (data.contenedorMedidaOtro) {
    html += buildRow(
      t("visits.containerMeasures.OTRO", locale),
      data.contenedorMedidaOtro,
    );
  }
  html += endSection();

  // Section: Datos adicionales (if present)
  if (data.datosClienteUsuarioFinal) {
    html += startSection();
    html += buildSectionHeader(t("email.sections.additionalInfo", locale));
    html += buildNotesBlock(
      t("email.sections.endUserData", locale),
      data.datosClienteUsuarioFinal,
    );
    html += endSection();
  }

  return html;
}

// ==================== INDUSTRIAL FORM CONTENT ====================

function buildDimensionsTable(
  cargas: DimensionCargaEmail[],
  locale: string = "es",
): string {
  if (!cargas || cargas.length === 0) return "";

  const headerStyle = `padding: 12px 10px; font-family: ${DESIGN.fonts.family}; font-size: 11px; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.gray600}; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid ${DESIGN.colors.gray300}; background-color: ${DESIGN.colors.gray100};`;
  const cellStyle = `padding: 10px 8px; font-family: ${DESIGN.fonts.family}; font-size: 13px; text-align: center; border-bottom: 1px solid ${DESIGN.colors.gray200};`;

  const rows = cargas
    .map((c, i) => {
      const bgColor = i % 2 === 0 ? DESIGN.colors.white : DESIGN.colors.gray50;
      return `<tr><td style="${cellStyle} text-align: left; color: ${DESIGN.colors.gray700}; font-weight: ${DESIGN.fonts.weights.normal}; background-color: ${bgColor};">${c.producto || "-"}</td><td style="${cellStyle} color: ${DESIGN.colors.gray700}; background-color: ${bgColor};">${formatNumber(c.largo, undefined, locale)}</td><td style="${cellStyle} color: ${DESIGN.colors.gray700}; background-color: ${bgColor};">${formatNumber(c.fondo, undefined, locale)}</td><td style="${cellStyle} color: ${DESIGN.colors.gray700}; background-color: ${bgColor};">${formatNumber(c.alto, undefined, locale)}</td><td style="${cellStyle} color: ${DESIGN.colors.gray700}; background-color: ${bgColor};">${formatNumber(c.peso, undefined, locale)}</td><td style="${cellStyle} color: ${DESIGN.colors.primary}; font-weight: ${DESIGN.fonts.weights.normal}; background-color: ${bgColor};">${formatNumber(c.porcentaje, undefined, locale)}%</td></tr>`;
    })
    .join("");

  return `<tr><td colspan="2" style="padding: 0;"><table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;"><thead><tr><th style="${headerStyle} text-align: left;">${t("email.industrial.loadTable.product", locale)}</th><th style="${headerStyle}">${t("email.industrial.loadTable.length", locale)}</th><th style="${headerStyle}">${t("email.industrial.loadTable.depth", locale)}</th><th style="${headerStyle}">${t("email.industrial.loadTable.height", locale)}</th><th style="${headerStyle}">${t("email.industrial.loadTable.weight", locale)}</th><th style="${headerStyle}">${t("email.industrial.loadTable.percentage", locale)}</th></tr></thead><tbody>${rows}</tbody></table></td></tr>`;
}

function buildElectricalEquipmentRows(
  equipos: FormularioIndustrialEmailData["equiposElectricos"],
  locale: string = "es",
): string {
  if (!equipos || equipos.noAplica) return "";

  let rows = "";
  rows += buildRow(
    t("email.industrial.currentType", locale),
    equipos.tipoCorriente
      ? t(`visits.currentTypes.${equipos.tipoCorriente}`, locale)
      : null,
  );
  rows += buildRow(
    t("email.industrial.voltage", locale),
    formatNumber(equipos.voltaje, "V", locale),
  );
  rows += buildRow(
    t("email.industrial.frequency", locale),
    formatNumber(equipos.frecuencia, "Hz", locale),
  );
  rows += buildRow(
    t("email.industrial.amperage", locale),
    formatNumber(equipos.amperaje, "A", locale),
  );
  rows += buildRow(
    t("email.industrial.ambientTemperature", locale),
    formatNumber(equipos.temperaturaAmbiente, "°C", locale),
  );
  rows += buildRow(
    t("email.industrial.workHoursPerDay", locale),
    formatNumber(equipos.horasTrabajoPorDia, "h", locale),
  );
  if (equipos.notas) {
    rows += buildNotesBlock(t("email.industrial.notes", locale), equipos.notas);
  }
  return rows;
}

function buildIndustrialFormContent(
  data: FormularioIndustrialEmailData,
  locale: string = "es",
): string {
  let html = "";

  // Section 1: Descripción de operación
  if (data.notasOperacion) {
    html += startSection();
    html += buildSectionHeader(
      t("email.industrial.operationDescription", locale),
    );
    html += buildNotesBlock(
      t("email.industrial.operationNotes", locale),
      data.notasOperacion,
    );
    html += endSection();
  }

  // Section 2: Datos de aplicación
  html += startSection();
  html += buildSectionHeader(t("email.industrial.applicationDetails", locale));
  html += buildRow(
    t("email.industrial.lastShelfLevel", locale),
    formatNumber(data.alturaUltimoNivelEstanteria, "mm", locale),
  );
  html += buildRow(
    t("email.industrial.maxLiftHeight", locale),
    formatNumber(data.maximaAlturaElevacion, "mm", locale),
  );
  html += buildRow(
    t("email.industrial.maxHeightLoadWeight", locale),
    formatNumber(data.pesoCargaMaximaAltura, "kg", locale),
  );
  html += buildRow(
    t("email.industrial.firstLevelLoadWeight", locale),
    formatNumber(data.pesoCargaPrimerNivel, "kg", locale),
  );
  if (data.dimensionesAreaTrabajoAncho && data.dimensionesAreaTrabajoFondo) {
    html += buildRow(
      t("email.industrial.workArea", locale),
      `${formatNumber(
        data.dimensionesAreaTrabajoAncho,
        undefined,
        locale,
      )} × ${formatNumber(
        data.dimensionesAreaTrabajoFondo,
        undefined,
        locale,
      )} mm`,
    );
  }
  html += buildRow(
    t("email.industrial.workShifts", locale),
    formatNumber(data.turnosTrabajo, undefined, locale),
  );
  html += buildRow(
    t("email.industrial.desiredPower", locale),
    data.alimentacionDeseada === TipoAlimentacion.ELECTRICO
      ? t("visits.powerTypes.ELECTRICO", locale)
      : data.alimentacionDeseada === TipoAlimentacion.DIESEL
        ? t("visits.powerTypes.DIESEL", locale)
        : data.alimentacionDeseada === TipoAlimentacion.GLP
          ? t("visits.powerTypes.GLP", locale)
          : null,
  );
  html += endSection();

  // Section 3: Baterías / Equipos eléctricos
  if (data.equiposElectricos && !data.equiposElectricos.noAplica) {
    html += startSection();
    html += buildSectionHeader(
      t("email.industrial.electricalEquipment", locale),
    );
    html += buildElectricalEquipmentRows(data.equiposElectricos, locale);
    html += endSection();
  }

  // Section 4: Dimensiones de cargas
  if (data.dimensionesCargas && data.dimensionesCargas.length > 0) {
    html += startSection();
    html += buildSectionHeader(t("email.industrial.loadDimensions", locale));
    html += buildDimensionsTable(data.dimensionesCargas, locale);
    html += endSection();
  }

  // Section 5: Especificaciones del pasillo
  const hasPasilloData =
    data.profundidadProducto ||
    data.anchoLibreEntreProductos ||
    data.distanciaLibreEntreEstanterias ||
    data.fondoUtilEstanteria ||
    data.alturaBaseEstanteria ||
    data.alturaSueloPrimerBrazo ||
    data.grosorPilarColumna ||
    data.alturaMaximaInteriorEdificio;

  if (hasPasilloData) {
    html += startSection();
    html += buildSectionHeader(t("email.industrial.aisleSpecs", locale));
    html += buildRow(
      t("email.industrial.productDepth", locale),
      formatNumber(data.profundidadProducto, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.widthBetweenProducts", locale),
      formatNumber(data.anchoLibreEntreProductos, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.distBetweenRacks", locale),
      formatNumber(data.distanciaLibreEntreEstanterias, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.rackUsefulDepth", locale),
      formatNumber(data.fondoUtilEstanteria, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.rackBaseHeight", locale),
      formatNumber(data.alturaBaseEstanteria, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.floorToFirstArm", locale),
      formatNumber(data.alturaSueloPrimerBrazo, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.columnThickness", locale),
      formatNumber(data.grosorPilarColumna, "mm", locale),
    );
    html += buildRow(
      t("email.industrial.maxInteriorHeight", locale),
      formatNumber(data.alturaMaximaInteriorEdificio, "mm", locale),
    );
    html += endSection();
  }

  return html;
}

// ==================== LOGISTICA FORM CONTENT ====================

function buildLogisticaFormContent(
  data: FormularioLogisticaEmailData,
  locale: string = "es",
): string {
  let html = "";

  // Section 1: Descripción de operación
  html += startSection();
  html += buildSectionHeader(t("email.logistica.operationDescription", locale));

  if (data.notasOperacion) {
    html += buildNotesBlock(
      t("email.logistica.operationNotes", locale),
      data.notasOperacion,
    );
  }

  // Subsection: Condiciones del lugar
  html += buildSubsectionHeader(t("email.logistica.placeConditions", locale));
  html += buildRow(
    t("email.logistica.hasRamps", locale),
    formatBoolean(data.tieneRampas, locale),
  );
  if (data.tieneRampas && data.notasRampas) {
    html += buildRow(
      t("email.logistica.rampDetails", locale),
      data.notasRampas,
    );
  }
  html += buildRow(
    t("email.logistica.hasDoorways", locale),
    formatBoolean(data.tienePasosPuertas, locale),
  );
  if (data.tienePasosPuertas && data.notasPasosPuertas) {
    html += buildRow(
      t("email.logistica.doorwayDetails", locale),
      data.notasPasosPuertas,
    );
  }
  html += buildRow(
    t("email.logistica.hasRestrictions", locale),
    formatBoolean(data.tieneRestricciones, locale),
  );
  if (data.tieneRestricciones && data.notasRestricciones) {
    html += buildRow(
      t("email.logistica.restrictionDetails", locale),
      data.notasRestricciones,
    );
  }

  // Subsection: Medidas de nave
  html += buildSubsectionHeader(
    t("email.logistica.warehouseMeasurements", locale),
  );
  html += buildRow(
    t("email.logistica.maxWarehouseHeight", locale),
    formatNumber(data.alturaMaximaNave, "mm", locale),
  );
  html += buildRow(
    t("email.logistica.currentAisleWidth", locale),
    formatNumber(data.anchoPasilloActual, "mm", locale),
  );
  html += buildRow(
    t("email.logistica.workSurface", locale),
    formatNumber(data.superficieTrabajo, "m²", locale),
  );
  html += buildRow(
    t("email.logistica.floorConditions", locale),
    data.condicionesSuelo || null,
  );
  html += buildRow(
    t("email.logistica.operationType", locale),
    data.tipoOperacion === "almacenamiento"
      ? t("forms.logistica.options.operationType.storage", locale)
      : data.tipoOperacion === "cross-docking"
        ? t("forms.logistica.options.operationType.crossDocking", locale)
        : data.tipoOperacion === "picking"
          ? t("forms.logistica.options.operationType.picking", locale)
          : data.tipoOperacion === "carga-descarga"
            ? t(
                "forms.logistica.options.operationType.loadingUnloading",
                locale,
              )
            : data.tipoOperacion === "preparacion-pedidos"
              ? t("forms.logistica.options.operationType.orderPrep", locale)
              : data.tipoOperacion === "mixto"
                ? t("forms.logistica.options.operationType.mixed", locale)
                : null,
  );
  html += endSection();

  // Section 2: Datos de aplicación
  html += startSection();
  html += buildSectionHeader(t("email.logistica.applicationDetails", locale));
  html += buildRow(
    t("email.logistica.lastShelfLevel", locale),
    formatNumber(data.alturaUltimoNivelEstanteria, "mm", locale),
  );
  html += buildRow(
    t("email.logistica.maxLiftHeight", locale),
    formatNumber(data.maximaAlturaElevacion, "mm", locale),
  );
  html += buildRow(
    t("email.logistica.maxHeightLoadWeight", locale),
    formatNumber(data.pesoCargaMaximaAltura, "kg", locale),
  );
  html += buildRow(
    t("email.logistica.firstLevelLoadWeight", locale),
    formatNumber(data.pesoCargaPrimerNivel, "kg", locale),
  );
  if (data.dimensionesAreaTrabajoAncho && data.dimensionesAreaTrabajoFondo) {
    html += buildRow(
      t("email.logistica.workArea", locale),
      `${formatNumber(
        data.dimensionesAreaTrabajoAncho,
        undefined,
        locale,
      )} × ${formatNumber(
        data.dimensionesAreaTrabajoFondo,
        undefined,
        locale,
      )} mm`,
    );
  }
  html += buildRow(
    t("email.logistica.workShifts", locale),
    formatNumber(data.turnosTrabajo, undefined, locale),
  );
  html += buildRow(
    t("email.logistica.desiredPower", locale),
    data.alimentacionDeseada === TipoAlimentacion.ELECTRICO
      ? t("visits.powerTypes.ELECTRICO", locale)
      : data.alimentacionDeseada === TipoAlimentacion.DIESEL
        ? t("visits.powerTypes.DIESEL", locale)
        : data.alimentacionDeseada === TipoAlimentacion.GLP
          ? t("visits.powerTypes.GLP", locale)
          : null,
  );
  html += endSection();

  // Section 3: Baterías / Equipos eléctricos
  if (data.equiposElectricos && !data.equiposElectricos.noAplica) {
    html += startSection();
    html += buildSectionHeader(
      t("email.logistica.electricalEquipment", locale),
    );
    html += buildElectricalEquipmentRows(data.equiposElectricos, locale);
    html += endSection();
  }

  // Section 4: Dimensiones de cargas
  if (data.dimensionesCargas && data.dimensionesCargas.length > 0) {
    html += startSection();
    html += buildSectionHeader(t("email.logistica.loadDimensions", locale));
    html += buildDimensionsTable(data.dimensionesCargas, locale);
    html += endSection();
  }

  // Section 5: Pasillo actual
  if (data.pasilloActual) {
    const p = data.pasilloActual;
    const hasPasilloData =
      p.distanciaEntreEstanterias ||
      p.distanciaEntreProductos ||
      p.anchoPasilloDisponible ||
      p.tipoEstanterias ||
      p.nivelEstanterias ||
      p.alturaMaximaEstanteria;

    if (hasPasilloData) {
      html += startSection();
      html += buildSectionHeader(t("email.logistica.currentAisle", locale));
      html += buildRow(
        t("email.logistica.distBetweenRacks", locale),
        formatNumber(p.distanciaEntreEstanterias, "mm", locale),
      );
      html += buildRow(
        t("email.logistica.distBetweenProducts", locale),
        formatNumber(p.distanciaEntreProductos, "mm", locale),
      );
      html += buildRow(
        t("email.logistica.availableAisleWidth", locale),
        formatNumber(p.anchoPasilloDisponible, "mm", locale),
      );
      html += buildRow(
        t("email.logistica.rackType", locale),
        p.tipoEstanterias
          ? t(`visits.shelfTypes.${p.tipoEstanterias}`, locale)
          : null,
      );
      html += buildRow(
        t("email.logistica.rackLevels", locale),
        formatNumber(p.nivelEstanterias, undefined, locale),
      );
      html += buildRow(
        t("email.logistica.maxRackHeight", locale),
        formatNumber(p.alturaMaximaEstanteria, "mm", locale),
      );
      html += endSection();
    }
  }

  return html;
}

// ==================== STRADDLE CARRIER FORM CONTENT ====================

function buildStraddleCarrierFormContent(
  data: FormularioStraddleCarrierEmailData,
  locale: string = "es",
): string {
  let html = "";

  // Section 1: Instrucciones / Tipo de manejo
  html += startSection();
  html += buildSectionHeader(t("email.straddleCarrier.handlingType", locale));
  html += buildRow(
    t("email.straddleCarrier.handlesContainers", locale),
    formatBoolean(data.manejaContenedores, locale),
    {
      highlight: data.manejaContenedores,
    },
  );
  html += buildRow(
    t("email.straddleCarrier.handlesSpecialLoad", locale),
    formatBoolean(data.manejaCargaEspecial, locale),
    {
      highlight: data.manejaCargaEspecial,
    },
  );
  html += endSection();

  // Section 2: Contenedores (if applicable)
  if (data.manejaContenedores) {
    html += startSection();
    html += buildSectionHeader(t("email.straddleCarrier.containers", locale));

    html += buildRow(
      t("email.straddleCarrier.individualContainers", locale),
      formatBoolean(data.manejaContenedoresIndiv, locale),
    );
    html += buildRow(
      t("email.straddleCarrier.doubleStacking", locale),
      formatBoolean(data.dobleApilamiento, locale),
    );

    // Container sizes
    if (data.contenedoresTamanios) {
      const sizes: string[] = [];
      const ct = data.contenedoresTamanios;
      if (ct.size20ft?.selected)
        sizes.push(`20ft (${ct.size20ft.cantidad || 0})`);
      if (ct.size30ft?.selected)
        sizes.push(`30ft (${ct.size30ft.cantidad || 0})`);
      if (ct.size40ft?.selected)
        sizes.push(`40ft (${ct.size40ft.cantidad || 0})`);
      if (ct.size45ft?.selected)
        sizes.push(`45ft (${ct.size45ft.cantidad || 0})`);
      if (ct.size53ft?.selected)
        sizes.push(`53ft (${ct.size53ft.cantidad || 0})`);
      if (sizes.length > 0) {
        html += buildRow(
          t("email.straddleCarrier.containerSizes", locale),
          sizes.join(", "),
        );
      }
    }

    html += buildRow(
      t("email.straddleCarrier.maxContainerWeight", locale),
      formatNumber(data.pesoMaximoContenedor, "kg", locale),
    );

    if (data.infoAdicionalContenedores) {
      html += buildNotesBlock(
        t("email.straddleCarrier.additionalInfo", locale),
        data.infoAdicionalContenedores,
      );
    }
    html += endSection();
  }

  // Section 3: Carga especial (if applicable)
  if (data.manejaCargaEspecial) {
    html += startSection();
    html += buildSectionHeader(t("email.straddleCarrier.specialLoad", locale));

    // Subsection: Dimensiones de productos
    html += buildSubsectionHeader(
      t("email.straddleCarrier.productDimensions", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.longestProduct", locale),
      formatNumber(data.productoMasLargo, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.shortestProduct", locale),
      formatNumber(data.productoMasCorto, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.widestProduct", locale),
      formatNumber(data.productoMasAncho, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.narrowestProduct", locale),
      formatNumber(data.productoMasEstrecho, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.tallestProduct", locale),
      formatNumber(data.productoMasAlto, "mm", locale),
    );

    // Subsection: Puntos de elevación
    html += buildSubsectionHeader(
      t("email.straddleCarrier.liftPointsAndWeights", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.liftPointsLength", locale),
      formatNumber(data.puntosElevacionLongitud, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.liftPointsWidth", locale),
      formatNumber(data.puntosElevacionAncho, "mm", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.maxWeightLongProduct", locale),
      formatNumber(data.pesoMaximoProductoLargo, "kg", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.maxWeightShortProduct", locale),
      formatNumber(data.pesoMaximoProductoCorto, "kg", locale),
    );
    html += endSection();
  }

  // Section 4: Otros / Condiciones
  const hasOtrosData =
    data.zonasPasoAncho ||
    data.zonasPasoAlto ||
    data.condicionesPiso ||
    data.pisoPlano !== undefined ||
    data.restriccionesAltura ||
    data.restriccionesAnchura ||
    data.notasAdicionales;

  if (hasOtrosData) {
    html += startSection();
    html += buildSectionHeader(
      t("email.straddleCarrier.additionalConditions", locale),
    );

    // Subsection: Zonas de paso
    if (data.zonasPasoAncho || data.zonasPasoAlto) {
      html += buildSubsectionHeader(
        t("email.straddleCarrier.passageZones", locale),
      );
      html += buildRow(
        t("email.straddleCarrier.passageWidth", locale),
        formatNumber(data.zonasPasoAncho, "mm", locale),
      );
      html += buildRow(
        t("email.straddleCarrier.passageHeight", locale),
        formatNumber(data.zonasPasoAlto, "mm", locale),
      );
    }

    // Subsection: Condiciones del piso
    html += buildSubsectionHeader(
      t("email.straddleCarrier.floorConditions", locale),
    );
    html += buildRow(
      t("email.straddleCarrier.floorConditionsLabel", locale),
      data.condicionesPiso || null,
    );
    html += buildRow(
      t("email.straddleCarrier.flatFloor", locale),
      formatBoolean(data.pisoPlano, locale),
    );

    // Subsection: Restricciones
    if (data.restriccionesAltura || data.restriccionesAnchura) {
      html += buildSubsectionHeader(
        t("email.straddleCarrier.restrictions", locale),
      );
      html += buildRow(
        t("email.straddleCarrier.heightRestriction", locale),
        formatNumber(data.restriccionesAltura, "mm", locale),
      );
      html += buildRow(
        t("email.straddleCarrier.widthRestriction", locale),
        formatNumber(data.restriccionesAnchura, "mm", locale),
      );
    }

    // Notes
    if (data.notasAdicionales) {
      html += buildNotesBlock(
        t("email.straddleCarrier.additionalNotes", locale),
        data.notasAdicionales,
      );
    }
    html += endSection();
  }

  return html;
}

// ==================== FORM CONTENT ROUTER ====================

function buildFormSpecificContent(
  data: VisitEmailData,
  locale: string,
): string {
  if (data.formularioCSS) {
    return buildCSSFormContent(data.formularioCSS, locale);
  }
  if (data.formularioIndustrial) {
    return buildIndustrialFormContent(data.formularioIndustrial, locale);
  }
  if (data.formularioLogistica) {
    return buildLogisticaFormContent(data.formularioLogistica, locale);
  }
  if (data.formularioStraddleCarrier) {
    return buildStraddleCarrierFormContent(
      data.formularioStraddleCarrier,
      locale,
    );
  }
  return "";
}

// ==================== FILES SECTION ====================

function buildFilesSection(
  archivos: VisitEmailData["archivos"],
  locale: string = "es",
): string {
  if (!archivos || archivos.length === 0) return "";

  const rows = archivos
    .map((archivo, index) => {
      const fileType = getFileTypeLabel(archivo.tipoArchivo, locale);
      const bgColor =
        index % 2 === 0 ? DESIGN.colors.white : DESIGN.colors.gray50;
      return `<tr>
        <td style="padding: 12px 16px; font-family: ${DESIGN.fonts.family}; border-bottom: 1px solid ${DESIGN.colors.gray200}; background-color: ${bgColor};">
          <a href="${archivo.cloudinaryUrl}" target="_blank" rel="noopener" style="color: ${DESIGN.colors.primary}; text-decoration: none; font-size: ${DESIGN.fonts.sizes.sm}; font-weight: ${DESIGN.fonts.weights.normal};">${archivo.nombre}</a>
        </td>
        <td style="padding: 12px; font-family: ${DESIGN.fonts.family}; border-bottom: 1px solid ${DESIGN.colors.gray200}; text-align: center; background-color: ${bgColor};">
          <span style="display: inline-block; padding: 3px 10px; background-color: ${fileType.color}; border-radius: 12px; font-size: ${DESIGN.fonts.sizes.xs}; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.white};">${fileType.label}</span>
        </td>
        <td style="padding: 12px 16px; font-family: ${DESIGN.fonts.family}; border-bottom: 1px solid ${DESIGN.colors.gray200}; text-align: right; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray500}; background-color: ${bgColor};">
          ${formatFileSize(archivo.tamanio)}
        </td>
      </tr>`;
    })
    .join("");

  const headerCellStyle = `padding: 10px 16px; font-family: ${DESIGN.fonts.family}; font-size: 11px; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.gray600}; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid ${DESIGN.colors.gray300}; background-color: ${DESIGN.colors.gray100};`;

  return `${startSection()}
    <tr>
      <td colspan="3" style="padding: 14px 20px; background-color: ${DESIGN.colors.primary}; border-radius: 8px 8px 0 0;">
        <span style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.white}; text-transform: uppercase; letter-spacing: 0.5px;">${t("email.files.header", locale)} (${archivos.length})</span>
      </td>
    </tr>
    <tr>
      <td colspan="3" style="padding: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="${headerCellStyle} text-align: left;">${t("email.files.file", locale)}</th>
              <th style="${headerCellStyle} text-align: center;">${t("email.files.type", locale)}</th>
              <th style="${headerCellStyle} text-align: right;">${t("email.files.size", locale)}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </td>
    </tr>
  ${endSection()}`;
}

// ==================== METADATA SECTION ====================

function buildMetadataSection(
  data: VisitEmailData,
  locale: string = "es",
): string {
  const notAssigned = t("email.common.notAssigned", locale);

  // Determine display values with safe fallbacks
  const companyName =
    data.razonSocial && data.razonSocial.trim() !== ""
      ? data.razonSocial
      : notAssigned;

  // Owner info (whoever created the visit)
  const ownerName =
    data.owner?.name && data.owner.name.trim() !== ""
      ? data.owner.name
      : notAssigned;
  const ownerRole = data.owner?.role || data.submitterRole;

  // Dealer info
  const dealerName =
    data.dealer?.name && data.dealer.name.trim() !== ""
      ? data.dealer.name
      : null;

  // Seller/P.Manager info
  const sellerName =
    data.vendedor?.name && data.vendedor.name.trim() !== ""
      ? data.vendedor.name
      : notAssigned;

  // Common variables
  const isSellerOrAdmin =
    ownerRole === Role.SELLER || ownerRole === Role.ADMIN || data.vendedor;
  const isCompletada = data.status === VisitStatus.COMPLETADA;
  const isClone = data.isClone;

  // ==================== SELLER/ADMIN FLOW - COMPACT HEADER METADATA ====================
  // We want the compact header format (Status | Company | Date | Seller) for:
  // 1. Direct visits by SELLER/ADMIN (No Clones)
  // 2. Cloned visits submitted as COMPLETADA by SELLER/ADMIN
  // So we return EMPTY metadata section here (metadata is handled in the main template header)
  if (
    (isSellerOrAdmin && !isClone) ||
    (isSellerOrAdmin && isClone && isCompletada)
  ) {
    return "";
  }

  // ==================== STANDARD METADATA LAYOUT ====================
  // Build metadata rows
  let metadataRows = "";

  // Row 1: Visit Owner / Creator
  if (ownerRole === Role.DEALER || data.dealer) {
    // Dealer created the visit
    metadataRows += `
      <tr>
        <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray500}; width: 140px;">${t("email.metadata.owner", locale)}:</td>
        <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray800};">
          <span style="display: inline-block; padding: 2px 8px; background-color: #EDE7F6; color: #5E35B1; border-radius: 4px; font-size: 10px; font-weight: 500; margin-right: 6px;">DEALER</span>
          ${dealerName || ownerName}
        </td>
      </tr>
    `;
    // Assigned Seller
    metadataRows += `
      <tr>
        <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray500};">${t("email.metadata.assignedTo", locale)}:</td>
        <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray800};">
          <span style="display: inline-block; padding: 2px 8px; background-color: #E3F2FD; color: #1565C0; border-radius: 4px; font-size: 10px; font-weight: 500; margin-right: 6px;">P. MANAGER</span>
          ${sellerName}
        </td>
      </tr>
    `;
  } else if (ownerRole === Role.SELLER || data.vendedor) {
    // Seller created/edited the visit
    metadataRows += `
      <tr>
        <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray500};">${t("email.metadata.submittedBy", locale)}:</td>
        <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray800};">
          <span style="display: inline-block; padding: 2px 8px; background-color: #E3F2FD; color: #1565C0; border-radius: 4px; font-size: 10px; font-weight: 500; margin-right: 6px;">P. MANAGER</span>
          ${sellerName}
        </td>
      </tr>
    `;
    // If it's a clone AND status is BORRADOR, show original dealer info
    // (For COMPLETADA clones, dealer info is omitted - handled above)
    if (
      data.isClone &&
      data.originalDealerName &&
      data.status === VisitStatus.BORRADOR
    ) {
      metadataRows += `
        <tr>
          <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray500};">${t("email.metadata.originalDealer", locale)}:</td>
          <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray800};">
            <span style="display: inline-block; padding: 2px 8px; background-color: #EDE7F6; color: #5E35B1; border-radius: 4px; font-size: 10px; font-weight: 500; margin-right: 6px;">DEALER</span>
            ${data.originalDealerName}
          </td>
        </tr>
      `;
    }
  } else {
    // Admin or default case
    metadataRows += `
      <tr>
        <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray500};">${t("email.metadata.submittedBy", locale)}:</td>
        <td style="padding: 8px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray800};">
          ${ownerRole ? `<span style="display: inline-block; padding: 2px 8px; background-color: #FFF3E0; color: #E65100; border-radius: 4px; font-size: 10px; font-weight: 500; margin-right: 6px;">${ownerRole}</span>` : ""}
          ${ownerName}
        </td>
      </tr>
    `;
  }

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; margin-top: 12px;">
      ${metadataRows}
    </table>
  `;
}

// ==================== MAIN HTML TEMPLATE ====================

export function generateVisitCompletedEmailHTML(data: VisitEmailData): string {
  const locale = data.locale || "es";
  const formTypeName = getFormTypeName(data.formType, locale);
  const statusConfig = getStatusConfig(data.status, locale);
  const customerInfoSection = buildCustomerInfoSection(data, locale);
  const formSpecificContent = buildFormSpecificContent(data, locale);
  const filesSection = buildFilesSection(data.archivos, locale);
  const metadataSection = buildMetadataSection(data, locale);

  // Safe company name
  const notAssigned = t("email.common.notAssigned", locale);
  const companyName =
    data.razonSocial && data.razonSocial.trim() !== ""
      ? data.razonSocial
      : notAssigned;

  // Description section with new DESIGN system
  const descriptionSection = data.descripcionProducto
    ? `${startSection()}
      <tr>
        <td colspan="2" style="padding: 14px 20px; background-color: ${DESIGN.colors.primary}; border-radius: 8px 8px 0 0;">
          <span style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; font-weight: ${DESIGN.fonts.weights.normal}; color: ${DESIGN.colors.white}; text-transform: uppercase; letter-spacing: 0.5px;">${t("email.sections.productDescription", locale)}</span>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 16px; border-bottom: 1px solid ${DESIGN.colors.gray200}; background-color: ${DESIGN.colors.white};">
          <div style="font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.base}; color: ${DESIGN.colors.gray800}; line-height: 1.65; white-space: pre-wrap;">${data.descripcionProducto}</div>
        </td>
      </tr>
    ${endSection()}`
    : "";

  // Variables for metadata logic
  const ownerRole = data.owner?.role || data.submitterRole;
  const isSellerOrAdmin =
    ownerRole === Role.SELLER || ownerRole === Role.ADMIN || data.vendedor;
  const isClone = data.isClone;
  const isCompletada = data.status === VisitStatus.COMPLETADA;

  // Seller/P.Manager info
  const sellerName =
    data.vendedor?.name && data.vendedor.name.trim() !== ""
      ? data.vendedor.name
      : notAssigned;

  // Get the title based on status and clone
  let emailTitle =
    data.status === VisitStatus.COMPLETADA
      ? t("email.header.visitCompleted", locale)
      : t("email.header.visitDraft", locale);

  // if (data.isClone) {
  //   emailTitle = `${emailTitle} (${t("email.clone", locale)})`;
  // }

  // Get preheader based on status
  const preheader =
    data.status === VisitStatus.COMPLETADA
      ? t("email.preheader.completed", locale)
      : t("email.preheader.draft", locale);

  // Get draft prefix
  const draftPrefix =
    data.status === VisitStatus.BORRADOR
      ? `[${t("email.status.draft", locale)}] `
      : "";

  // Clone prefix - Only show [Clone] for BORRADOR status, NOT for COMPLETADA
  // When SELLER/ADMIN sends COMPLETADA, email should look like a regular visit
  const clonePrefix =
    data.isClone && data.status === VisitStatus.BORRADOR
      ? `[${t("email.clone", locale)}] `
      : "";

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${draftPrefix}${clonePrefix}${t("email.subject.visit", locale)}: ${companyName} - ${formTypeName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: Arial, sans-serif; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${DESIGN.colors.gray100}; font-family: ${DESIGN.fonts.family}; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}: ${companyName} - ${formTypeName}
  </div>

  <!-- Main wrapper table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%; background-color: ${DESIGN.colors.gray100};">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        
        <!-- Main container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="width: 680px; max-width: 100%; margin: 0 auto; background-color: ${DESIGN.colors.white}; border-radius: 12px;">
          
          <!-- Header with green background -->
          <tr>
            <td align="center" style="background-color: ${DESIGN.colors.primary}; padding: 28px 24px; border-radius: 12px 12px 0 0;">
              <img src="${EMAIL_CONFIG.companyLogo}" alt="Combilift" width="160" style="max-width: 160px; height: auto; display: block; margin-bottom: 12px;">
              <h1 style="margin: 0 0 6px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xl}; font-weight: ${DESIGN.fonts.weights.normal}; letter-spacing: 0.5px; color: ${DESIGN.colors.gray800};">${emailTitle.toUpperCase()}</h1>
              <p style="margin: 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.md}; color: ${DESIGN.colors.gray800}; font-weight: ${DESIGN.fonts.weights.normal};">${formTypeName}</p>
            </td>
          </tr>

          <!-- Status bar with enhanced metadata -->
          <tr>
            <td style="padding: 16px 24px; background-color: ${DESIGN.colors.gray50}; border-bottom: 1px solid ${DESIGN.colors.gray200};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width: 100%;">
                <tr>
                  <td style="vertical-align: top;">
                    <span style="display: inline-block; padding: 6px 14px; background-color: ${statusConfig.bgColor}; border-radius: 6px; border-left: 4px solid ${statusConfig.borderColor}; font-family: ${DESIGN.fonts.family}; font-size: 11px; font-weight: ${DESIGN.fonts.weights.normal}; color: ${statusConfig.textColor}; text-transform: uppercase; letter-spacing: 0.5px;">${statusConfig.label}</span>
                    <span style="display: inline-block; margin-left: 12px; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.sm}; color: ${DESIGN.colors.gray800}; font-weight: ${DESIGN.fonts.weights.normal};">${companyName}</span>
                    <span style="display: inline-block; margin-left: 8px; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray500};">${formatDateShort(data.visitDate, locale)}</span>
                    ${
                      (isSellerOrAdmin && !isClone) ||
                      (isSellerOrAdmin && isClone && isCompletada)
                        ? `<span style="display: inline-block; margin-left: 8px; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray800}; font-weight: ${DESIGN.fonts.weights.medium};">| ${sellerName}</span>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
              ${metadataSection}
            </td>
          </tr>

          <!-- Content area -->
          <tr>
            <td style="padding: 24px; background-color: ${DESIGN.colors.white};">
              ${customerInfoSection}
              ${descriptionSection}
              ${formSpecificContent}
              ${filesSection}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: ${DESIGN.colors.gray100}; padding: 20px 24px; border-top: 1px solid ${DESIGN.colors.gray200}; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 4px 0; font-family: ${DESIGN.fonts.family}; font-size: ${DESIGN.fonts.sizes.xs}; color: ${DESIGN.colors.gray500};">
                ${t("email.common.automaticMessage", locale)} <strong style="color: ${DESIGN.colors.gray700};">CombiSales</strong>
              </p>
              <p style="margin: 0; font-family: ${DESIGN.fonts.family}; font-size: 10px; color: ${DESIGN.colors.gray400};">
                © ${new Date().getFullYear()} Combilift. ${t("email.common.allRightsReserved", locale)}
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ==================== PLAIN TEXT TEMPLATE ====================

export function generateVisitCompletedEmailText(data: VisitEmailData): string {
  const locale = data.locale || "es";
  const formTypeName = getFormTypeName(data.formType, locale);
  const archivos = data.archivos || [];
  const notAssigned = t("email.common.notAssigned", locale);

  const statusLabel =
    data.status === VisitStatus.COMPLETADA
      ? t("email.plainText.visitCompleted", locale).toUpperCase()
      : data.status === VisitStatus.BORRADOR
        ? t("email.plainText.visitDraft", locale).toUpperCase()
        : t("email.plainText.unknownStatus", locale).toUpperCase();

  // Safe company name
  const companyName =
    data.razonSocial && data.razonSocial.trim() !== ""
      ? data.razonSocial
      : notAssigned;

  // Build location string
  const locationParts = [
    data.localidad,
    data.provinciaEstado,
    data.codigoPostal,
    data.pais,
  ].filter(Boolean);
  const location = locationParts.join(", ");

  // Build role-based metadata section
  let metadataSection = "";
  const ownerRole = data.owner?.role || data.submitterRole;

  // Check if this is SELLER/ADMIN submitting COMPLETADA clone
  const isSellerOrAdmin =
    ownerRole === Role.SELLER || ownerRole === Role.ADMIN || data.vendedor;
  const isCompletada = data.status === VisitStatus.COMPLETADA;
  const isClone = data.isClone;

  if (isSellerOrAdmin && isCompletada && isClone) {
    // SELLER/ADMIN COMPLETADA clone: Minimal metadata - no DEALER info
    const sellerName = data.vendedor?.name || data.owner?.name || notAssigned;
    metadataSection = `
${t("email.metadata.submittedBy", locale)}: [P. MANAGER] ${sellerName}`;
  } else if (ownerRole === "DEALER" || data.dealer) {
    const dealerName = data.dealer?.name || data.owner?.name || notAssigned;
    const sellerName = data.vendedor?.name || notAssigned;
    metadataSection = `
${t("email.metadata.owner", locale)}:      [DEALER] ${dealerName}
${t("email.metadata.assignedTo", locale)}:  [P. MANAGER] ${sellerName}`;
  } else if (ownerRole === Role.SELLER) {
    const sellerName = data.vendedor?.name || data.owner?.name || notAssigned;
    metadataSection = `
${t("email.metadata.submittedBy", locale)}: [P. MANAGER] ${sellerName}`;
    // Only show dealer info for BORRADOR status
    if (
      data.isClone &&
      data.originalDealerName &&
      data.status === VisitStatus.BORRADOR
    ) {
      metadataSection += `
${t("email.metadata.originalDealer", locale)}: [DEALER] ${data.originalDealerName}`;
    }
  } else {
    const ownerName = data.owner?.name || data.vendedor?.name || notAssigned;
    metadataSection = `
${t("email.metadata.submittedBy", locale)}: ${ownerRole ? `[${ownerRole}] ` : ""}${ownerName}`;
  }

  // Clone indicator - only show for BORRADOR status
  if (data.isClone && data.status === VisitStatus.BORRADOR) {
    metadataSection += `
${t("email.metadata.visitType", locale)}:   ${t("email.metadata.clonedVisit", locale)}${data.originalVisitId ? ` (ID: ${data.originalVisitId.substring(0, 8)}...)` : ""}`;
  }

  // Clone indicator in header - only show for BORRADOR status
  const cloneIndicator =
    data.isClone && data.status === VisitStatus.BORRADOR
      ? ` (${t("email.clone", locale)})`
      : "";

  let text = `
${"═".repeat(55)}
COMBISALES - ${statusLabel}${cloneIndicator}
${"═".repeat(55)}

${t("email.plainText.type", locale)}:     ${formTypeName}
${t("email.plainText.company", locale)}:  ${companyName}
${t("email.plainText.date", locale)}:    ${formatDateShort(
    data.visitDate,
    locale,
  )}
${metadataSection}

${"─".repeat(55)}
${t("email.plainText.customerInfo", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.contact", locale)}:      ${data.personaContacto || "-"}
${t("email.plainText.email", locale)}:        ${data.email || "-"}
${t("email.plainText.address", locale)}:      ${data.direccion || "-"}
${t("email.plainText.location", locale)}:     ${location || "-"}
${data.website ? `Website:      ${data.website}` : ""}
${data.numeroIdentificacionFiscal ? `${t("email.plainText.taxId", locale)}:       ${data.numeroIdentificacionFiscal}` : ""}
${data.distribuidor ? `${t("email.plainText.distributor", locale)}:   ${data.distribuidor}` : ""}
${data.contactoDistribuidor ? `${t("email.plainText.distributorContact", locale)}: ${data.contactoDistribuidor}` : ""}

${"─".repeat(55)}
${t("email.plainText.productDescription", locale).toUpperCase()}
${"─".repeat(55)}

${data.descripcionProducto || t("email.common.noDescription", locale)}

`;

  // CSS Form
  if (data.formularioCSS) {
    const css = data.formularioCSS;
    text += `
${"─".repeat(55)}
${t("email.plainText.container", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.types", locale)}:              ${
      css.contenedorTipos
        ?.map((tipo) => t(`visits.containerTypes.${tipo}`, locale))
        .join(", ") || "-"
    }
${t("email.plainText.containersPerWeek", locale)}:   ${
      css.contenedoresPorSemana || "-"
    }
${t("email.plainText.floorConditions", locale)}:  ${css.condicionesSuelo || "-"}

${"─".repeat(55)}
${t("email.plainText.containerMeasurements", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.measurements", locale)}:            ${
      css.contenedorMedidas
        ?.map((medida) => t(`visits.containerMeasures.${medida}`, locale))
        .join(", ") || "-"
    }
${
  css.contenedorMedidaOtro
    ? `${t("email.plainText.otherMeasurement", locale)}:        ${
        css.contenedorMedidaOtro
      }`
    : ""
}
`;
  }

  // Industrial Form
  if (data.formularioIndustrial) {
    const ind = data.formularioIndustrial;
    text += `
${"─".repeat(55)}
${t("email.plainText.applicationData", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.lastShelfLevel", locale)}:     ${formatNumber(
      ind.alturaUltimoNivelEstanteria,
      "mm",
      locale,
    )}
${t("email.plainText.maxLiftHeight", locale)}:   ${formatNumber(
      ind.maximaAlturaElevacion,
      "mm",
      locale,
    )}
${t("email.plainText.maxHeightLoadWeight", locale)}:  ${formatNumber(
      ind.pesoCargaMaximaAltura,
      "kg",
      locale,
    )}
${t("email.plainText.firstLevelLoadWeight", locale)}: ${formatNumber(
      ind.pesoCargaPrimerNivel,
      "kg",
      locale,
    )}
${t("email.plainText.workShifts", locale)}:          ${formatNumber(
      ind.turnosTrabajo,
      undefined,
      locale,
    )}
${t("email.plainText.power", locale)}:            ${
      ind.alimentacionDeseada || "-"
    }
`;
    if (ind.notasOperacion) {
      text += `
${"─".repeat(55)}
${t("email.plainText.operationNotes", locale).toUpperCase()}
${"─".repeat(55)}

${ind.notasOperacion}
`;
    }
  }

  // Logistica Form
  if (data.formularioLogistica) {
    const log = data.formularioLogistica;
    text += `
${"─".repeat(55)}
${t("email.plainText.operatingConditions", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.maxWarehouseHeight", locale)}:        ${formatNumber(
      log.alturaMaximaNave,
      "mm",
      locale,
    )}
${t("email.plainText.aisleWidth", locale)}:           ${formatNumber(
      log.anchoPasilloActual,
      "mm",
      locale,
    )}
${t("email.plainText.workSurface", locale)}:      ${formatNumber(
      log.superficieTrabajo,
      "m²",
      locale,
    )}
${t("email.plainText.floorConditions", locale)}:       ${
      log.condicionesSuelo || "-"
    }
${t("email.plainText.operationType", locale)}:          ${
      (t("email.logistica.operationType", locale),
      log.tipoOperacion === "almacenamiento"
        ? t("forms.logistica.options.operationType.storage", locale)
        : log.tipoOperacion === "cross-docking"
          ? t("forms.logistica.options.operationType.crossDocking", locale)
          : log.tipoOperacion === "picking"
            ? t("forms.logistica.options.operationType.picking", locale)
            : log.tipoOperacion === "carga-descarga"
              ? t(
                  "forms.logistica.options.operationType.loadingUnloading",
                  locale,
                )
              : log.tipoOperacion === "preparacion-pedidos"
                ? t("forms.logistica.options.operationType.orderPrep", locale)
                : log.tipoOperacion === "mixto"
                  ? t("forms.logistica.options.operationType.mixed", locale)
                  : null)
    }

${"─".repeat(55)}
${t("email.plainText.applicationData", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.lastShelfLevel", locale)}:     ${formatNumber(
      log.alturaUltimoNivelEstanteria,
      "mm",
      locale,
    )}
${t("email.plainText.maxLiftHeight", locale)}:   ${formatNumber(
      log.maximaAlturaElevacion,
      "mm",
      locale,
    )}
${t("email.plainText.power", locale)}:            ${
      log.alimentacionDeseada === "ELECTRICO"
        ? t("visits.powerTypes.ELECTRICO", locale)
        : log.alimentacionDeseada === "DIESEL"
          ? t("visits.powerTypes.DIESEL", locale)
          : log.alimentacionDeseada === "GLP"
            ? t("visits.powerTypes.GLP", locale)
            : "-"
    }
`;
    if (log.notasOperacion) {
      text += `
${"─".repeat(55)}
${t("email.plainText.operationNotes", locale).toUpperCase()}
${"─".repeat(55)}

${log.notasOperacion}
`;
    }
  }

  // Straddle Carrier Form
  if (data.formularioStraddleCarrier) {
    const sc = data.formularioStraddleCarrier;
    text += `
${"─".repeat(55)}
${t("email.plainText.handlingType", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.handlesContainers", locale)}:   ${formatBoolean(
      sc.manejaContenedores,
      locale,
    )}
${t("email.plainText.handlesSpecialLoad", locale)}: ${formatBoolean(
      sc.manejaCargaEspecial,
      locale,
    )}
`;
    if (sc.manejaContenedores) {
      text += `
${"─".repeat(55)}
${t("email.plainText.containers", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.individualContainers", locale)}:   ${formatBoolean(
        sc.manejaContenedoresIndiv,
        locale,
      )}
${t("email.plainText.doubleStacking", locale)}:     ${formatBoolean(
        sc.dobleApilamiento,
        locale,
      )}
${t("email.plainText.maxContainerWeight", locale)}:  ${formatNumber(
        sc.pesoMaximoContenedor,
        "kg",
        locale,
      )}
`;
    }
    if (sc.manejaCargaEspecial) {
      text += `
${"─".repeat(55)}
${t("email.plainText.specialLoad", locale).toUpperCase()}
${"─".repeat(55)}

${t("email.plainText.longestProduct", locale)}:    ${formatNumber(
        sc.productoMasLargo,
        "mm",
        locale,
      )}
${t("email.plainText.shortestProduct", locale)}:    ${formatNumber(
        sc.productoMasCorto,
        "mm",
        locale,
      )}
${t("email.plainText.widestProduct", locale)}:    ${formatNumber(
        sc.productoMasAncho,
        "mm",
        locale,
      )}
${t("email.plainText.tallestProduct", locale)}:     ${formatNumber(
        sc.productoMasAlto,
        "mm",
        locale,
      )}
`;
    }
    if (sc.notasAdicionales) {
      text += `
${"─".repeat(55)}
${t("email.plainText.additionalNotes", locale).toUpperCase()}
${"─".repeat(55)}

${sc.notasAdicionales}
`;
    }
  }

  // Files
  if (archivos.length > 0) {
    text += `
${"─".repeat(55)}
${t("email.plainText.attachedFiles", locale).toUpperCase()} (${archivos.length})
${"─".repeat(55)}

${archivos
  .map(
    (a, i) =>
      `${i + 1}. ${a.nombre}\n   ${t("email.plainText.fileType", locale)}: ${
        getFileTypeLabel(a.tipoArchivo, locale).label
      } | ${t("email.plainText.fileSize", locale)}: ${formatFileSize(
        a.tamanio,
      )}`,
  )
  .join("\n\n")}
`;
  }

  text += `

${"═".repeat(55)}
${t("email.common.automaticMessage", locale)} CombiSales
© ${new Date().getFullYear()} Combilift
${"═".repeat(55)}
`;

  return text.trim();
}
