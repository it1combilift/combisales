import { ContenedorMedida } from "@prisma/client";
import { Customer } from "@/interfaces/visits";
import { FormularioCSSSchema } from "@/schemas/visits";

/**
 * Generate default form values for new visit
 * Prefills data from customer information
 */
export function getDefaultValuesForNew(
  customer: Customer
): FormularioCSSSchema {
  return {
    // Step 1: Company
    razonSocial: customer.razonSocial || customer.accountName || "",
    personaContacto: customer.zohoOwnerName || "",
    email: customer.email || "",
    numeroIdentificacionFiscal: customer.cif || "",
    website: customer.website || "",

    // Step 2: Address
    direccion: customer.billingStreet || customer.shippingStreet || "",
    localidad: customer.billingCity || customer.shippingCity || "",
    provinciaEstado:
      customer.billingState ||
      customer.shippingState ||
      customer.comunidadAutonoma ||
      "",
    pais: customer.billingCountry || customer.shippingCountry || "",
    codigoPostal: customer.billingCode || customer.shippingCode || "",

    // Step 3: Commercial
    distribuidor: customer.zohoOwnerName || "",
    contactoDistribuidor: customer.zohoOwnerEmail || "",
    datosClienteUsuarioFinal: "",

    // Step 4-7: Empty fields
    descripcionProducto: "",
    contenedorTipos: [],
    condicionesSuelo: "",
    contenedorMedidas: [],
    contenedorMedidaOtro: "",
    archivos: [],
  };
}

/**
 * Generate default form values for editing existing visit
 * Maps database formulario data to form schema
 */
export function getDefaultValuesForEdit(formulario: any): FormularioCSSSchema {
  return {
    // Step 1: Company
    razonSocial: formulario.razonSocial || "",
    personaContacto: formulario.personaContacto || "",
    email: formulario.email || "",
    numeroIdentificacionFiscal: formulario.numeroIdentificacionFiscal || "",
    website: formulario.website || "",

    // Step 2: Address
    direccion: formulario.direccion || "",
    localidad: formulario.localidad || "",
    provinciaEstado: formulario.provinciaEstado || "",
    pais: formulario.pais || "",
    codigoPostal: formulario.codigoPostal || "",

    // Step 3: Commercial
    distribuidor: formulario.distribuidor || "",
    contactoDistribuidor: formulario.contactoDistribuidor || "",
    datosClienteUsuarioFinal: formulario.datosClienteUsuarioFinal || "",
    fechaCierre: formulario.fechaCierre
      ? new Date(formulario.fechaCierre)
      : undefined,

    // Step 4: Product description
    descripcionProducto: formulario.descripcionProducto || "",

    // Step 5: Container types
    contenedorTipos: formulario.contenedorTipos || [],
    contenedoresPorSemana: formulario.contenedoresPorSemana || undefined,
    condicionesSuelo: formulario.condicionesSuelo || "",

    // Step 6: Container measurements
    contenedorMedidas: formulario.contenedorMedidas || [],
    contenedorMedidaOtro: formulario.contenedorMedidaOtro || "",

    // Step 7: Files
    archivos:
      formulario.archivos?.map((archivo: any) => ({
        nombre: archivo.nombre,
        tipoArchivo: archivo.tipoArchivo,
        mimeType: archivo.mimeType,
        tamanio: archivo.tamanio,
        cloudinaryId: archivo.cloudinaryId,
        cloudinaryUrl: archivo.cloudinaryUrl,
        cloudinaryType: archivo.cloudinaryType,
        ancho: archivo.ancho ?? undefined,
        alto: archivo.alto ?? undefined,
        duracion: archivo.duracion ?? undefined,
        formato: archivo.formato,
      })) ?? [],
  };
}
