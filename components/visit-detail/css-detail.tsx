"use client";

import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InfoField, InfoSection, NumberDisplay } from "./shared";
import AttachmentsGallery from "@/components/attachments-gallery";

import {
  FormularioCSSAnalisis,
  CONTENEDOR_TIPO_LABELS,
  CONTENEDOR_MEDIDA_LABELS,
} from "@/interfaces/visits";

import {
  Calendar,
  FileText,
  Mail,
  MapPin,
  Globe,
  Package,
  Ruler,
  CheckCircle2,
  ClipboardList,
  Truck,
  Hash,
  Contact,
  Layers,
  Info,
} from "lucide-react";

interface CSSDetailProps {
  formulario: FormularioCSSAnalisis;
}

export function CSSDetail({ formulario }: CSSDetailProps) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <ClipboardList className="size-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-semibold tracking-tight">
            Detalles del formulario
          </h2>
          <Badge variant="outline-warning">Análisis CSS</Badge>
        </div>
      </div>

      {/* ==================== DATOS DEL CLIENTE ==================== */}
      <InfoSection title="Datos del cliente" icon={Contact}>
        <div className="space-y-4">
          {/* Primary info */}
          {formulario.razonSocial && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField
                  label="Razón Social"
                  value={formulario.razonSocial}
                />
                <InfoField
                  label="Persona de contacto"
                  value={formulario.personaContacto}
                />
              </div>

              <Separator />
            </>
          )}

          {/* Contact info */}
          {formulario.email && (
            <>
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
            </>
          )}

          {/* Address */}
          {formulario.direccion && (
            <>
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
              <Separator />
            </>
          )}

          {/* Distributor info */}
          {(formulario.distribuidor || formulario.contactoDistribuidor) && (
            <>
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
              <Separator />
            </>
          )}

          {/* Additional info */}
          {(formulario.fechaCierre || formulario.datosClienteUsuarioFinal) && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formulario.fechaCierre && (
                  <InfoField
                    label="Fecha de cierre"
                    value={formatDate(formulario.fechaCierre)}
                    icon={Calendar}
                  />
                )}
              </div>
              {formulario.datosClienteUsuarioFinal && (
                <div className="space-y-2 mt-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Datos cliente/Usuario final
                  </p>
                  <div className="text-sm text-foreground bg-muted/40 rounded-xl p-3 sm:p-4 border border-border/50">
                    {formulario.datosClienteUsuarioFinal}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </InfoSection>

      {/* ==================== DESCRIPCION DEL PRODUCTO ==================== */}
      <InfoSection title="Descripción del producto" icon={FileText}>
        <div className="space-y-4">
          <div className="bg-muted/40 rounded-xl p-3 sm:p-4 border border-border/50">
            <p
              className={cn(
                "text-sm text-foreground whitespace-pre-wrap leading-relaxed",
                !formulario.descripcionProducto &&
                  "italic text-muted-foreground"
              )}
            >
              {formulario.descripcionProducto || "No proporcionada."}
            </p>
          </div>
        </div>
      </InfoSection>

      {/* ==================== ARCHIVOS ADJUNTOS ==================== */}
      {formulario.archivos && formulario.archivos.length > 0 && (
        <AttachmentsGallery archivos={formulario.archivos} />
      )}

      {/* ==================== CONTENEDOR INFO ==================== */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Tipo de contenedor */}
        <InfoSection title="Tipo de contenedor" icon={Package}>
          <div className="space-y-4">
            {/* Container types badges */}
            <div className="flex flex-wrap gap-2">
              {formulario.contenedorTipos.map((tipo) => (
                <Badge
                  key={tipo}
                  variant="outline"
                  className="gap-1.5 py-1.5 px-3 bg-primary/5 border-primary/20"
                >
                  <CheckCircle2 className="size-3 text-primary" />
                  {CONTENEDOR_TIPO_LABELS[tipo] || tipo}
                </Badge>
              ))}
            </div>

            {/* Additional container info */}
            {(formulario.contenedoresPorSemana ||
              formulario.condicionesSuelo) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <NumberDisplay
                    label="Contenedores por semana"
                    value={formulario.contenedoresPorSemana}
                  />
                  {formulario.condicionesSuelo && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Condiciones del suelo
                      </p>
                      <div className="text-sm text-foreground bg-muted/40 rounded-xl p-3 border border-border/50">
                        {formulario.condicionesSuelo}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </InfoSection>

        {/* Medidas del contenedor */}
        <InfoSection title="Medidas del contenedor" icon={Ruler}>
          <div className="space-y-4">
            {/* Selected measurements */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Medidas seleccionadas
              </p>
              {formulario.contenedorMedidas &&
              formulario.contenedorMedidas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formulario.contenedorMedidas.map((medida) => (
                    <div
                      key={medida}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <Layers className="size-3.5 text-primary" />
                      <span className="text-xs md:text-sm font-medium text-foreground">
                        {CONTENEDOR_MEDIDA_LABELS[medida]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No especificadas
                </p>
              )}
            </div>

            {/* Custom measurement */}
            {formulario.contenedorMedidaOtro && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="size-3" />
                    Especificación adicional
                  </p>
                  <div className="text-sm text-foreground bg-muted/40 rounded-xl p-3 border border-border/50">
                    {formulario.contenedorMedidaOtro}
                  </div>
                </div>
              </>
            )}
          </div>
        </InfoSection>
      </div>
    </div>
  );
}
