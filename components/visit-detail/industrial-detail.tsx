"use client";

import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AttachmentsGallery from "@/components/attachments-gallery";
import { InfoField, InfoSection, NumberDisplay } from "./shared";
import { FormularioIndustrialAnalisis } from "@/interfaces/visits";

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
  Factory,
  Zap,
  Package,
  LayoutGrid,
  Clock,
  Settings,
  Layers,
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

// Labels para especificaciones de pasillo
const ESPECIFICACIONES_PASILLO_LABELS: Record<string, string> = {
  profundidadProducto: "Profundidad del producto",
  anchoLibreEntreProductos: "Ancho libre entre productos",
  distanciaLibreEntreEstanterias: "Distancia libre entre estanterías",
  fondoUtilEstanteria: "Fondo útil de estantería",
  alturaBaseEstanteria: "Altura base de estantería",
  distanciaBajoRielesGuia: "Distancia bajo rieles guía",
  alturaSueloPrimerBrazo: "Altura suelo - primer brazo",
  distanciaEntreRielesGuia: "Distancia entre rieles guía",
  alturaLibreHastaGuia: "Altura libre hasta guía",
  grosorPilarColumna: "Grosor pilar/columna",
  alturaUltimoNivel: "Altura último nivel",
  alturaMaximaInteriorEdificio: "Altura máxima interior edificio",
};

interface IndustrialDetailProps {
  formulario: FormularioIndustrialAnalisis;
}

export function IndustrialDetail({ formulario }: IndustrialDetailProps) {
  const equipos = formulario.equiposElectricos;
  const especificaciones = formulario.especificacionesPasillo;
  const cargas = formulario.dimensionesCargas || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <Factory className="size-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-semibold tracking-tight">
            Detalles del formulario
          </h2>
          <p className="text-xs text-muted-foreground">Análisis Industrial</p>
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
            <NumberDisplay
              label="Potencia disponible"
              value={equipos.potenciaDisponible}
              unit="kW"
            />
            <NumberDisplay
              label="Distancia punto recarga"
              value={equipos.distanciaPuntoRecarga}
              unit="m"
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
                  {carga.ancho !== undefined && (
                    <div className="flex justify-between p-2 rounded-lg bg-background/50">
                      <span className="text-muted-foreground">Ancho</span>
                      <span className="font-medium">{carga.ancho} mm</span>
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

      {/* ==================== ESPECIFICACIONES DEL PASILLO ==================== */}
      {especificaciones && (
        <InfoSection title="Especificaciones del pasillo" icon={Layers}>
          <div className="space-y-4">
            {/* Header descriptivo */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Ruler className="size-3.5" />
              <span>Medidas y dimensiones registradas (en milímetros)</span>
            </div>

            {/* Grid responsive de especificaciones */}
            {(() => {
              // Crear array de campos con sus valores
              const especificacionesData = Object.entries(
                ESPECIFICACIONES_PASILLO_LABELS
              )
                .map(([key, label]) => ({
                  key,
                  label,
                  value: (
                    especificaciones as Record<
                      string,
                      number | null | undefined
                    >
                  )[key],
                }))
                .filter((item) => item.value != null);

              if (especificacionesData.length === 0) {
                return (
                  <div className="flex items-center justify-center p-6 rounded-xl bg-muted/30 border border-dashed border-border">
                    <p className="text-sm text-muted-foreground italic">
                      No se han registrado especificaciones de pasillo.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {especificacionesData.map(({ key, label, value }) => (
                    <div
                      key={key}
                      className="flex flex-col p-3 sm:p-4 rounded-xl bg-linear-to-br from-muted/50 to-muted/20 border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                    >
                      {/* Etiqueta */}
                      <span className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-1.5 leading-tight">
                        {label}
                      </span>

                      {/* Valor */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                          {typeof value === "number"
                            ? value.toLocaleString("es-ES")
                            : value}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          mm
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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
