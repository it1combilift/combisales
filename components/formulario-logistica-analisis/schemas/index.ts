import { z } from "zod";
import { TipoAlimentacion, TipoArchivo } from "@prisma/client";

// ==================== ARCHIVO SCHEMA ====================
export const archivoSubidoSchema = z.object({
  nombre: z.string(),
  tipoArchivo: z.enum([
    TipoArchivo.IMAGEN,
    TipoArchivo.VIDEO,
    TipoArchivo.DOCUMENTO,
  ]),
  mimeType: z.string(),
  tamanio: z.number(),
  cloudinaryId: z.string(),
  cloudinaryUrl: z.string().url(),
  cloudinaryType: z.string(),
  ancho: z.number().nullish(), // Can be null or undefined
  alto: z.number().nullish(), // Can be null or undefined
  duracion: z.number().nullish(), // Can be null or undefined
  formato: z.string(),
});

export type ArchivoSubido = z.infer<typeof archivoSubidoSchema>;

// ==================== DIMENSION CARGA SCHEMA ====================
// ==================== DIMENSION CARGA SCHEMA ====================
export const getDimensionCargaSchema = (t: any) =>
  z.object({
    id: z.string(),
    producto: z
      .string()
      .min(1, t("forms.logistica.validation.productRequired")),
    largo: z
      .number()
      .positive(t("forms.logistica.validation.positiveRequired"))
      .nullable(),
    fondo: z
      .number()
      .positive(t("forms.logistica.validation.positiveRequired"))
      .nullable(),
    alto: z
      .number()
      .positive(t("forms.logistica.validation.positiveRequired"))
      .nullable(),
    peso: z
      .number()
      .positive(t("forms.logistica.validation.positiveRequired"))
      .nullable(),
    porcentaje: z
      .number()
      .min(0, t("forms.logistica.validation.min0"))
      .max(100, t("forms.logistica.validation.max100"))
      .nullable(),
  });

export type DimensionCarga = z.infer<
  ReturnType<typeof getDimensionCargaSchema>
>;

// ==================== PASILLO ACTUAL SCHEMA ====================
// ==================== PASILLO ACTUAL SCHEMA ====================
export const getPasilloActualSchema = (t: any) =>
  z.object({
    distanciaEntreEstanterias: z
      .number()
      .positive(t("forms.logistica.validation.positiveRequired"))
      .nullable(),
    distanciaEntreProductos: z
      .number()
      .positive(t("forms.logistica.validation.positiveRequired"))
      .nullable(),
    anchoPasilloDisponible: z
      .number()
      .positive(t("forms.logistica.validation.positiveRequired"))
      .nullable(),
    tipoEstanterias: z.string().nullable().optional(),
    nivelEstanterias: z
      .number()
      .positive(t("forms.logistica.validation.positiveRequired"))
      .nullable()
      .optional(),
    alturaMaximaEstanteria: z
      .number()
      .positive(t("forms.logistica.validation.positiveRequired"))
      .nullable(),
  });

export type PasilloActual = z.infer<ReturnType<typeof getPasilloActualSchema>>;

// ==================== EQUIPOS ELECTRICOS SCHEMA ====================
export const equiposElectricosSchema = z.object({
  noAplica: z.boolean().optional().default(false),
  tipoCorriente: z.enum(["MONOFASICA", "TRIFASICA"]).nullable().optional(),
  voltaje: z.number().positive().nullable().optional(),
  frecuencia: z.number().positive().nullable().optional(),
  amperaje: z.number().positive().nullable().optional(),
  temperaturaAmbiente: z.number().nullable().optional(),
  horasTrabajoPorDia: z.number().min(0).max(24).nullable().optional(),
  notas: z.string().optional(),
});

export type EquiposElectricos = z.infer<typeof equiposElectricosSchema>;

