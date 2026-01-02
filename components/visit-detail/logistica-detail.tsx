"use client";

import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AttachmentsGallery from "@/components/attachments-gallery";
import { InfoField, InfoSection, NumberDisplay } from "./shared";
import { FormularioLogisticaAnalisis } from "@/interfaces/visits";
import { useI18n } from "@/lib/i18n/context";

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
  Zap,
  Package,
  LayoutGrid,
  Clock,
  Settings,
  Layers,
  DoorOpen,
  AlertTriangle,
  ArrowUpFromLine,
} from "lucide-react";

// ==================== VALUE TO KEY MAPPINGS ====================
// Maps database values to i18n key paths
const ALIMENTACION_KEYS: Record<string, string> = {
  ELECTRICO: "common.powerSource.ELECTRICO",
  DIESEL: "common.powerSource.DIESEL",
  GAS: "common.powerSource.GLP",
  GLP: "common.powerSource.GLP",
  MANUAL: "common.powerSource.MANUAL",
};

const TIPO_CORRIENTE_KEYS: Record<string, string> = {
  MONOFASICA: "visits.currentTypes.MONOFASICA",
  TRIFASICA: "visits.currentTypes.TRIFASICA",
};

const TIPO_OPERACION_KEYS: Record<string, string> = {
  almacenamiento: "forms.logistica.options.operationType.storage",
  "cross-docking": "forms.logistica.options.operationType.crossDocking",
  picking: "forms.logistica.options.operationType.picking",
  "carga-descarga": "forms.logistica.options.operationType.loadingUnloading",
  "preparacion-pedidos": "forms.logistica.options.operationType.orderPrep",
  mixto: "forms.logistica.options.operationType.mixed",
  // Legacy values for backward compatibility
  carga_descarga: "forms.logistica.options.operationType.loadingUnloading",
  almacenaje: "forms.logistica.options.operationType.storage",
  cross_docking: "forms.logistica.options.operationType.crossDocking",
  mixta: "forms.logistica.options.operationType.mixed",
};

const TIPO_ESTANTERIAS_KEYS: Record<string, string> = {
  CONVENCIONAL: "visits.shelfTypes.CONVENCIONAL",
  DRIVE_IN: "visits.shelfTypes.DRIVE_IN",
  PUSH_BACK: "visits.shelfTypes.PUSH_BACK",
  DINAMICA: "visits.shelfTypes.DINAMICA",
  CANTILEVER: "visits.shelfTypes.CANTILEVER",
  MOVIL: "visits.shelfTypes.MOVIL",
  OTRA: "visits.shelfTypes.OTRA",
  // Legacy values for backward compatibility
  convencional: "visits.shelfTypes.CONVENCIONAL",
  "drive-in": "visits.shelfTypes.DRIVE_IN",
  "push-back": "visits.shelfTypes.PUSH_BACK",
  dinamica: "visits.shelfTypes.DINAMICA",
  cantilever: "visits.shelfTypes.CANTILEVER",
  movil: "visits.shelfTypes.MOVIL",
  otra: "visits.shelfTypes.OTRA",
};

interface LogisticaDetailProps {
  formulario: FormularioLogisticaAnalisis;
}

