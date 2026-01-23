import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ArchivoSubido } from "@/schemas/visits";
import { deleteFromCloudinary } from "@/lib/cloudinary";

import {
  CreateFormularioCSSData,
  CreateFormularioIndustrialData,
  CreateFormularioLogisticaData,
  CreateFormularioStraddleCarrierData,
} from "@/interfaces/visits";

// ==================== PRISMA INCLUDES ====================
/**
 * Common include pattern for visit queries
 * Includes clonedFrom with formularios and archivos for cloned visits
 * to display original dealer's files in the cloned visit
 */
export const VISIT_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  // Vendedor asignado (para visitas creadas por DEALER)
  assignedSeller: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  // Clones of this visit (for checking if original has been cloned)
  // Used in Phase 4: Unified row logic for SELLER view
  clones: {
    select: {
      id: true,
      status: true,
      visitDate: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  // Visita original (si esta es un clon)
  // Incluye los formularios con archivos para mostrar los adjuntos del original
  clonedFrom: {
    select: {
      id: true,
      visitDate: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      // Include original visit's forms with files for cloned visits
      formularioCSSAnalisis: {
        include: {
          archivos: true,
        },
      },
      formularioIndustrialAnalisis: {
        include: {
          archivos: true,
        },
      },
      formularioLogisticaAnalisis: {
        include: {
          archivos: true,
        },
      },
      formularioStraddleCarrierAnalisis: {
        include: {
          archivos: true,
        },
      },
    },
  },
  customer: true,
  formularioCSSAnalisis: {
    include: {
      archivos: true,
    },
  },
  formularioIndustrialAnalisis: {
    include: {
      archivos: true,
    },
  },
  formularioLogisticaAnalisis: {
    include: {
      archivos: true,
    },
  },
  formularioStraddleCarrierAnalisis: {
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
    contenedorMedidas: data.contenedorMedidas,
    contenedorMedidaOtro: data.contenedorMedidaOtro || null,
  };
}

/**
 * Transform archivos array to Prisma create format
 */
function transformArchivos(archivos: ArchivoSubido[]) {
  return archivos.map((archivo) => {
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

// ==================== ARCHIVO SYNC HELPERS ====================
/**
 * Sync files for a formulario - delete removed files, add new ones
 * This ensures files in DB match what's sent from frontend
 */
export async function syncFormularioArchivos(
  formularioId: string,
  newArchivos: ArchivoSubido[],
  tableName:
    | "FormularioArchivo"
    | "FormularioArchivoIndustrial"
    | "FormularioArchivoLogistica"
    | "FormularioArchivoStraddleCarrier",
) {
  // Get current files from database
  let existingArchivos: { cloudinaryId: string; cloudinaryType: string }[] = [];

  switch (tableName) {
    case "FormularioArchivo":
      existingArchivos = await prisma.formularioArchivo.findMany({
        where: { formularioId },
        select: { cloudinaryId: true, cloudinaryType: true },
      });
      break;
    case "FormularioArchivoIndustrial":
      existingArchivos = await prisma.formularioArchivoIndustrial.findMany({
        where: { formularioId },
        select: { cloudinaryId: true, cloudinaryType: true },
      });
      break;
    case "FormularioArchivoLogistica":
      existingArchivos = await prisma.formularioArchivoLogistica.findMany({
        where: { formularioId },
        select: { cloudinaryId: true, cloudinaryType: true },
      });
      break;
    case "FormularioArchivoStraddleCarrier":
      existingArchivos = await prisma.formularioArchivoStraddleCarrier.findMany(
        {
          where: { formularioId },
          select: { cloudinaryId: true, cloudinaryType: true },
        },
      );
      break;
  }

  const existingIds = new Set(existingArchivos.map((a) => a.cloudinaryId));
  const newIds = new Set(newArchivos.map((a) => a.cloudinaryId));

  // Find files to delete (exist in DB but not in new list)
  const toDelete = existingArchivos.filter((a) => !newIds.has(a.cloudinaryId));

  // Find files to add (exist in new list but not in DB)
  const toAdd = newArchivos.filter((a) => !existingIds.has(a.cloudinaryId));

  // Delete removed files from DB and Cloudinary
  if (toDelete.length > 0) {
    const deleteIds = toDelete.map((a) => a.cloudinaryId);

    // CRITICAL: Delete ONLY from this specific formulario to maintain isolation
    // This prevents deleting files from original visit when syncing clone
    switch (tableName) {
      case "FormularioArchivo":
        await prisma.formularioArchivo.deleteMany({
          where: {
            cloudinaryId: { in: deleteIds },
            formularioId: formularioId, // Only delete from THIS formulario
          },
        });
        break;
      case "FormularioArchivoIndustrial":
        await prisma.formularioArchivoIndustrial.deleteMany({
          where: {
            cloudinaryId: { in: deleteIds },
            formularioId: formularioId,
          },
        });
        break;
      case "FormularioArchivoLogistica":
        await prisma.formularioArchivoLogistica.deleteMany({
          where: {
            cloudinaryId: { in: deleteIds },
            formularioId: formularioId,
          },
        });
        break;
      case "FormularioArchivoStraddleCarrier":
        await prisma.formularioArchivoStraddleCarrier.deleteMany({
          where: {
            cloudinaryId: { in: deleteIds },
            formularioId: formularioId,
          },
        });
        break;
    }

    // Check if files are shared with other visits before deleting from Cloudinary
    // Only delete from Cloudinary if NO other formularios reference these files
    for (const archivo of toDelete) {
      const [countCSS, countIndustrial, countLogistica, countStraddle] =
        await Promise.all([
          prisma.formularioArchivo.count({
            where: {
              cloudinaryId: archivo.cloudinaryId,
              formularioId: { not: formularioId },
            },
          }),
          prisma.formularioArchivoIndustrial.count({
            where: {
              cloudinaryId: archivo.cloudinaryId,
              formularioId: { not: formularioId },
            },
          }),
          prisma.formularioArchivoLogistica.count({
            where: {
              cloudinaryId: archivo.cloudinaryId,
              formularioId: { not: formularioId },
            },
          }),
          prisma.formularioArchivoStraddleCarrier.count({
            where: {
              cloudinaryId: archivo.cloudinaryId,
              formularioId: { not: formularioId },
            },
          }),
        ]);

      const isSharedFile =
        countCSS + countIndustrial + countLogistica + countStraddle > 0;

      if (!isSharedFile) {
        // Safe to delete from Cloudinary - no other visits using it
        deleteFromCloudinary(
          archivo.cloudinaryId,
          archivo.cloudinaryType as "image" | "video" | "raw",
        ).catch((err) => {
          console.error(
            `[syncArchivos] Failed to delete from Cloudinary: ${archivo.cloudinaryId}`,
            err,
          );
        });
      } else {
        console.log(
          `[syncArchivos] File ${archivo.cloudinaryId} shared with other visits, keeping in Cloudinary`,
        );
      }
    }

    console.log(
      `[syncArchivos] Deleted ${toDelete.length} files from ${tableName} (formulario: ${formularioId})`,
    );
  }

  // ==================== CREATE NEW FILES ====================
  // Add files that exist in the new list but not in the database
  if (toAdd.length > 0) {
    const filesToCreate = toAdd.map((archivo) => ({
      formularioId,
      nombre: archivo.nombre,
      tipoArchivo: archivo.tipoArchivo,
      mimeType: archivo.mimeType,
      tamanio: archivo.tamanio,
      cloudinaryId: archivo.cloudinaryId,
      cloudinaryUrl: archivo.cloudinaryUrl,
      cloudinaryType: archivo.cloudinaryType,
      ancho: archivo.ancho ?? null,
      alto: archivo.alto ?? null,
      duracion: archivo.duracion ?? null,
      formato: archivo.formato,
    }));

    switch (tableName) {
      case "FormularioArchivo":
        await prisma.formularioArchivo.createMany({
          data: filesToCreate,
          skipDuplicates: true,
        });
        break;
      case "FormularioArchivoIndustrial":
        await prisma.formularioArchivoIndustrial.createMany({
          data: filesToCreate,
          skipDuplicates: true,
        });
        break;
      case "FormularioArchivoLogistica":
        await prisma.formularioArchivoLogistica.createMany({
          data: filesToCreate,
          skipDuplicates: true,
        });
        break;
      case "FormularioArchivoStraddleCarrier":
        await prisma.formularioArchivoStraddleCarrier.createMany({
          data: filesToCreate,
          skipDuplicates: true,
        });
        break;
    }

    console.log(
      `[syncArchivos] Created ${toAdd.length} new files in ${tableName} (formulario: ${formularioId})`,
    );
  }

  return { toAdd, toDelete };
}

/**
 * Build Prisma upsert operation for FormularioCSSAnalisis
 * IMPORTANT: archivos are NOT included in update operations
 * File sync is handled separately via syncFormularioArchivos() before calling this
 */
export function buildFormularioUpsert(data: CreateFormularioCSSData) {
  const transformedData = transformFormularioCSSData(data);
  const newArchivos = data.archivos?.filter(
    (archivo) => archivo.cloudinaryId && archivo.cloudinaryUrl,
  );

  const archivosCreate = newArchivos?.length
    ? {
        archivos: {
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
      // NOTE: archivos are NOT updated here - they're synced separately
      // This prevents duplicate file creation on every save
      ...transformedData,
      // archivosCreate intentionally omitted
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

// ==================== FORMULARIO INDUSTRIAL DATA HELPERS ====================
/**
 * Transform FormularioIndustrialData to Prisma create/update format
 */
export function transformFormularioIndustrialData(
  data: CreateFormularioIndustrialData,
) {
  return {
    razonSocial: data.razonSocial,
    personaContacto: data.personaContacto,
    email: data.email,
    direccion: data.direccion,
    localidad: data.localidad,
    provinciaEstado: data.provinciaEstado,
    pais: data.pais,
    codigoPostal: data.codigoPostal,
    website: data.website || null,
    numeroIdentificacionFiscal: data.numeroIdentificacionFiscal,
    distribuidor: data.distribuidor || null,
    contactoDistribuidor: data.contactoDistribuidor || null,
    fechaCierre: data.fechaCierre || null,
    notasOperacion: data.notasOperacion,
    descripcionProducto: data.descripcionProducto,
    alturaUltimoNivelEstanteria: data.alturaUltimoNivelEstanteria || null,
    maximaAlturaElevacion: data.maximaAlturaElevacion || null,
    pesoCargaMaximaAltura: data.pesoCargaMaximaAltura || null,
    pesoCargaPrimerNivel: data.pesoCargaPrimerNivel || null,
    dimensionesAreaTrabajoAncho: data.dimensionesAreaTrabajoAncho || null,
    dimensionesAreaTrabajoFondo: data.dimensionesAreaTrabajoFondo || null,
    turnosTrabajo: data.turnosTrabajo || null,
    fechaEstimadaDefinicion: data.fechaEstimadaDefinicion || null,
    alimentacionDeseada: data.alimentacionDeseada as any,
    equiposElectricos: data.equiposElectricos || null,
    dimensionesCargas: data.dimensionesCargas,
    especificacionesPasillo: data.especificacionesPasillo,
  };
}

/**
 * Transform archivos array for Industrial to Prisma create format
 */
function transformArchivosIndustrial(archivos: ArchivoSubido[]) {
  return archivos.map((archivo) => {
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
 * Build Prisma upsert operation for FormularioIndustrialAnalisis
 * IMPORTANT: archivos are NOT included in update operations
 * File sync is handled separately via syncFormularioArchivos() before calling this
 */
export function buildFormularioIndustrialUpsert(
  data: CreateFormularioIndustrialData,
) {
  const transformedData = transformFormularioIndustrialData(data);

  const newArchivos = data.archivos?.filter(
    (archivo) => archivo.cloudinaryId && archivo.cloudinaryUrl,
  );

  const archivosCreate = newArchivos?.length
    ? {
        archivos: {
          createMany: {
            data: transformArchivosIndustrial(newArchivos),
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
      // NOTE: archivos are NOT updated here - they're synced separately
      // This prevents duplicate file creation on every save
      ...transformedData,
      // archivosCreate intentionally omitted
    },
  };
}

/**
 * Build Prisma create operation for new visit with FormularioIndustrialAnalisis
 */
export function buildFormularioIndustrialCreate(
  data: CreateFormularioIndustrialData,
) {
  const transformedData = transformFormularioIndustrialData(data);

  const archivosCreate = data.archivos?.length
    ? {
        archivos: {
          create: transformArchivosIndustrial(data.archivos),
        },
      }
    : {};

  return {
    ...transformedData,
    ...archivosCreate,
  };
}

// ==================== FORMULARIO LOGÍSTICA DATA HELPERS ====================
/**
 * Transform FormularioLogisticaData to Prisma create/update format
 */
export function transformFormularioLogisticaData(
  data: CreateFormularioLogisticaData,
) {
  return {
    razonSocial: data.razonSocial,
    personaContacto: data.personaContacto,
    email: data.email,
    direccion: data.direccion,
    localidad: data.localidad,
    provinciaEstado: data.provinciaEstado,
    pais: data.pais,
    codigoPostal: data.codigoPostal,
    website: data.website || null,
    numeroIdentificacionFiscal: data.numeroIdentificacionFiscal,
    distribuidor: data.distribuidor || null,
    contactoDistribuidor: data.contactoDistribuidor || null,
    fechaCierre: data.fechaCierre || null,
    notasOperacion: data.notasOperacion,
    tieneRampas: data.tieneRampas || false,
    notasRampas: data.notasRampas || null,
    tienePasosPuertas: data.tienePasosPuertas || false,
    notasPasosPuertas: data.notasPasosPuertas || null,
    tieneRestricciones: data.tieneRestricciones || false,
    notasRestricciones: data.notasRestricciones || null,
    alturaMaximaNave: data.alturaMaximaNave || null,
    anchoPasilloActual: data.anchoPasilloActual || null,
    superficieTrabajo: data.superficieTrabajo || null,
    condicionesSuelo: data.condicionesSuelo || null,
    tipoOperacion: data.tipoOperacion || null,
    descripcionProducto: data.descripcionProducto,
    alturaUltimoNivelEstanteria: data.alturaUltimoNivelEstanteria || null,
    maximaAlturaElevacion: data.maximaAlturaElevacion || null,
    pesoCargaMaximaAltura: data.pesoCargaMaximaAltura || null,
    pesoCargaPrimerNivel: data.pesoCargaPrimerNivel || null,
    dimensionesAreaTrabajoAncho: data.dimensionesAreaTrabajoAncho || null,
    dimensionesAreaTrabajoFondo: data.dimensionesAreaTrabajoFondo || null,
    turnosTrabajo: data.turnosTrabajo || null,
    fechaEstimadaDefinicion: data.fechaEstimadaDefinicion || null,
    alimentacionDeseada: data.alimentacionDeseada as any,
    equiposElectricos: data.equiposElectricos || null,
    dimensionesCargas: data.dimensionesCargas,
    pasilloActual: data.pasilloActual,
  };
}

/**
 * Transform archivos array for Logística to Prisma create format
 */
function transformArchivosLogistica(archivos: ArchivoSubido[]) {
  return archivos.map((archivo) => {
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
 * Build Prisma upsert operation for FormularioLogisticaAnalisis
 * IMPORTANT: archivos are NOT included in update operations
 * File sync is handled separately via syncFormularioArchivos() before calling this
 */
export function buildFormularioLogisticaUpsert(
  data: CreateFormularioLogisticaData,
) {
  const transformedData = transformFormularioLogisticaData(data);

  const newArchivos = data.archivos?.filter(
    (archivo) => archivo.cloudinaryId && archivo.cloudinaryUrl,
  );

  const archivosCreate = newArchivos?.length
    ? {
        archivos: {
          createMany: {
            data: transformArchivosLogistica(newArchivos),
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
      // NOTE: archivos are NOT updated here - they're synced separately
      // This prevents duplicate file creation on every save
      ...transformedData,
      // archivosCreate intentionally omitted
    },
  };
}

/**
 * Build Prisma create operation for new visit with FormularioLogisticaAnalisis
 */
export function buildFormularioLogisticaCreate(
  data: CreateFormularioLogisticaData,
) {
  const transformedData = transformFormularioLogisticaData(data);

  const archivosCreate = data.archivos?.length
    ? {
        archivos: {
          create: transformArchivosLogistica(data.archivos),
        },
      }
    : {};

  return {
    ...transformedData,
    ...archivosCreate,
  };
}

// ==================== FORMULARIO STRADDLE CARRIER DATA HELPERS ====================
/**
 * Transform FormularioStraddleCarrierData to Prisma create/update format
 */
export function transformFormularioStraddleCarrierData(
  data: CreateFormularioStraddleCarrierData,
) {
  return {
    razonSocial: data.razonSocial,
    personaContacto: data.personaContacto,
    email: data.email,
    direccion: data.direccion,
    localidad: data.localidad,
    provinciaEstado: data.provinciaEstado,
    pais: data.pais,
    codigoPostal: data.codigoPostal,
    website: data.website || null,
    numeroIdentificacionFiscal: data.numeroIdentificacionFiscal,
    distribuidor: data.distribuidor || null,
    contactoDistribuidor: data.contactoDistribuidor || null,
    fechaCierre: data.fechaCierre || null,
    // Cuadro 1 - Contenedores
    manejaContenedores: data.manejaContenedores || false,
    manejaContenedoresIndiv: data.manejaContenedoresIndiv || false,
    dobleApilamiento: data.dobleApilamiento || false,
    contenedoresTamanios: data.contenedoresTamanios || null,
    pesoMaximoContenedor: data.pesoMaximoContenedor || null,
    infoAdicionalContenedores: data.infoAdicionalContenedores || null,
    // Cuadro 2 - Carga especial
    manejaCargaEspecial: data.manejaCargaEspecial || false,
    productoMasLargo: data.productoMasLargo || null,
    productoMasCorto: data.productoMasCorto || null,
    productoMasAncho: data.productoMasAncho || null,
    productoMasEstrecho: data.productoMasEstrecho || null,
    puntosElevacionLongitud: data.puntosElevacionLongitud || null,
    puntosElevacionAncho: data.puntosElevacionAncho || null,
    pesoMaximoProductoLargo: data.pesoMaximoProductoLargo || null,
    pesoMaximoProductoCorto: data.pesoMaximoProductoCorto || null,
    productoMasAlto: data.productoMasAlto || null,
    // Otros
    zonasPasoAncho: data.zonasPasoAncho || null,
    zonasPasoAlto: data.zonasPasoAlto || null,
    condicionesPiso: data.condicionesPiso || null,
    pisoPlano: data.pisoPlano ?? true,
    restriccionesAltura: data.restriccionesAltura || null,
    restriccionesAnchura: data.restriccionesAnchura || null,
    notasAdicionales: data.notasAdicionales || null,
  };
}

/**
 * Transform archivos array for Straddle Carrier to Prisma create format
 */
function transformArchivosStraddleCarrier(archivos: ArchivoSubido[]) {
  return archivos.map((archivo) => {
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
 * Build Prisma upsert operation for FormularioStraddleCarrierAnalisis
 * IMPORTANT: archivos are NOT included in update operations
 * File sync is handled separately via syncFormularioArchivos() before calling this
 */
export function buildFormularioStraddleCarrierUpsert(
  data: CreateFormularioStraddleCarrierData,
) {
  const transformedData = transformFormularioStraddleCarrierData(data);

  const newArchivos = data.archivos?.filter(
    (archivo) => archivo.cloudinaryId && archivo.cloudinaryUrl,
  );

  const archivosCreate = newArchivos?.length
    ? {
        archivos: {
          createMany: {
            data: transformArchivosStraddleCarrier(newArchivos),
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
      // NOTE: archivos are NOT updated here - they're synced separately
      // This prevents duplicate file creation on every save
      ...transformedData,
      // archivosCreate intentionally omitted
    },
  };
}

/**
 * Build Prisma create operation for new visit with FormularioStraddleCarrierAnalisis
 */
export function buildFormularioStraddleCarrierCreate(
  data: CreateFormularioStraddleCarrierData,
) {
  const transformedData = transformFormularioStraddleCarrierData(data);

  const archivosCreate = data.archivos?.length
    ? {
        archivos: {
          create: transformArchivosStraddleCarrier(data.archivos),
        },
      }
    : {};

  return {
    ...transformedData,
    ...archivosCreate,
  };
}
