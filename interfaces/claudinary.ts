import { TipoArchivo } from "@prisma/client";

export interface UploadedFile {
  nombre: string;
  tipoArchivo: TipoArchivo;
  mimeType: string;
  tamanio: number;
  cloudinaryId: string;
  cloudinaryUrl: string;
  cloudinaryType: string;
  ancho?: number;
  alto?: number;
  duracion?: number;
  formato: string;
}

// Interface for upload result
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  original_filename: string;
}