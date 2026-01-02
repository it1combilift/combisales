"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AttachmentsGallery from "@/components/attachments-gallery";
import { InfoField, InfoSection, NumberDisplay } from "./shared";
import { FormularioStraddleCarrierAnalisis } from "@/interfaces/visits";
import { useI18n } from "@/lib/i18n/context";

import {
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
  const { t } = useI18n();
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
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <Container className="size-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-semibold tracking-tight">
            {t("forms.detail.title")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("forms.formTypes.straddleCarrier")}
          </p>
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
          {formulario.email ||
            (formulario.website && (
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
            ))}

          {/* Address */}
          {formulario.direccion ||
            (formulario.codigoPostal && (
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
            ))}

          {/* Distributor info */}
          {(formulario.distribuidor || formulario.contactoDistribuidor) && (
            <>
              <Separator />
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
            </>
          )}

          {/* if not info, set a messagge */}
          {!formulario.razonSocial &&
            !formulario.personaContacto &&
            !formulario.email &&
            !formulario.website &&
            !formulario.direccion &&
            !formulario.codigoPostal &&
            !formulario.distribuidor &&
            !formulario.contactoDistribuidor && (
              <p className="text-sm text-muted-foreground italic">
                {t("forms.detail.noClientInfoProvided")}
              </p>
            )}
        </div>
      </InfoSection>

      {/* ==================== TIPO DE OPERACIÓN ==================== */}
      <InfoSection title={t("forms.detail.operationType")} icon={Forklift}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-xs">
              {formulario.manejaContenedores ? (
                <Check className="size-3" />
              ) : (
                <X className="size-3" />
              )}
              {t("forms.detail.handlesContainers")}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {formulario.manejaCargaEspecial ? (
                <Check className="size-3" />
              ) : (
                <X className="size-3" />
              )}
              {t("forms.detail.handlesSpecialLoad")}
            </Badge>
          </div>
        </div>
      </InfoSection>

      {/* ==================== CONTENEDORES ==================== */}
      {formulario.manejaContenedores && (
        <InfoSection title={t("forms.detail.containers")} icon={Container}>
          <div className="space-y-4">
            {/* Container sizes table */}
            {selectedContainers.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {t("forms.detail.containerSizes")}
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-medium">
                          {t("forms.detail.size")}
                        </th>
                        <th className="text-right px-3 py-2 text-xs font-medium">
                          {t("forms.detail.quantityPerWeek")}
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
            <div className="flex justify-start items-center gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {formulario.dobleApilamiento ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3" />
                  )}
                  {t("forms.detail.doubleStacking")}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {formulario.manejaContenedoresIndiv ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3" />
                  )}
                  {t("forms.detail.individualContainers")}
                </Badge>
              </div>
            </div>
          </div>
        </InfoSection>
      )}

      {/* ==================== CARGA ESPECIAL ==================== */}
      {formulario.manejaCargaEspecial && (
        <InfoSection title={t("forms.detail.specialLoad")} icon={Package}>
          <div className="space-y-4">
            {/* Longitudes */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <Ruler className="size-3" />
                {t("forms.detail.productDimensions")}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <NumberDisplay
                  label={t("forms.detail.longestProduct")}
                  value={formulario.productoMasLargo}
                  unit="m"
                />
                <NumberDisplay
                  label={t("forms.detail.shortestProduct")}
                  value={formulario.productoMasCorto}
                  unit="m"
                />
                <NumberDisplay
                  label={t("forms.detail.widestProduct")}
                  value={formulario.productoMasAncho}
                  unit="m"
                />
                <NumberDisplay
                  label={t("forms.detail.narrowestProduct")}
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
                {t("forms.detail.liftingPoints")}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <NumberDisplay
                  label={t("forms.detail.liftingPointLength")}
                  value={formulario.puntosElevacionLongitud}
                  unit="m"
                />
                <NumberDisplay
                  label={t("forms.detail.liftingPointWidth")}
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
                {t("forms.detail.weightsAndHeight")}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <NumberDisplay
                  label={t("forms.detail.maxWeightLongProduct")}
                  value={formulario.pesoMaximoProductoLargo}
                  unit="kg"
                />
                <NumberDisplay
                  label={t("forms.detail.maxWeightShortProduct")}
                  value={formulario.pesoMaximoProductoCorto}
                  unit="kg"
                />
                <NumberDisplay
                  label={t("forms.detail.tallestProduct")}
                  value={formulario.productoMasAlto}
                  unit="m"
                />
              </div>
            </div>
          </div>
        </InfoSection>
      )}

      {/* ==================== OTROS ==================== */}
      <InfoSection title={t("forms.detail.others")} icon={Route}>
        <div className="space-y-4">
          {/* Zonas de paso */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <Route className="size-3" />
              {t("forms.detail.passageAreas")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumberDisplay
                label={t("forms.detail.width")}
                value={formulario.zonasPasoAncho}
                unit="m"
              />
              <NumberDisplay
                label={t("forms.detail.height")}
                value={formulario.zonasPasoAlto}
                unit="m"
              />
            </div>
          </div>

          <Separator />

          {/* Condiciones del piso */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formulario.pisoPlano ? (
                  <Check className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
                {t("forms.detail.flatFloor")}
              </Badge>
            </div>
            {formulario.condicionesPiso && (
              <InfoField
                label={t("forms.detail.floorConditions")}
                value={formulario.condicionesPiso}
              />
            )}
          </div>

          <Separator />

          {/* Restricciones */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <AlertTriangle className="size-3" />
              {t("forms.detail.restrictions")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumberDisplay
                label={t("forms.detail.restrictionHeight")}
                value={formulario.restriccionesAltura}
                unit="m"
              />
              <NumberDisplay
                label={t("forms.detail.restrictionWidth")}
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
                  {t("forms.detail.additionalNotes")}
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
        <InfoSection title={t("forms.detail.attachedFiles")} icon={FileText}>
          <AttachmentsGallery archivos={archivos} />
        </InfoSection>
      )}
    </div>
  );
}
