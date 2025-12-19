import { z } from "zod";
import { ContenedorTipo, ContenedorMedida, TipoArchivo } from "@prisma/client";

// Schema para archivos subidos
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

export const formularioCSSSchema = z.object({
  // Campos pre-llenados desde customer (opcionales - pueden venir vacíos del CRM)
  razonSocial: z.string().optional().default(""),
  personaContacto: z.string().optional().default(""),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  direccion: z.string().optional().default(""),
  localidad: z.string().optional().default(""),
  provinciaEstado: z.string().optional().default(""),
  pais: z.string().optional().default(""),
  codigoPostal: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  numeroIdentificacionFiscal: z.string().optional(),
  distribuidor: z.string().optional(),
  contactoDistribuidor: z.string().optional(),
  fechaCierre: z.date().optional(),
  datosClienteUsuarioFinal: z.string().optional(),

  // Campos editables por el usuario (requeridos)
  descripcionProducto: z
    .string()
    .min(10, "Debe proporcionar una descripción detallada"),

  contenedorTipos: z
    .array(z.nativeEnum(ContenedorTipo))
    .min(1, "Selecciona al menos un tipo"),
  contenedoresPorSemana: z.coerce.number().int().positive().optional(),
  condicionesSuelo: z.string().optional(),
  contenedorMedidas: z
    .array(z.nativeEnum(ContenedorMedida))
    .min(1, "Selecciona al menos una medida"),
  contenedorMedidaOtro: z.string().optional(),

  archivos: z.array(archivoSubidoSchema).optional().default([]),
});

export type FormularioCSSSchema = z.infer<typeof formularioCSSSchema>;
