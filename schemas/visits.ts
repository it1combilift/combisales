import { z } from "zod";
import { ContenedorTipo, ContenedorMedida } from "@prisma/client";

// Schema para el formulario CSS Análisis
export const formularioCSSSchema = z.object({
  // Datos del cliente
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

  // Descripción del producto
  descripcionProducto: z
    .string()
    .min(10, "Debe proporcionar una descripción detallada"),
  fotosVideosUrls: z.array(z.string().url()).optional(),

  // Datos del contenedor
  contenedorTipos: z
    .array(z.nativeEnum(ContenedorTipo))
    .min(1, "Selecciona al menos un tipo"),
  contenedoresPorSemana: z.coerce.number().int().positive().optional(),
  condicionesSuelo: z.string().optional(),

  // Medidas del contenedor
  contenedorMedida: z.nativeEnum(ContenedorMedida),
  contenedorMedidaOtro: z.string().optional(),
});

export type FormularioCSSSchema = z.infer<typeof formularioCSSSchema>;
