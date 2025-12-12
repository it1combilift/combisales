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
  ancho: z.number().optional(),
  alto: z.number().optional(),
  duracion: z.number().optional(),
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
export const formularioStraddleCarrierSchema = z
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
        message:
          "Debe seleccionar al menos una opción: contenedores o carga especial",
        path: ["manejaContenedores"],
      });
    }
  });

export type FormularioStraddleCarrierSchema = z.infer<
  typeof formularioStraddleCarrierSchema
>;
