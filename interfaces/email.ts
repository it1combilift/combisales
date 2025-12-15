import { ArchivoSubido } from "@/schemas/visits";

export interface VisitEmailData {
  razonSocial: string;
  personaContacto: string;
  email: string;
  direccion: string;
  localidad: string;
  provinciaEstado: string;
  pais: string;
  descripcionProducto: string;
  formType: string;
  visitDate: Date;
  archivos?: ArchivoSubido[];
  vendedor?: {
    name: string;
    email: string;
  };
}

export interface SendVisitNotificationParams {
  visitData: VisitEmailData;
  to?: string | string[];
}

export interface VisitNotificationResult extends SendEmailResult {
  sentTo: string[];
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}

