"use client";

import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AttachmentsGallery from "@/components/attachments-gallery";
import { InfoField, InfoSection, NumberDisplay } from "./shared";
import { FormularioStraddleCarrierAnalisis } from "@/interfaces/visits";

import {
  Calendar,
  FileText,
  Mail,
  MapPin,
  Globe,
  Ruler,
  Truck,
  Hash,
  Contact,
  Forklift,
  Container,
  Package,
  ArrowUpDown,
  Weight,
  Route,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";

// ==================== CONTAINER SIZE LABELS ====================
const CONTAINER_SIZE_LABELS: Record<string, string> = {
  size20ft: "20 ft",
  size30ft: "30 ft",
  size40ft: "40 ft",
  size45ft: "45 ft",
  size53ft: "53 ft",
};

interface StraddleCarrierDetailProps {
  formulario: FormularioStraddleCarrierAnalisis;
}

export function StraddleCarrierDetail({
  formulario,
}: StraddleCarrierDetailProps) {
  const archivos = formulario.archivos || [];

  // Parse contenedoresTamanios JSON
  const contenedoresTamanios =
    typeof formulario.contenedoresTamanios === "string"
      ? JSON.parse(formulario.contenedoresTamanios)
      : formulario.contenedoresTamanios || {};

  // Get selected container sizes
  const selectedContainers = Object.entries(contenedoresTamanios).filter(
    ([_, data]: [string, any]) => data?.selected
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <Container className="size-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-semibold tracking-tight">
            Detalles del formulario
          </h2>
          <p className="text-xs text-muted-foreground">
            Análisis Straddle Carrier
          </p>
        </div>
      </div>

      {/* ==================== DATOS DEL CLIENTE ==================== */}
      <InfoSection title="Datos del cliente" icon={Contact}>
        <div className="space-y-4">
          {/* Primary info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Razón Social" value={formulario.razonSocial} />
            <InfoField
              label="Persona de contacto"
              value={formulario.personaContacto}
            />
          </div>

          <Separator />

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoField label="Email" value={formulario.email} icon={Mail} />
            <InfoField
              label="Website"
              value={formulario.website}
              icon={Globe}
              isLink
            />
            <InfoField
              label="NIF/CIF"
              value={formulario.numeroIdentificacionFiscal}
              icon={Hash}
            />
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <MapPin className="size-3" />
              Dirección
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField label="Dirección" value={formulario.direccion} />
              <InfoField label="Localidad" value={formulario.localidad} />
              <InfoField
                label="Provincia/Estado"
                value={formulario.provinciaEstado}
              />
              <InfoField label="País" value={formulario.pais} />
              <InfoField
                label="Código postal"
                value={formulario.codigoPostal}
              />
            </div>
          </div>

          {/* Distributor info */}
          {(formulario.distribuidor || formulario.contactoDistribuidor) && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  <Truck className="size-3" />
                  Distribuidor
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField
                    label="Distribuidor"
                    value={formulario.distribuidor}
                  />
                  <InfoField
                    label="Contacto distribuidor"
                    value={formulario.contactoDistribuidor}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </InfoSection>

      {/* ==================== TIPO DE OPERACIÓN ==================== */}
      <InfoSection title="Tipo de operación" icon={Forklift}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge
              variant={formulario.manejaContenedores ? "default" : "secondary"}
              className="text-xs"
            >
              {formulario.manejaContenedores ? (
                <Check className="size-3 mr-1" />
              ) : (
                <X className="size-3 mr-1" />
              )}
              Maneja Contenedores
            </Badge>
            <Badge
              variant={formulario.manejaCargaEspecial ? "default" : "secondary"}
              className="text-xs"
            >
              {formulario.manejaCargaEspecial ? (
                <Check className="size-3 mr-1" />
              ) : (
                <X className="size-3 mr-1" />
              )}
              Maneja Carga Especial
            </Badge>
          </div>
        </div>
      </InfoSection>

      {/* ==================== CONTENEDORES ==================== */}
      {formulario.manejaContenedores && (
        <InfoSection title="Contenedores" icon={Container}>
          <div className="space-y-4">
            {/* Container sizes table */}
            {selectedContainers.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Tamaños de contenedores
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-medium">
                          Tamaño
                        </th>
                        <th className="text-right px-3 py-2 text-xs font-medium">
                          Cantidad/Semana
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedContainers.map(([key, data]: [string, any]) => (
                        <tr key={key}>
                          <td className="px-3 py-2 font-medium">
                            {CONTAINER_SIZE_LABELS[key] || key}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground">
                            {data.cantidad ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Additional container options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    formulario.dobleApilamiento ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {formulario.dobleApilamiento ? (
                    <Check className="size-3 mr-1" />
                  ) : (
                    <X className="size-3 mr-1" />
                  )}
                  Doble apilamiento
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    formulario.manejaContenedoresIndiv ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {formulario.manejaContenedoresIndiv ? (
                    <Check className="size-3 mr-1" />
                  ) : (
                    <X className="size-3 mr-1" />
                  )}
                  Contenedores individuales
                </Badge>
              </div>
            </div>
          </div>
        </InfoSection>
      )}

      {/* ==================== CARGA ESPECIAL ==================== */}
      {formulario.manejaCargaEspecial && (
        <InfoSection title="Carga especial" icon={Package}>
          <div className="space-y-4">
            {/* Longitudes */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <Ruler className="size-3" />
                Dimensiones de productos
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <NumberDisplay
                  label="Producto más largo"
                  value={formulario.productoMasLargo}
                  unit="m"
                />
                <NumberDisplay
                  label="Producto más corto"
                  value={formulario.productoMasCorto}
                  unit="m"
                />
                <NumberDisplay
                  label="Producto más ancho"
                  value={formulario.productoMasAncho}
                  unit="m"
                />
                <NumberDisplay
                  label="Producto más estrecho"
                  value={formulario.productoMasEstrecho}
                  unit="m"
                />
              </div>
            </div>

            <Separator />

            {/* Puntos de elevación */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <ArrowUpDown className="size-3" />
                Puntos de elevación
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <NumberDisplay
                  label="Longitud"
                  value={formulario.puntosElevacionLongitud}
                  unit="m"
                />
                <NumberDisplay
                  label="Ancho"
                  value={formulario.puntosElevacionAncho}
                  unit="m"
                />
              </div>
            </div>

            <Separator />

            {/* Pesos y altura */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <Weight className="size-3" />
                Pesos y altura
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <NumberDisplay
                  label="Peso máx. prod. largo"
                  value={formulario.pesoMaximoProductoLargo}
                  unit="kg"
                />
                <NumberDisplay
                  label="Peso máx. prod. corto"
                  value={formulario.pesoMaximoProductoCorto}
                  unit="kg"
                />
                <NumberDisplay
                  label="Producto más alto"
                  value={formulario.productoMasAlto}
                  unit="m"
                />
              </div>
            </div>
          </div>
        </InfoSection>
      )}

      {/* ==================== OTROS ==================== */}
      <InfoSection title="Otros" icon={Route}>
        <div className="space-y-4">
          {/* Zonas de paso */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <Route className="size-3" />
              Zonas de paso
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumberDisplay
                label="Ancho"
                value={formulario.zonasPasoAncho}
                unit="m"
              />
              <NumberDisplay
                label="Alto"
                value={formulario.zonasPasoAlto}
                unit="m"
              />
            </div>
          </div>

          <Separator />

          {/* Condiciones del piso */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant={formulario.pisoPlano ? "default" : "secondary"}
                className="text-xs"
              >
                {formulario.pisoPlano ? (
                  <Check className="size-3 mr-1" />
                ) : (
                  <X className="size-3 mr-1" />
                )}
                Piso plano
              </Badge>
            </div>
            {formulario.condicionesPiso && (
              <InfoField
                label="Condiciones del piso"
                value={formulario.condicionesPiso}
              />
            )}
          </div>

          <Separator />

          {/* Restricciones */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <AlertTriangle className="size-3" />
              Restricciones
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumberDisplay
                label="Restricción de altura"
                value={formulario.restriccionesAltura}
                unit="m"
              />
              <NumberDisplay
                label="Restricción de anchura"
                value={formulario.restriccionesAnchura}
                unit="m"
              />
            </div>
          </div>

          {/* Notas adicionales */}
          {formulario.notasAdicionales && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  <FileText className="size-3" />
                  Notas adicionales
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {formulario.notasAdicionales}
                </p>
              </div>
            </>
          )}
        </div>
      </InfoSection>

      {/* ==================== ARCHIVOS ==================== */}
      {archivos.length > 0 && (
        <InfoSection title="Archivos adjuntos" icon={FileText}>
          <AttachmentsGallery archivos={archivos} />
        </InfoSection>
      )}
    </div>
  );
}
