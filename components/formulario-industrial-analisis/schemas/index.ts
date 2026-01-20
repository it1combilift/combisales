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
      .min(1, t("forms.industrial.validation.productRequired")),
    largo: z
      .number()
      .positive(t("forms.industrial.validation.positiveRequired"))
      .nullable(),
    fondo: z
      .number()
      .positive(t("forms.industrial.validation.positiveRequired"))
      .nullable(),
    alto: z
      .number()
      .positive(t("forms.industrial.validation.positiveRequired"))
      .nullable(),
    peso: z
      .number()
      .positive(t("forms.industrial.validation.positiveRequired"))
      .nullable(),
    porcentaje: z
      .number()
      .min(0, t("forms.industrial.validation.min0"))
      .max(100, t("forms.industrial.validation.max100"))
      .nullable(),
  });

export type DimensionCarga = z.infer<
  ReturnType<typeof getDimensionCargaSchema>
>;

// ==================== ESPECIFICACIONES PASILLO SCHEMA ====================
export const especificacionesPasilloSchema = z.object({
  profundidadProducto: z.number().positive().nullable(),
  anchoLibreEntreProductos: z.number().positive().nullable(),
  distanciaLibreEntreEstanterias: z.number().positive().nullable(),
  fondoUtilEstanteria: z.number().positive().nullable(),
  alturaBaseEstanteria: z.number().positive().nullable(),
  distanciaBajoRielesGuia: z.number().positive().nullable().optional(),
  alturaSueloPrimerBrazo: z.number().positive().nullable(),
  distanciaEntreRielesGuia: z.number().positive().nullable().optional(),
  alturaLibreHastaGuia: z.number().positive().nullable().optional(),
  grosorPilarColumna: z.number().positive().nullable(),
  alturaUltimoNivel: z.number().positive().nullable(),
  alturaMaximaInteriorEdificio: z.number().positive().nullable(),
});

export type EspecificacionesPasillo = z.infer<
  typeof especificacionesPasilloSchema
>;

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
export const getFormularioIndustrialSchema = (t: any) =>
  z
    .object({
      // ==================== DATOS DEL CLIENTE (pre-llenados, opcionales) ====================
      razonSocial: z.string().optional().default(""),
      personaContacto: z.string().optional().default(""),
      email: z
        .string()
        .email(t("forms.industrial.validation.emailInvalid"))
        .optional()
        .or(z.literal("")),
      direccion: z.string().optional().default(""),
      localidad: z.string().optional().default(""),
      provinciaEstado: z.string().optional().default(""),
      pais: z.string().optional().default(""),
      codigoPostal: z.string().optional().default(""),
      website: z
        .string()
        .url(t("forms.industrial.validation.urlInvalid"))
        .optional()
        .or(z.literal("")),
      numeroIdentificacionFiscal: z.string().optional().default(""),
      distribuidor: z.string().optional(),
      contactoDistribuidor: z.string().optional(),
      fechaCierre: z.date().optional().nullable(),

      // ==================== DESCRIPCION DE LA OPERACION ====================
      notasOperacion: z
        .string()
        .min(1, t("forms.industrial.validation.operationNotesRequired")),

      // ==================== DATOS DE LA APLICACION ====================
      descripcionProducto: z
        .string()
        .min(1, t("forms.industrial.validation.productDescriptionRequired")),
      alturaUltimoNivelEstanteria: z
        .number()
        .positive(t("forms.industrial.validation.positiveValueRequired"))
        .nullable(),
      maximaAlturaElevacion: z
        .number()
        .positive(t("forms.industrial.validation.positiveValueRequired"))
        .nullable(),
      pesoCargaMaximaAltura: z
        .number()
        .positive(t("forms.industrial.validation.positiveValueRequired"))
        .nullable(),
      pesoCargaPrimerNivel: z
        .number()
        .positive(t("forms.industrial.validation.positiveValueRequired"))
        .nullable(),
      dimensionesAreaTrabajoAncho: z
        .number()
        .positive(t("forms.industrial.validation.positiveValueRequired"))
        .nullable(),
      dimensionesAreaTrabajoFondo: z
        .number()
        .positive(t("forms.industrial.validation.positiveValueRequired"))
        .nullable(),
      turnosTrabajo: z
        .number()
        .min(1, t("forms.industrial.validation.min1Shift"))
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
      dimensionesCargas: z
        .array(getDimensionCargaSchema(t))
        .min(1, t("forms.industrial.validation.loadRequired")),

      // ==================== ESPECIFICACIONES DEL PASILLO ====================
      especificacionesPasillo: especificacionesPasilloSchema,

      // ==================== ARCHIVOS ====================
      archivos: z.array(archivoSubidoSchema).default([]),
    })
    .superRefine((data, ctx) => {
      // Equipos eléctricos solo se validan si alimentación es ELECTRICO y noAplica es false
      if (data.alimentacionDeseada === TipoAlimentacion.ELECTRICO) {
        if (!data.equiposElectricos) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("forms.industrial.validation.electricalRequired"),
            path: ["equiposElectricos"],
          });
        }
        // Si noAplica está marcado, no se requieren otros campos
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
            message: t(
              "forms.industrial.validation.percentageSumError",
            ).replace("{{current}}", totalPorcentaje.toFixed(1)),
            path: ["dimensionesCargas"],
          });
        }
      }
    });

export type FormularioIndustrialSchema = z.infer<
  ReturnType<typeof getFormularioIndustrialSchema>
>;