// ==================== MAIN FORM SCHEMA ====================
export const getFormularioLogisticaSchema = (t: any) =>
  z
    .object({
      // ==================== DATOS DEL CLIENTE ====================
      // Required fields for customer step
      razonSocial: z
        .string()
        .min(1, t("forms.logistica.validation.companyNameRequired")),
      direccion: z
        .string()
        .min(1, t("forms.logistica.validation.addressRequired")),
      website: z
        .string()
        .url(t("forms.logistica.validation.urlInvalid"))
        .min(1, t("forms.logistica.validation.websiteRequired")),
      // Optional customer fields
      personaContacto: z.string().optional().default(""),
      email: z
        .string()
        .email(t("forms.logistica.validation.emailInvalid"))
        .optional()
        .or(z.literal("")),
      localidad: z.string().optional().default(""),
      provinciaEstado: z.string().optional().default(""),
      pais: z.string().optional().default(""),
      codigoPostal: z.string().optional().default(""),
      numeroIdentificacionFiscal: z.string().optional().default(""),
      distribuidor: z.string().optional(),
      contactoDistribuidor: z.string().optional(),
      fechaCierre: z.date().optional().nullable(),

      // ==================== DESCRIPCION DE LA OPERACION ====================
      notasOperacion: z
        .string()
        .min(1, t("forms.logistica.validation.operationNotesRequired")),
      tieneRampas: z.boolean().default(false),
      notasRampas: z.string().optional(),
      tienePasosPuertas: z.boolean().default(false),
      notasPasosPuertas: z.string().optional(),
      tieneRestricciones: z.boolean().default(false),
      notasRestricciones: z.string().optional(),
      alturaMaximaNave: z.number().positive().nullable().optional(),
      anchoPasilloActual: z.number().positive().nullable().optional(),
      superficieTrabajo: z.number().positive().nullable().optional(),
      condicionesSuelo: z.string().optional(),
      tipoOperacion: z.string().optional(),

      // ==================== DATOS DE LA APLICACION ====================
      descripcionProducto: z
        .string()
        .min(1, t("forms.logistica.validation.productDescriptionRequired")),
      alturaUltimoNivelEstanteria: z
        .number()
        .positive(t("forms.logistica.validation.positiveValueRequired"))
        .nullable(),
      maximaAlturaElevacion: z
        .number()
        .positive(t("forms.logistica.validation.positiveValueRequired"))
        .nullable(),
      pesoCargaMaximaAltura: z
        .number()
        .positive(t("forms.logistica.validation.positiveValueRequired"))
        .nullable(),
      pesoCargaPrimerNivel: z
        .number()
        .positive(t("forms.logistica.validation.positiveValueRequired"))
        .nullable(),
      dimensionesAreaTrabajoAncho: z
        .number()
        .positive(t("forms.logistica.validation.positiveValueRequired"))
        .nullable(),
      dimensionesAreaTrabajoFondo: z
        .number()
        .positive(t("forms.logistica.validation.positiveValueRequired"))
        .nullable(),
      turnosTrabajo: z
        .number()
        .min(1, t("forms.logistica.validation.min1Shift"))
        .nullable(),
      fechaEstimadaDefinicion: z.date().optional().nullable(),
      alimentacionDeseada: z.enum([
        TipoAlimentacion.ELECTRICO,
        TipoAlimentacion.DIESEL,
        TipoAlimentacion.GLP,
      ]),

      // ==================== EQUIPOS ELECTRICOS (CONDICIONAL) ====================
      equiposElectricos: equiposElectricosSchema.optional(),

      // ==================== DIMENSIONES DE LAS CARGAS ====================
      // ==================== DIMENSIONES DE LAS CARGAS ====================
      dimensionesCargas: z
        .array(getDimensionCargaSchema(t))
        .min(1, t("forms.logistica.validation.loadRequired")),

      // ==================== PASILLO ACTUAL ====================
      pasilloActual: getPasilloActualSchema(t),

      // ==================== ARCHIVOS ====================
      archivos: z.array(archivoSubidoSchema).default([]),
    })
    .superRefine((data, ctx) => {
      // Equipos eléctricos solo se validan si alimentación es ELECTRICO y noAplica es false
      if (data.alimentacionDeseada === TipoAlimentacion.ELECTRICO) {
        if (!data.equiposElectricos) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("forms.logistica.validation.electricalRequired"),
            path: ["equiposElectricos"],
          });
        }
      }

      // Validar que porcentajes sumen 100%
      if (data.dimensionesCargas && data.dimensionesCargas.length > 0) {
        const totalPorcentaje = data.dimensionesCargas.reduce(
          (sum, carga) => sum + (carga.porcentaje || 0),
          0,
        );
        if (Math.abs(totalPorcentaje - 100) > 0.01) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("forms.logistica.validation.percentageSumError").replace(
              "{{current}}",
              totalPorcentaje.toFixed(1),
            ),
            path: ["dimensionesCargas"],
          });
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("forms.logistica.validation.percentageSumError").replace(
              "{{current}}",
              totalPorcentaje.toFixed(1),
            ),
            path: ["dimensionesCargas"],
          });
        }
      }
    });

export type FormularioLogisticaSchema = z.infer<
  ReturnType<typeof getFormularioLogisticaSchema>
>;
