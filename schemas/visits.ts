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
  razonSocial: z.string().min(2, "La razón social es requerida"),
  personaContacto: z.string().min(2, "La persona de contacto es requerida"),
  email: z.string().email("Email inválido"),
  direccion: z.string().min(5, "La dirección es requerida"),
  localidad: z.string().min(2, "La localidad es requerida"),
  provinciaEstado: z.string().min(2, "La provincia/estado es requerida"),
  pais: z.string().min(2, "El país es requerido"),
  codigoPostal: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  numeroIdentificacionFiscal: z.string().optional(),
  distribuidor: z.string().optional(),
  contactoDistribuidor: z.string().optional(),
  fechaCierre: z.date().optional(),
  datosClienteUsuarioFinal: z.string().optional(),
  descripcionProducto: z
    .string()
    .min(10, "Debe proporcionar una descripción detallada"),

  contenedorTipos: z
    .array(z.nativeEnum(ContenedorTipo))
    .min(1, "Selecciona al menos un tipo"),
  contenedoresPorSemana: z.coerce.number().int().positive().optional(),
  condicionesSuelo: z.string().optional(),
  contenedorMedida: z.nativeEnum(ContenedorMedida),
  contenedorMedidaOtro: z.string().optional(),

  archivos: z.array(archivoSubidoSchema).optional().default([]),
});

export type FormularioCSSSchema = z.infer<typeof formularioCSSSchema>;
