"use client";

import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AttachmentsGallery from "@/components/attachments-gallery";
import { InfoField, InfoSection, NumberDisplay } from "./shared";
import { FormularioLogisticaAnalisis } from "@/interfaces/visits";

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

// ==================== LABELS FOR DISPLAY ====================
const ALIMENTACION_LABELS: Record<string, string> = {
  ELECTRICO: "Eléctrico",
  DIESEL: "Diésel",
  GAS: "Gas",
  MANUAL: "Manual",
};

const TIPO_CORRIENTE_LABELS: Record<string, string> = {
  MONOFASICA: "Monofásica",
  TRIFASICA: "Trifásica",
};

const TIPO_OPERACION_LABELS: Record<string, string> = {
  carga_descarga: "Carga/Descarga",
  almacenaje: "Almacenaje",
  picking: "Picking",
  cross_docking: "Cross-Docking",
  mixta: "Mixta",
};

const TIPO_ESTANTERIAS_LABELS: Record<string, string> = {
  convencional: "Convencional",
  "drive-in": "Drive-in",
  "push-back": "Push-back",
  dinamica: "Dinámica",
  cantilever: "Cantilever",
  movil: "Móvil",
  otra: "Otra",
};

interface LogisticaDetailProps {
  formulario: FormularioLogisticaAnalisis;
}

