import { Customer } from "@/interfaces/visits";
import { FormularioStraddleCarrierSchema } from "../schemas";

/**
 * Generate default form values for new visit
 * Prefills data from customer information
 */
export function getDefaultValuesForNew(
  customer: Customer
): FormularioStraddleCarrierSchema {
  return {
    // Datos del cliente
    razonSocial: customer.razonSocial || customer.accountName || "",
    personaContacto: "",
    email: customer.email || "",
    direccion: customer.shippingStreet || customer.billingStreet || "",
    localidad: customer.shippingCity || customer.billingCity || "",
    provinciaEstado: customer.shippingState || customer.billingState || "",
    pais: customer.shippingCountry || customer.billingCountry || "",
    codigoPostal: customer.shippingCode || customer.billingCode || "",
    website: customer.website || "",
    numeroIdentificacionFiscal: customer.cif || "",
    distribuidor: "",
    contactoDistribuidor: "",
    fechaCierre: null,

    // Instrucciones
    manejaContenedores: false,
    manejaCargaEspecial: false,

    // Cuadro 1 - Contenedores
    manejaContenedoresIndiv: false,
    dobleApilamiento: false,
    contenedoresTamanios: {
      size20ft: { selected: false, cantidad: null },
      size30ft: { selected: false, cantidad: null },
      size40ft: { selected: false, cantidad: null },
      size45ft: { selected: false, cantidad: null },
      size53ft: { selected: false, cantidad: null },
    },
    pesoMaximoContenedor: null,
    infoAdicionalContenedores: "",

    // Cuadro 2 - Carga especial
    productoMasLargo: null,
    productoMasCorto: null,
    productoMasAncho: null,
    productoMasEstrecho: null,
    puntosElevacionLongitud: null,
    puntosElevacionAncho: null,
    pesoMaximoProductoLargo: null,
    pesoMaximoProductoCorto: null,
    productoMasAlto: null,

    // Otros
    zonasPasoAncho: null,
    zonasPasoAlto: null,
    condicionesPiso: "",
    pisoPlano: true,
    restriccionesAltura: null,
    restriccionesAnchura: null,
    notasAdicionales: "",

    // Archivos
    archivos: [],
  };
}

/**
 * Generate default form values for editing existing visit
 * Maps database formulario data to form schema
 */
export function getDefaultValuesForEdit(
  formulario: any
): FormularioStraddleCarrierSchema {
  return {
    // Datos del cliente
    razonSocial: formulario.razonSocial || "",
    personaContacto: formulario.personaContacto || "",
    email: formulario.email || "",
    direccion: formulario.direccion || "",
    localidad: formulario.localidad || "",
    provinciaEstado: formulario.provinciaEstado || "",
    pais: formulario.pais || "",
    codigoPostal: formulario.codigoPostal || "",
    website: formulario.website || "",
    numeroIdentificacionFiscal: formulario.numeroIdentificacionFiscal || "",
    distribuidor: formulario.distribuidor || "",
    contactoDistribuidor: formulario.contactoDistribuidor || "",
    fechaCierre: formulario.fechaCierre
      ? new Date(formulario.fechaCierre)
      : null,

    // Instrucciones
    manejaContenedores: formulario.manejaContenedores || false,
    manejaCargaEspecial: formulario.manejaCargaEspecial || false,

    // Cuadro 1 - Contenedores
    manejaContenedoresIndiv: formulario.manejaContenedoresIndiv || false,
    dobleApilamiento: formulario.dobleApilamiento || false,
    contenedoresTamanios: formulario.contenedoresTamanios || {
      size20ft: { selected: false, cantidad: null },
      size30ft: { selected: false, cantidad: null },
      size40ft: { selected: false, cantidad: null },
      size45ft: { selected: false, cantidad: null },
      size53ft: { selected: false, cantidad: null },
    },
    pesoMaximoContenedor: formulario.pesoMaximoContenedor,
    infoAdicionalContenedores: formulario.infoAdicionalContenedores || "",

    // Cuadro 2 - Carga especial
    productoMasLargo: formulario.productoMasLargo,
    productoMasCorto: formulario.productoMasCorto,
    productoMasAncho: formulario.productoMasAncho,
    productoMasEstrecho: formulario.productoMasEstrecho,
    puntosElevacionLongitud: formulario.puntosElevacionLongitud,
    puntosElevacionAncho: formulario.puntosElevacionAncho,
    pesoMaximoProductoLargo: formulario.pesoMaximoProductoLargo,
    pesoMaximoProductoCorto: formulario.pesoMaximoProductoCorto,
    productoMasAlto: formulario.productoMasAlto,

    // Otros
    zonasPasoAncho: formulario.zonasPasoAncho,
    zonasPasoAlto: formulario.zonasPasoAlto,
    condicionesPiso: formulario.condicionesPiso || "",
    pisoPlano: formulario.pisoPlano ?? true,
    restriccionesAltura: formulario.restriccionesAltura,
    restriccionesAnchura: formulario.restriccionesAnchura,
    notasAdicionales: formulario.notasAdicionales || "",

    // Archivos
    archivos: formulario.archivos || [],
  };
}
