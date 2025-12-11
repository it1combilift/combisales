import { Customer } from "@/interfaces/visits";
import { TipoAlimentacion } from "@prisma/client";
import { FormularioIndustrialSchema } from "../schemas";

/**
 * Generate default form values for new visit
 * Prefills data from customer information
 */
export function getDefaultValuesForNew(
  customer: Customer
): FormularioIndustrialSchema {
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

    // Descripción operación
    notasOperacion: "",

    // Datos aplicación
    descripcionProducto: "",
    alturaUltimoNivelEstanteria: null,
    maximaAlturaElevacion: null,
    pesoCargaMaximaAltura: null,
    pesoCargaPrimerNivel: null,
    dimensionesAreaTrabajoAncho: null,
    dimensionesAreaTrabajoFondo: null,
    turnosTrabajo: null,
    fechaEstimadaDefinicion: null,
    alimentacionDeseada: TipoAlimentacion.ELECTRICO,

    // Equipos eléctricos
    equiposElectricos: {
      noAplica: false,
      tipoCorriente: null,
      voltaje: null,
      frecuencia: null,
      amperaje: null,
      temperaturaAmbiente: null,
      horasTrabajoPorDia: null,
    },

    // Dimensiones cargas
    dimensionesCargas: [],

    // Especificaciones pasillo
    especificacionesPasillo: {
      profundidadProducto: null,
      anchoLibreEntreProductos: null,
      distanciaLibreEntreEstanterias: null,
      fondoUtilEstanteria: null,
      alturaBaseEstanteria: null,
      distanciaBajoRielesGuia: null,
      alturaSueloPrimerBrazo: null,
      distanciaEntreRielesGuia: null,
      alturaLibreHastaGuia: null,
      grosorPilarColumna: null,
      alturaUltimoNivel: null,
      alturaMaximaInteriorEdificio: null,
    },

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
): FormularioIndustrialSchema {
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

    // Descripción operación
    notasOperacion: formulario.notasOperacion || "",

    // Datos aplicación
    descripcionProducto: formulario.descripcionProducto || "",
    alturaUltimoNivelEstanteria: formulario.alturaUltimoNivelEstanteria,
    maximaAlturaElevacion: formulario.maximaAlturaElevacion,
    pesoCargaMaximaAltura: formulario.pesoCargaMaximaAltura,
    pesoCargaPrimerNivel: formulario.pesoCargaPrimerNivel,
    dimensionesAreaTrabajoAncho: formulario.dimensionesAreaTrabajoAncho,
    dimensionesAreaTrabajoFondo: formulario.dimensionesAreaTrabajoFondo,
    turnosTrabajo: formulario.turnosTrabajo,
    fechaEstimadaDefinicion: formulario.fechaEstimadaDefinicion
      ? new Date(formulario.fechaEstimadaDefinicion)
      : null,
    alimentacionDeseada:
      formulario.alimentacionDeseada || TipoAlimentacion.ELECTRICO,

    // Equipos eléctricos
    equiposElectricos: {
      noAplica: formulario.equiposElectricos?.noAplica ?? false,
      tipoCorriente: formulario.equiposElectricos?.tipoCorriente ?? null,
      voltaje: formulario.equiposElectricos?.voltaje ?? null,
      frecuencia: formulario.equiposElectricos?.frecuencia ?? null,
      amperaje: formulario.equiposElectricos?.amperaje ?? null,
      temperaturaAmbiente:
        formulario.equiposElectricos?.temperaturaAmbiente ?? null,
      horasTrabajoPorDia:
        formulario.equiposElectricos?.horasTrabajoPorDia ?? null,
    },

    // Dimensiones cargas
    dimensionesCargas: formulario.dimensionesCargas || [],

    // Especificaciones pasillo
    especificacionesPasillo: formulario.especificacionesPasillo || {
      profundidadProducto: null,
      anchoLibreEntreProductos: null,
      distanciaLibreEntreEstanterias: null,
      fondoUtilEstanteria: null,
      alturaBaseEstanteria: null,
      distanciaBajoRielesGuia: null,
      alturaSueloPrimerBrazo: null,
      distanciaEntreRielesGuia: null,
      alturaLibreHastaGuia: null,
      grosorPilarColumna: null,
      alturaUltimoNivel: null,
      alturaMaximaInteriorEdificio: null,
    },

    // Archivos
    archivos: formulario.archivos || [],
  };
}
