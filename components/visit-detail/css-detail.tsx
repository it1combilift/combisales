"use client";

import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InfoField, InfoSection, NumberDisplay } from "./shared";
import { useI18n } from "@/lib/i18n/context";
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
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <ClipboardList className="size-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-semibold tracking-tight">
            {t("forms.detail.title")}
          </h2>
          <Badge variant="outline-warning">{t("forms.formTypes.css")}</Badge>
        </div>
      </div>

      {/* ==================== DATOS DEL CLIENTE ==================== */}
      <InfoSection title={t("forms.detail.clientData")} icon={Contact}>
        <div className="space-y-4">
          {/* Primary info */}
          {formulario.razonSocial && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField
                  label={t("forms.fields.legalName")}
                  value={formulario.razonSocial}
                />
                <InfoField
                  label={t("forms.fields.contactPerson")}
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
                <InfoField
                  label={t("forms.fields.email")}
                  value={formulario.email}
                  icon={Mail}
                />
                <InfoField
                  label={t("forms.fields.website")}
                  value={formulario.website}
                  icon={Globe}
                  isLink
                />
                <InfoField
                  label={t("forms.fields.fiscalId")}
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
                  {t("forms.sections.address")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField
                    label={t("forms.fields.address")}
                    value={formulario.direccion}
                  />
                  <InfoField
                    label={t("forms.fields.city")}
                    value={formulario.localidad}
                  />
                  <InfoField
                    label={t("forms.fields.state")}
                    value={formulario.provinciaEstado}
                  />
                  <InfoField
                    label={t("forms.fields.country")}
                    value={formulario.pais}
                  />
                  <InfoField
                    label={t("forms.fields.postalCode")}
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
                  {t("forms.fields.distributor")}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField
                    label={t("forms.fields.distributor")}
                    value={formulario.distribuidor}
                  />
                  <InfoField
                    label={t("forms.fields.distributorContact")}
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
                    label={t("forms.fields.closingDate")}
                    value={formatDate(formulario.fechaCierre)}
                    icon={Calendar}
                  />
                )}
              </div>
              {formulario.datosClienteUsuarioFinal && (
                <div className="space-y-2 mt-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {t("forms.fields.clientEndUserData")}
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
      <InfoSection title={t("forms.detail.productInfo")} icon={FileText}>
        <div className="space-y-4">
          <div className="bg-muted/40 rounded-xl p-3 sm:p-4 border border-border/50">
            <p
              className={cn(
                "text-sm text-foreground whitespace-pre-wrap leading-relaxed",
                !formulario.descripcionProducto &&
                  "italic text-muted-foreground"
              )}
            >
              {formulario.descripcionProducto || t("forms.detail.notSpecified")}
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
        <InfoSection title={t("forms.fields.containerType")} icon={Package}>
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
                    label={t("forms.css.fields.containersPerWeek.label")}
                    value={formulario.contenedoresPorSemana}
                  />
                  {formulario.condicionesSuelo && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {t("forms.fields.groundConditions")}
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
        <InfoSection
          title={t("forms.css.fields.measurements.label")}
          icon={Ruler}
        >
          <div className="space-y-4">
            {/* Selected measurements */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {t("forms.fields.selectedMeasurements")}
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
                  {t("forms.detail.notSpecified")}
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
                    {t("forms.detail.additionalInfo")}
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
