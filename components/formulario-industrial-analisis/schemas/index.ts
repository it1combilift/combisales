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
  ancho: z.number().optional(),
  alto: z.number().optional(),
  duracion: z.number().optional(),
  formato: z.string(),
});

export type ArchivoSubido = z.infer<typeof archivoSubidoSchema>;

// ==================== DIMENSION CARGA SCHEMA ====================
export const dimensionCargaSchema = z.object({
  id: z.string(),
  producto: z.string().min(1, "Producto es requerido"),
  largo: z.number().positive("Debe ser positivo").nullable(),
  fondo: z.number().positive("Debe ser positivo").nullable(),
  alto: z.number().positive("Debe ser positivo").nullable(),
  peso: z.number().positive("Debe ser positivo").nullable(),
  porcentaje: z.number().min(0, "Mínimo 0%").max(100, "Máximo 100%").nullable(),
});

export type DimensionCarga = z.infer<typeof dimensionCargaSchema>;

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
  tipoCorriente: z.enum(["MONOFASICA", "TRIFASICA"]).nullable().optional(),
  voltaje: z.number().positive().nullable().optional(),
  frecuencia: z.number().positive().nullable().optional(),
  amperaje: z.number().positive().nullable().optional(),
  temperaturaAmbiente: z.number().nullable().optional(),
  horasTrabajoPorDia: z.number().min(0).max(24).nullable().optional(),
});

export type EquiposElectricos = z.infer<typeof equiposElectricosSchema>;

// ==================== MAIN FORM SCHEMA ====================
export const formularioIndustrialSchema = z
  .object({
    // ==================== DATOS DEL CLIENTE ====================
    razonSocial: z.string().min(1, "Razón social es requerida"),
    personaContacto: z.string().min(1, "Persona de contacto es requerida"),
    email: z.string().email("Email inválido"),
    direccion: z.string().min(1, "Dirección es requerida"),
    localidad: z.string().min(1, "Localidad es requerida"),
    provinciaEstado: z.string().min(1, "Provincia/Estado es requerida"),
    pais: z.string().min(1, "País es requerido"),
    codigoPostal: z.string().min(1, "Código postal es requerido"),
    website: z.string().url("URL inválida").optional().or(z.literal("")),
    numeroIdentificacionFiscal: z
      .string()
      .min(1, "No. identificación fiscal es requerido"),
    distribuidor: z.string().optional(),
    contactoDistribuidor: z.string().optional(),
    fechaCierre: z.date().optional().nullable(),

    // ==================== DESCRIPCION DE LA OPERACION ====================
    notasOperacion: z
      .string()
      .min(1, "Notas sobre la operación son requeridas"),

    // ==================== DATOS DE LA APLICACION ====================
    descripcionProducto: z
      .string()
      .min(1, "Descripción del producto es requerida"),
    alturaUltimoNivelEstanteria: z
      .number()
      .positive("Debe ser un valor positivo")
      .nullable(),
    maximaAlturaElevacion: z
      .number()
      .positive("Debe ser un valor positivo")
      .nullable(),
    pesoCargaMaximaAltura: z
      .number()
      .positive("Debe ser un valor positivo")
      .nullable(),
    pesoCargaPrimerNivel: z
      .number()
      .positive("Debe ser un valor positivo")
      .nullable(),
    dimensionesAreaTrabajoAncho: z
      .number()
      .positive("Debe ser un valor positivo")
      .nullable(),
    dimensionesAreaTrabajoFondo: z
      .number()
      .positive("Debe ser un valor positivo")
      .nullable(),
    turnosTrabajo: z.number().min(1, "Mínimo 1 turno").nullable(),
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
      .array(dimensionCargaSchema)
      .min(1, "Debe agregar al menos una carga"),

    // ==================== ESPECIFICACIONES DEL PASILLO ====================
    especificacionesPasillo: especificacionesPasilloSchema,

    // ==================== ARCHIVOS ====================
    archivos: z.array(archivoSubidoSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.alimentacionDeseada === TipoAlimentacion.ELECTRICO) {
      if (!data.equiposElectricos) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Los datos de equipos eléctricos son requeridos para alimentación eléctrica",
          path: ["equiposElectricos"],
        });
      }
    }

    // Validar que porcentajes sumen 100%
    if (data.dimensionesCargas && data.dimensionesCargas.length > 0) {
      const totalPorcentaje = data.dimensionesCargas.reduce(
        (sum, carga) => sum + (carga.porcentaje || 0),
        0
      );
      if (Math.abs(totalPorcentaje - 100) > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Los porcentajes deben sumar 100% (actual: ${totalPorcentaje.toFixed(
            1
          )}%)`,
          path: ["dimensionesCargas"],
        });
      }
    }
  });

export type FormularioIndustrialSchema = z.infer<
  typeof formularioIndustrialSchema
>;