export function LogisticaDetail({ formulario }: LogisticaDetailProps) {
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
            Detalles del formulario
          </h2>
          <p className="text-xs text-muted-foreground">Análisis Logística</p>
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

          {/* Dates */}
          {(formulario.fechaCierre || formulario.fechaEstimadaDefinicion) && (
            <>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formulario.fechaCierre && (
                  <InfoField
                    label="Fecha de cierre"
                    value={formatDate(formulario.fechaCierre)}
                    icon={Calendar}
                  />
                )}
                {formulario.fechaEstimadaDefinicion && (
                  <InfoField
                    label="Fecha estimada definición"
                    value={formatDate(formulario.fechaEstimadaDefinicion)}
                    icon={Calendar}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </InfoSection>

      {/* ==================== DESCRIPCION DE LA OPERACION ==================== */}
      <InfoSection title="Descripción de la operación" icon={FileText}>
        <div className="space-y-4">
          {/* Notas generales */}
          <div className="bg-muted/40 rounded-xl p-3 sm:p-4 border border-border/50">
            <p
              className={cn(
                "text-sm text-foreground whitespace-pre-wrap leading-relaxed",
                !formulario.notasOperacion && "italic text-muted-foreground"
              )}
            >
              {formulario.notasOperacion || "No proporcionada."}
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
                  Tipo de operación
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {TIPO_OPERACION_LABELS[formulario.tipoOperacion] ||
                    formulario.tipoOperacion}
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
                <span className="text-xs font-medium">Rampas</span>
                <Badge
                  variant={formulario.tieneRampas ? "default" : "secondary"}
                  className="text-[10px] ml-auto"
                >
                  {formulario.tieneRampas ? "Sí" : "No"}
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
                <span className="text-xs font-medium">Pasos/Puertas</span>
                <Badge
                  variant={
                    formulario.tienePasosPuertas ? "default" : "secondary"
                  }
                  className="text-[10px] ml-auto"
                >
                  {formulario.tienePasosPuertas ? "Sí" : "No"}
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
                <span className="text-xs font-medium">Restricciones</span>
                <Badge
                  variant={
                    formulario.tieneRestricciones ? "destructive" : "secondary"
                  }
                  className="text-[10px] ml-auto"
                >
                  {formulario.tieneRestricciones ? "Sí" : "No"}
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
              label="Altura máxima nave"
              value={formulario.alturaMaximaNave}
              unit="m"
              icon={Ruler}
            />
            <NumberDisplay
              label="Ancho pasillo actual"
              value={formulario.anchoPasilloActual}
              unit="m"
              icon={Ruler}
            />
            <NumberDisplay
              label="Superficie trabajo"
              value={formulario.superficieTrabajo}
              unit="m²"
              icon={LayoutGrid}
            />
          </div>

          {/* Condiciones del suelo */}
          {formulario.condicionesSuelo && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Condiciones del suelo
              </p>
              <p className="text-sm text-foreground">
                {formulario.condicionesSuelo}
              </p>
            </div>
          )}
        </div>
      </InfoSection>

      {/* ==================== DATOS DE LA APLICACION ==================== */}
      <InfoSection title="Datos de la aplicación" icon={Settings}>
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Descripción del producto
            </p>
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

          <Separator />

          {/* Measurements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <NumberDisplay
              label="Altura último nivel estantería"
              value={formulario.alturaUltimoNivelEstanteria}
              unit="mm"
              icon={Ruler}
            />
            <NumberDisplay
              label="Máxima altura elevación"
              value={formulario.maximaAlturaElevacion}
              unit="mm"
              icon={Ruler}
            />
            <NumberDisplay
              label="Peso carga máx. altura"
              value={formulario.pesoCargaMaximaAltura}
              unit="kg"
              icon={Package}
            />
            <NumberDisplay
              label="Peso carga primer nivel"
              value={formulario.pesoCargaPrimerNivel}
              unit="kg"
              icon={Package}
            />
            <NumberDisplay
              label="Área trabajo ancho"
              value={formulario.dimensionesAreaTrabajoAncho}
              unit="mm"
              icon={LayoutGrid}
            />
            <NumberDisplay
              label="Área trabajo fondo"
              value={formulario.dimensionesAreaTrabajoFondo}
              unit="mm"
              icon={LayoutGrid}
            />
            <NumberDisplay
              label="Turnos de trabajo"
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
                Alimentación deseada
              </p>
              <p className="text-sm font-semibold text-foreground">
                {ALIMENTACION_LABELS[formulario.alimentacionDeseada] ||
                  formulario.alimentacionDeseada}
              </p>
            </div>
          </div>
        </div>
      </InfoSection>

      {/* ==================== EQUIPOS ELECTRICOS ==================== */}
      {equipos && formulario.alimentacionDeseada === "ELECTRICO" && (
        <InfoSection title="Equipos eléctricos" icon={Zap}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipos.tipoCorriente && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tipo corriente
                </span>
                <Badge variant="outline">
                  {TIPO_CORRIENTE_LABELS[equipos.tipoCorriente] ||
                    equipos.tipoCorriente}
                </Badge>
              </div>
            )}
            <NumberDisplay label="Voltaje" value={equipos.voltaje} unit="V" />
            <NumberDisplay
              label="Frecuencia"
              value={equipos.frecuencia}
              unit="Hz"
            />
            <NumberDisplay label="Amperaje" value={equipos.amperaje} unit="A" />
            <NumberDisplay
              label="Temperatura ambiente"
              value={equipos.temperaturaAmbiente}
              unit="°C"
            />
            <NumberDisplay
              label="Horas trabajo/día"
              value={equipos.horasTrabajoPorDia}
              unit="h"
            />
          </div>
        </InfoSection>
      )}

      {/* ==================== DIMENSIONES DE CARGAS ==================== */}
      {cargas.length > 0 && (
        <InfoSection title="Dimensiones de las cargas" icon={Package}>
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
                      {carga.producto || `Carga ${index + 1}`}
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
                      <span className="text-muted-foreground">Largo</span>
                      <span className="font-medium">{carga.largo} mm</span>
                    </div>
                  )}
                  {carga.fondo !== undefined && (
                    <div className="flex justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">Fondo</span>
                      <span className="font-medium">{carga.fondo} mm</span>
                    </div>
                  )}
                  {carga.alto !== undefined && (
                    <div className="flex justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">Alto</span>
                      <span className="font-medium">{carga.alto} mm</span>
                    </div>
                  )}
                  {carga.peso !== undefined && (
                    <div className="flex justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">Peso</span>
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
        <InfoSection title="Pasillo actual" icon={Layers}>
          <div className="space-y-4">
            {/* Header descriptivo */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Ruler className="size-3.5" />
              <span>Medidas y configuración del pasillo actual</span>
            </div>

            {/* Grid de medidas */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <NumberDisplay
                label="Distancia entre estanterías"
                value={pasilloActual.distanciaEntreEstanterias}
                unit="m"
                icon={Ruler}
              />
              <NumberDisplay
                label="Distancia entre productos"
                value={pasilloActual.distanciaEntreProductos}
                unit="m"
                icon={Ruler}
              />
              <NumberDisplay
                label="Ancho pasillo disponible"
                value={pasilloActual.anchoPasilloDisponible}
                unit="m"
                icon={Ruler}
              />
              {pasilloActual.nivelEstanterias && (
                <NumberDisplay
                  label="Niveles de estanterías"
                  value={pasilloActual.nivelEstanterias}
                  icon={Layers}
                />
              )}
              <NumberDisplay
                label="Altura máx. estantería"
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
                    Tipo de estanterías
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {TIPO_ESTANTERIAS_LABELS[pasilloActual.tipoEstanterias] ||
                      pasilloActual.tipoEstanterias}
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
