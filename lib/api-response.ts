import { NextResponse } from "next/server";

// ==================== HTTP STATUS CODES ====================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ==================== ERROR MESSAGES ====================
export const API_ERRORS = {
  UNAUTHORIZED: "No autorizado. Debe iniciar sesión.",
  NOT_FOUND: {
    VISIT: "Visita no encontrada",
    CUSTOMER: "Cliente no encontrado",
    FILE: "Archivo no encontrado",
    ASSIGNED_SELLER: "Vendedor asignado no encontrado",
    VEHICLE: "Vehículo no encontrado",
    INSPECTION: "Inspección no encontrada",
  },
  REQUIRED: {
    CUSTOMER_ID: "customerId es requerido",
    FORM_TYPE: "customerId y formType son requeridos",
    CSS_FORM_DATA: "Datos del formulario CSS son requeridos",
    FILE_ID: "ID de archivo requerido",
    FILES: "No se proporcionaron archivos",
  },
  OPERATION: {
    FETCH_VISIT: "Error al obtener la visita",
    FETCH_VISITS: "Error al obtener las visitas",
    FETCH_ASSIGNED_SELLERS: "Error al obtener los vendedores asignados",
    CREATE_VISIT: "Error al crear la visita",
    UPDATE_VISIT: "Error al actualizar la visita",
    DELETE_VISIT: "Error al eliminar la visita",
    UPLOAD_FILE: "Error al procesar la solicitud de subida",
    DELETE_FILE: "Error al eliminar el archivo",
    FETCH_VEHICLES: "Error al obtener los vehículos",
    CREATE_VEHICLE: "Error al crear el vehículo",
    UPDATE_VEHICLE: "Error al actualizar el vehículo",
    DELETE_VEHICLE: "Error al eliminar el vehículo",
    FETCH_INSPECTIONS: "Error al obtener las inspecciones",
    CREATE_INSPECTION: "Error al crear la inspección",
    UPDATE_INSPECTION: "Error al actualizar la inspección",
    DELETE_INSPECTION: "Error al eliminar la inspección",
    APPROVE_INSPECTION: "Error al aprobar/rechazar la inspección",
  },
} as const;

// ==================== SUCCESS MESSAGES ====================
export const API_SUCCESS = {
  VISIT_CREATED: "Visita creada exitosamente",
  VISIT_UPDATED: "Visita actualizada exitosamente",
  VISIT_DELETED: "Visita eliminada exitosamente",
  FILE_DELETED: "Archivo eliminado correctamente",
  VEHICLE_CREATED: "Vehículo creado exitosamente",
  VEHICLE_UPDATED: "Vehículo actualizado exitosamente",
  VEHICLE_DELETED: "Vehículo eliminado exitosamente",
  INSPECTION_CREATED: "Inspección creada exitosamente",
  INSPECTION_UPDATED: "Inspección actualizada exitosamente",
  INSPECTION_DELETED: "Inspección eliminada exitosamente",
  INSPECTION_APPROVED: "Inspección aprobada exitosamente",
  INSPECTION_REJECTED: "Inspección rechazada exitosamente",
} as const;

// ==================== API RESPONSE HELPERS ====================
type ApiErrorKey = keyof typeof API_ERRORS.OPERATION;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
) {
  return NextResponse.json({ error }, { status });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = HTTP_STATUS.OK,
) {
  return NextResponse.json(data, { status });
}

/**
 * Handle unauthorized access
 */
export function unauthorizedResponse() {
  return createErrorResponse(API_ERRORS.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Handle not found resources
 */
export function notFoundResponse(resource: keyof typeof API_ERRORS.NOT_FOUND) {
  return createErrorResponse(
    API_ERRORS.NOT_FOUND[resource],
    HTTP_STATUS.NOT_FOUND,
  );
}

/**
 * Handle bad requests
 */
export function badRequestResponse(
  message: string | keyof typeof API_ERRORS.REQUIRED,
) {
  const errorMessage =
    typeof message === "string" && message in API_ERRORS.REQUIRED
      ? API_ERRORS.REQUIRED[message as keyof typeof API_ERRORS.REQUIRED]
      : message;
  return createErrorResponse(errorMessage, HTTP_STATUS.BAD_REQUEST);
}

/**
 * Handle server errors with logging
 */
export function serverErrorResponse(
  operationType: ApiErrorKey,
  error: unknown,
) {
  console.error(`${API_ERRORS.OPERATION[operationType]}:`, error);
  return createErrorResponse(
    API_ERRORS.OPERATION[operationType],
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
  );
}
