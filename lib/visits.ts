import { Prisma } from "@prisma/client";
import { ArchivoSubido } from "@/schemas/visits";
import { CreateFormularioCSSData } from "@/interfaces/visits";

// ==================== PRISMA INCLUDES ====================
/**
 * Common include pattern for visit queries
 */
export const VISIT_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  customer: true,
  formularioCSSAnalisis: {
    include: {
      archivos: true,
    },
  },
} satisfies Prisma.VisitInclude;

// ==================== FORMULARIO CSS DATA HELPERS ====================
/**
 * Transform FormularioCSSData to Prisma create/update format
 * Eliminates code duplication between create and update operations
 */
export function transformFormularioCSSData(data: CreateFormularioCSSData) {
  return {
    razonSocial: data.razonSocial,
    personaContacto: data.personaContacto,
    email: data.email,
    direccion: data.direccion,
    localidad: data.localidad,
    provinciaEstado: data.provinciaEstado,
    pais: data.pais,
    codigoPostal: data.codigoPostal || null,
    website: data.website || null,
    numeroIdentificacionFiscal: data.numeroIdentificacionFiscal || null,
    distribuidor: data.distribuidor || null,
    contactoDistribuidor: data.contactoDistribuidor || null,
    fechaCierre: data.fechaCierre || null,
    datosClienteUsuarioFinal: data.datosClienteUsuarioFinal || null,
    descripcionProducto: data.descripcionProducto,
    contenedorTipos: data.contenedorTipos,
    contenedoresPorSemana: data.contenedoresPorSemana || null,
    condicionesSuelo: data.condicionesSuelo || null,
    contenedorMedida: data.contenedorMedida,
    contenedorMedidaOtro: data.contenedorMedidaOtro || null,
  };
}

/**
 * Transform archivos array to Prisma create format
 */
function transformArchivos(archivos: ArchivoSubido[]) {
  return archivos.map((archivo) => {
    // Ensure formato always has a value - fallback to file extension if missing
    const fileExtension =
      archivo.nombre.split(".").pop()?.toLowerCase() || "unknown";
    const formato = archivo.formato || fileExtension;

    return {
      nombre: archivo.nombre,
      tipoArchivo: archivo.tipoArchivo,
      mimeType: archivo.mimeType,
      tamanio: archivo.tamanio,
      cloudinaryId: archivo.cloudinaryId,
      cloudinaryUrl: archivo.cloudinaryUrl,
      cloudinaryType: archivo.cloudinaryType,
      ancho: archivo.ancho,
      alto: archivo.alto,
      duracion: archivo.duracion,
      formato: formato,
    };
  });
}

/**
 * Build Prisma upsert operation for FormularioCSSAnalisis
 */
export function buildFormularioUpsert(data: CreateFormularioCSSData) {
  const transformedData = transformFormularioCSSData(data);

  // Handle archivos: for update, we need to handle both existing and new files
  // New files (without id) should be created, existing files are already in DB
  const newArchivos = data.archivos?.filter(
    (archivo) => archivo.cloudinaryId && archivo.cloudinaryUrl
  );

  const archivosCreate = newArchivos?.length
    ? {
        archivos: {
          // Use createMany with skipDuplicates to avoid duplicate cloudinaryId errors
          createMany: {
            data: transformArchivos(newArchivos),
            skipDuplicates: true,
          },
        },
      }
    : {};

  return {
    create: {
      ...transformedData,
      ...archivosCreate,
    },
    update: {
      ...transformedData,
      ...archivosCreate,
    },
  };
}

/**
 * Build Prisma create operation for new visit with FormularioCSSAnalisis
 */
export function buildFormularioCreate(data: CreateFormularioCSSData) {
  const transformedData = transformFormularioCSSData(data);

  const archivosCreate = data.archivos?.length
    ? {
        archivos: {
          create: transformArchivos(data.archivos),
        },
      }
    : {};

  return {
    ...transformedData,
    ...archivosCreate,
  };
}
