import { Prisma } from "@prisma/client";
import { ArchivoSubido } from "@/schemas/visits";

import {
  CreateFormularioCSSData,
  CreateFormularioIndustrialData,
  CreateFormularioLogisticaData,
  CreateFormularioStraddleCarrierData,
} from "@/interfaces/visits";

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
    contenedorMedida: data.contenedorMedida,
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

/**
 * Build Prisma upsert operation for FormularioCSSAnalisis
 */
export function buildFormularioUpsert(data: CreateFormularioCSSData) {
  const transformedData = transformFormularioCSSData(data);
  const newArchivos = data.archivos?.filter(
    (archivo) => archivo.cloudinaryId && archivo.cloudinaryUrl
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

// ==================== FORMULARIO INDUSTRIAL DATA HELPERS ====================
/**
 * Transform FormularioIndustrialData to Prisma create/update format
 */
export function transformFormularioIndustrialData(
  data: CreateFormularioIndustrialData
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
 */
export function buildFormularioIndustrialUpsert(
  data: CreateFormularioIndustrialData
) {
  const transformedData = transformFormularioIndustrialData(data);

  const newArchivos = data.archivos?.filter(
    (archivo) => archivo.cloudinaryId && archivo.cloudinaryUrl
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
      ...transformedData,
      ...archivosCreate,
    },
  };
}

/**
 * Build Prisma create operation for new visit with FormularioIndustrialAnalisis
 */
export function buildFormularioIndustrialCreate(
  data: CreateFormularioIndustrialData
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
  data: CreateFormularioLogisticaData
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
 */
export function buildFormularioLogisticaUpsert(
  data: CreateFormularioLogisticaData
) {
  const transformedData = transformFormularioLogisticaData(data);

  const newArchivos = data.archivos?.filter(
    (archivo) => archivo.cloudinaryId && archivo.cloudinaryUrl
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
      ...transformedData,
      ...archivosCreate,
    },
  };
}

/**
 * Build Prisma create operation for new visit with FormularioLogisticaAnalisis
 */
export function buildFormularioLogisticaCreate(
  data: CreateFormularioLogisticaData
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
  data: CreateFormularioStraddleCarrierData
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
 */
export function buildFormularioStraddleCarrierUpsert(
  data: CreateFormularioStraddleCarrierData
) {
  const transformedData = transformFormularioStraddleCarrierData(data);

  const newArchivos = data.archivos?.filter(
    (archivo) => archivo.cloudinaryId && archivo.cloudinaryUrl
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
      ...transformedData,
      ...archivosCreate,
    },
  };
}

/**
 * Build Prisma create operation for new visit with FormularioStraddleCarrierAnalisis
 */
export function buildFormularioStraddleCarrierCreate(
  data: CreateFormularioStraddleCarrierData
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