export function LogisticaDetail({ formulario }: LogisticaDetailProps) {
  const { t } = useI18n();
  const equipos = formulario.equiposElectricos;
  const pasilloActual = formulario.pasilloActual;
  const cargas = formulario.dimensionesCargas || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <Forklift className="size-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-semibold tracking-tight">
            {t("forms.detail.title")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("forms.formTypes.logistica")}
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
            ))}

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

          {/* Dates */}
          {(formulario.fechaCierre || formulario.fechaEstimadaDefinicion) && (
            <>
              <div className="flex justify-start items-center gap-2">
                {formulario.fechaCierre && (
                  <InfoField
                    label={t("forms.fields.closingDate")}
                    value={formatDate(formulario.fechaCierre)}
                    icon={Calendar}
                  />
                )}
                {formulario.fechaEstimadaDefinicion && (
                  <InfoField
                    label={t("forms.fields.estimatedDefinitionDate")}
                    value={formatDate(formulario.fechaEstimadaDefinicion)}
                    icon={Calendar}
                  />
                )}
              </div>
            </>
          )}

          {/* if not info, set a messagge */}
          {(!formulario.razonSocial &&
            !formulario.personaContacto &&
            !formulario.email &&
            !formulario.website &&
            !formulario.direccion &&
            !formulario.codigoPostal &&
            !formulario.distribuidor &&
            !formulario.fechaCierre) ||
            (!formulario.fechaEstimadaDefinicion &&
              !formulario.contactoDistribuidor && (
                <p className="text-sm text-muted-foreground italic">
                  {t("forms.detail.noClientInfoProvided")}
                </p>
              ))}
        </div>
      </InfoSection>

      {/* ==================== DESCRIPCION DE LA OPERACION ==================== */}
      <InfoSection
        title={t("forms.detail.operationDescription")}
        icon={FileText}
      >
        <div className="space-y-4">
          {/* Notas generales */}
          <div className="bg-muted/40 rounded-xl p-3 sm:p-4 border border-border/50">
            <p
              className={cn(
                "text-sm text-foreground whitespace-pre-wrap leading-relaxed",
                !formulario.notasOperacion && "italic text-muted-foreground"
              )}
            >
              {formulario.notasOperacion || t("forms.detail.notProvided")}
            </p>
          </div>

          {/* Tipo de operación */}
          {formulario.tipoOperacion && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <Settings className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("forms.fields.operationType")}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {TIPO_OPERACION_KEYS[formulario.tipoOperacion]
                    ? t(TIPO_OPERACION_KEYS[formulario.tipoOperacion])
                    : formulario.tipoOperacion}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Características especiales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rampas */}
            <div
              className={cn(
                "p-3 rounded-xl border",
                formulario.tieneRampas
                  ? "bg-amber-500/5 border-amber-500/20"
                  : "bg-muted/40 border-border/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpFromLine
                  className={cn(
                    "size-4",
                    formulario.tieneRampas
                      ? "text-amber-600"
                      : "text-muted-foreground"
                  )}
                />
                <span className="text-xs font-medium">
                  {t("forms.fields.ramps")}
                </span>
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {formulario.tieneRampas
                    ? t("forms.fields.yes")
                    : t("forms.fields.no")}
                </Badge>
              </div>
              {formulario.tieneRampas && formulario.notasRampas && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formulario.notasRampas}
                </p>
              )}
            </div>

            {/* Pasos/Puertas */}
            <div
              className={cn(
                "p-3 rounded-xl border",
                formulario.tienePasosPuertas
                  ? "bg-blue-500/5 border-blue-500/20"
                  : "bg-muted/40 border-border/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <DoorOpen
                  className={cn(
                    "size-4",
                    formulario.tienePasosPuertas
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  )}
                />
                <span className="text-xs font-medium">
                  {t("forms.fields.doorways")}
                </span>
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {formulario.tienePasosPuertas
                    ? t("forms.fields.yes")
                    : t("forms.fields.no")}
                </Badge>
              </div>
              {formulario.tienePasosPuertas && formulario.notasPasosPuertas && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formulario.notasPasosPuertas}
                </p>
              )}
            </div>

            {/* Restricciones */}
            <div
              className={cn(
                "p-3 rounded-xl border",
                formulario.tieneRestricciones
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-muted/40 border-border/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle
                  className={cn(
                    "size-4",
                    formulario.tieneRestricciones
                      ? "text-red-600"
                      : "text-muted-foreground"
                  )}
                />
                <span className="text-xs font-medium">
                  {t("forms.fields.restrictions")}
                </span>
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {formulario.tieneRestricciones
                    ? t("forms.fields.yes")
                    : t("forms.fields.no")}
                </Badge>
              </div>
              {formulario.tieneRestricciones &&
                formulario.notasRestricciones && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formulario.notasRestricciones}
                  </p>
                )}
            </div>
          </div>

          <Separator />

          {/* Dimensiones de la nave */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberDisplay
              label={t("forms.fields.maxBuildingHeight")}
              value={formulario.alturaMaximaNave}
              unit="m"
              icon={Ruler}
            />
            <NumberDisplay
              label={t("forms.fields.currentAisleWidth")}
              value={formulario.anchoPasilloActual}
              unit="m"
              icon={Ruler}
            />
            <NumberDisplay
              label={t("forms.fields.workSurface")}
              value={formulario.superficieTrabajo}
              unit="m²"
              icon={LayoutGrid}
            />
          </div>

          {/* Condiciones del suelo */}
          {formulario.condicionesSuelo && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {t("forms.fields.floorConditions")}
              </p>
              <p className="text-sm text-foreground">
                {formulario.condicionesSuelo}
              </p>
            </div>
          )}
        </div>
      </InfoSection>

      {/* ==================== DATOS DE LA APLICACION ==================== */}
      <InfoSection title={t("forms.detail.applicationData")} icon={Settings}>
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {t("forms.fields.productDescription")}
            </p>
            <div className="bg-muted/40 rounded-xl p-3 sm:p-4 border border-border/50">
              <p
                className={cn(
                  "text-sm text-foreground whitespace-pre-wrap leading-relaxed",
                  !formulario.descripcionProducto &&
                    "italic text-muted-foreground"
                )}
              >
                {formulario.descripcionProducto ||
                  t("forms.detail.notProvided")}
              </p>
            </div>
          </div>

          <Separator />

          {/* Measurements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <NumberDisplay
              label={t("forms.fields.lastShelfLevel")}
              value={formulario.alturaUltimoNivelEstanteria}
              unit="mm"
              icon={Ruler}
            />
            <NumberDisplay
              label={t("forms.fields.maxLiftHeight")}
              value={formulario.maximaAlturaElevacion}
              unit="mm"
              icon={Ruler}
            />
            <NumberDisplay
              label={t("forms.fields.maxHeightLoad")}
              value={formulario.pesoCargaMaximaAltura}
              unit="kg"
              icon={Package}
            />
            <NumberDisplay
              label={t("forms.fields.firstLevelLoad")}
              value={formulario.pesoCargaPrimerNivel}
              unit="kg"
              icon={Package}
            />
            <NumberDisplay
              label={t("forms.fields.workAreaWidth")}
              value={formulario.dimensionesAreaTrabajoAncho}
              unit="mm"
              icon={LayoutGrid}
            />
            <NumberDisplay
              label={t("forms.fields.workAreaDepth")}
              value={formulario.dimensionesAreaTrabajoFondo}
              unit="mm"
              icon={LayoutGrid}
            />
            <NumberDisplay
              label={t("forms.fields.workShifts")}
              value={formulario.turnosTrabajo}
              icon={Clock}
            />
          </div>

          <Separator />

          {/* Alimentación */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <Zap className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("forms.fields.desiredPower")}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {ALIMENTACION_KEYS[formulario.alimentacionDeseada]
                  ? t(ALIMENTACION_KEYS[formulario.alimentacionDeseada])
                  : formulario.alimentacionDeseada}
              </p>
            </div>
          </div>
        </div>
      </InfoSection>

      {/* ==================== EQUIPOS ELECTRICOS ==================== */}
      {equipos && formulario.alimentacionDeseada === "ELECTRICO" && (
        <InfoSection title={t("forms.detail.electricalEquipment")} icon={Zap}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipos.tipoCorriente && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("forms.fields.currentType")}
                </span>
                <Badge variant="outline">
                  {TIPO_CORRIENTE_KEYS[equipos.tipoCorriente]
                    ? t(TIPO_CORRIENTE_KEYS[equipos.tipoCorriente])
                    : equipos.tipoCorriente}
                </Badge>
              </div>
            )}

            <NumberDisplay
              label={t("forms.fields.voltage")}
              value={equipos.voltaje}
              unit="V"
            />

            <NumberDisplay
              label={t("forms.fields.frequency")}
              value={equipos.frecuencia}
              unit="Hz"
            />

            <NumberDisplay
              label={t("forms.fields.amperage")}
              value={equipos.amperaje}
              unit="A"
            />

            <NumberDisplay
              label={t("forms.fields.ambientTemperature")}
              value={equipos.temperaturaAmbiente}
              unit="°C"
            />

            <NumberDisplay
              label={t("forms.fields.workHoursPerDay")}
              value={equipos.horasTrabajoPorDia}
              unit="h"
            />
          </div>

          {!equipos.tipoCorriente &&
            equipos.voltaje === undefined &&
            equipos.frecuencia === undefined &&
            equipos.amperaje === undefined &&
            equipos.temperaturaAmbiente === undefined &&
            equipos.horasTrabajoPorDia === undefined && (
              <div className="text-sm text-muted-foreground italic">
                {t("forms.detail.noElectricalInfoProvided")}
              </div>
            )}
        </InfoSection>
      )}

      {/* ==================== DIMENSIONES DE CARGAS ==================== */}
      {cargas.length > 0 && (
        <InfoSection title={t("forms.detail.loadDimensions")} icon={Package}>
          <div className="space-y-3">
            {cargas.map((carga, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 rounded-xl bg-muted/40 border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center size-6 rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">
                      {carga.producto ||
                        `${t("forms.fields.loadNumber")} ${index + 1}`}
                    </span>
                  </div>
                  {carga.porcentaje !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {carga.porcentaje}%
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {carga.largo !== undefined && (
                    <div className="flex justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">
                        {t("forms.fields.length")}
                      </span>
                      <span className="font-medium">{carga.largo} mm</span>
                    </div>
                  )}
                  {carga.fondo !== undefined && (
                    <div className="flex justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">
                        {t("forms.fields.depth")}
                      </span>
                      <span className="font-medium">{carga.fondo} mm</span>
                    </div>
                  )}
                  {carga.alto !== undefined && (
                    <div className="flex justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">
                        {t("forms.fields.height")}
                      </span>
                      <span className="font-medium">{carga.alto} mm</span>
                    </div>
                  )}
                  {carga.peso !== undefined && (
                    <div className="flex justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">
                        {t("forms.fields.weight")}
                      </span>
                      <span className="font-medium">{carga.peso} kg</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </InfoSection>
      )}

      {/* ==================== PASILLO ACTUAL ==================== */}
      {pasilloActual && (
        <InfoSection title={t("forms.detail.currentAisle")} icon={Layers}>
          <div className="space-y-4">
            {/* Header descriptivo */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Ruler className="size-3.5" />
              <span>{t("forms.detail.currentAisleMeasurements")}</span>
            </div>

            {/* Grid de medidas */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <NumberDisplay
                label={t("forms.fields.distBetweenRacks")}
                value={pasilloActual.distanciaEntreEstanterias}
                unit="m"
                icon={Ruler}
              />
              <NumberDisplay
                label={t("forms.fields.distBetweenProducts")}
                value={pasilloActual.distanciaEntreProductos}
                unit="m"
                icon={Ruler}
              />
              <NumberDisplay
                label={t("forms.fields.availableAisleWidth")}
                value={pasilloActual.anchoPasilloDisponible}
                unit="m"
                icon={Ruler}
              />
              {pasilloActual.nivelEstanterias && (
                <NumberDisplay
                  label={t("forms.fields.rackLevels")}
                  value={pasilloActual.nivelEstanterias}
                  icon={Layers}
                />
              )}
              <NumberDisplay
                label={t("forms.fields.maxRackHeight")}
                value={pasilloActual.alturaMaximaEstanteria}
                unit="m"
                icon={Ruler}
              />
            </div>

            {/* Tipo de estanterías */}
            {pasilloActual.tipoEstanterias && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                  <Layers className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("forms.detail.rackType")}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {TIPO_ESTANTERIAS_KEYS[pasilloActual.tipoEstanterias]
                      ? t(TIPO_ESTANTERIAS_KEYS[pasilloActual.tipoEstanterias])
                      : pasilloActual.tipoEstanterias}
                  </p>
                </div>
              </div>
            )}
          </div>
        </InfoSection>
      )}

      {/* ==================== ARCHIVOS ADJUNTOS ==================== */}
      {formulario.archivos && formulario.archivos.length > 0 && (
        <AttachmentsGallery archivos={formulario.archivos} />
      )}
    </div>
  );
}
