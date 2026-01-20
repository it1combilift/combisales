import { z } from "zod";
import { TipoArchivo } from "@prisma/client";

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

// ==================== CONTAINER SIZE SCHEMA ====================
export const containerSizeSchema = z.object({
  selected: z.boolean().default(false),
  cantidad: z.number().min(0).nullable(),
});

export const contenedoresTamaniosSchema = z.object({
  size20ft: containerSizeSchema.default({ selected: false, cantidad: null }),
  size30ft: containerSizeSchema.default({ selected: false, cantidad: null }),
  size40ft: containerSizeSchema.default({ selected: false, cantidad: null }),
  size45ft: containerSizeSchema.default({ selected: false, cantidad: null }),
  size53ft: containerSizeSchema.default({ selected: false, cantidad: null }),
});

// ==================== MAIN FORM SCHEMA ====================
export const getFormularioStraddleCarrierSchema = (
  t: (key: string) => string,
) =>
  z
    .object({
      // ==================== DATOS DEL CLIENTE (pre-llenados, opcionales) ====================
      razonSocial: z.string().optional().default(""),
      personaContacto: z.string().optional().default(""),
      email: z
        .string()
        .email(t("forms.straddleCarrier.validation.emailInvalid"))
        .optional()
        .or(z.literal("")),
      direccion: z.string().optional().default(""),
      localidad: z.string().optional().default(""),
      provinciaEstado: z.string().optional().default(""),
      pais: z.string().optional().default(""),
      codigoPostal: z.string().optional().default(""),
      website: z
        .string()
        .url(t("forms.straddleCarrier.validation.urlInvalid"))
        .optional()
        .or(z.literal("")),
      numeroIdentificacionFiscal: z.string().optional().default(""),
      distribuidor: z.string().optional(),
      contactoDistribuidor: z.string().optional(),
      fechaCierre: z.date().optional().nullable(),

      // ==================== INSTRUCCIONES (toggles) ====================
      manejaContenedores: z.boolean().default(false),
      manejaCargaEspecial: z.boolean().default(false),

      // ==================== CUADRO 1 - CONTENEDORES ====================
      manejaContenedoresIndiv: z.boolean().default(false),
      dobleApilamiento: z.boolean().default(false),
      contenedoresTamanios: contenedoresTamaniosSchema.default({
        size20ft: { selected: false, cantidad: null },
        size30ft: { selected: false, cantidad: null },
        size40ft: { selected: false, cantidad: null },
        size45ft: { selected: false, cantidad: null },
        size53ft: { selected: false, cantidad: null },
      }),
      pesoMaximoContenedor: z.number().positive().nullable(),
      infoAdicionalContenedores: z.string().optional(),

      // ==================== CUADRO 2 - CARGA ESPECIAL ====================
      productoMasLargo: z.number().positive().nullable(),
      productoMasCorto: z.number().positive().nullable(),
      productoMasAncho: z.number().positive().nullable(),
      productoMasEstrecho: z.number().positive().nullable(),
      puntosElevacionLongitud: z.number().positive().nullable(),
      puntosElevacionAncho: z.number().positive().nullable(),
      pesoMaximoProductoLargo: z.number().positive().nullable(),
      pesoMaximoProductoCorto: z.number().positive().nullable(),
      productoMasAlto: z.number().positive().nullable(),

      // ==================== OTROS ====================
      zonasPasoAncho: z.number().positive().nullable(),
      zonasPasoAlto: z.number().positive().nullable(),
      condicionesPiso: z.string().optional(),
      pisoPlano: z.boolean().default(true),
      restriccionesAltura: z.number().positive().nullable(),
      restriccionesAnchura: z.number().positive().nullable(),
      notasAdicionales: z.string().optional(),

      // ==================== ARCHIVOS ====================
      archivos: z.array(archivoSubidoSchema).default([]),
    })
    .superRefine((data, ctx) => {
      // Al menos una opción debe estar seleccionada
      if (!data.manejaContenedores && !data.manejaCargaEspecial) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("forms.straddleCarrier.validation.selectAtLeastOneOption"),
          path: ["manejaContenedores"],
        });
      }
    });

export type FormularioStraddleCarrierSchema = z.infer<
  ReturnType<typeof getFormularioStraddleCarrierSchema>
>;
