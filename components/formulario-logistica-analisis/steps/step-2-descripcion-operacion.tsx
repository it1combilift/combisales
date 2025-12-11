import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { StepContentProps, TIPO_OPERACION_OPTIONS } from "../types";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  FileText,
  ArrowUpDown,
  DoorOpen,
  AlertTriangle,
  Warehouse,
  Route,
  Layers,
  Building,
} from "lucide-react";

// ==================== SECTION HEADER ====================
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/40 mb-3">
      <div className="size-5 rounded bg-primary/10 flex items-center justify-center">
        <Icon className="size-3 text-primary" />
      </div>
      <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

/**
 * Step 2: Descripción de la Operación - Logística
 * Includes additional fields for ramps, doors, restrictions, etc.
 */
export function Step2Content({ form }: StepContentProps) {
  const tieneRampas = form.watch("tieneRampas");
  const tienePasosPuertas = form.watch("tienePasosPuertas");
  const tieneRestricciones = form.watch("tieneRestricciones");

  return (
    <div className="space-y-5">
      {/* ==================== NOTAS OPERACIÓN ==================== */}
      <section>
        <SectionHeader icon={FileText} title="Descripción General" />
        <FormField
          control={form.control}
          name="notasOperacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                Notas sobre la operación
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe las condiciones generales de la operación logística, flujos de trabajo, frecuencias, etc."
                  className="min-h-[100px] text-xs bg-background/50 resize-none leading-relaxed"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </section>

      {/* ==================== CONDICIONES ESPECIALES ==================== */}
      <section>
        <SectionHeader icon={AlertTriangle} title="Condiciones Especiales" />
        <div className="space-y-4">
          {/* Rampas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium flex items-center gap-2">
                <ArrowUpDown className="size-3.5 text-muted-foreground" />
                ¿Existen rampas?
              </Label>
              <FormField
                control={form.control}
                name="tieneRampas"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {tieneRampas && (
              <FormField
                control={form.control}
                name="notasRampas"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Describe las rampas: ubicación, pendiente, dimensiones..."
                        className="min-h-[60px] text-xs bg-background/50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Pasos por puertas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium flex items-center gap-2">
                <DoorOpen className="size-3.5 text-muted-foreground" />
                ¿Hay pasos por puertas?
              </Label>
              <FormField
                control={form.control}
                name="tienePasosPuertas"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {tienePasosPuertas && (
              <FormField
                control={form.control}
                name="notasPasosPuertas"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Describe los pasos por puertas: dimensiones, altura, ancho..."
                        className="min-h-[60px] text-xs bg-background/50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Restricciones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium flex items-center gap-2">
                <AlertTriangle className="size-3.5 text-muted-foreground" />
                ¿Hay otras restricciones?
              </Label>
              <FormField
                control={form.control}
                name="tieneRestricciones"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {tieneRestricciones && (
              <FormField
                control={form.control}
                name="notasRestricciones"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Describe otras restricciones: obstáculos, columnas, zonas de tránsito limitado..."
                        className="min-h-[60px] text-xs bg-background/50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </section>

      {/* ==================== DATOS DE LA NAVE ==================== */}
      <section>
        <SectionHeader icon={Warehouse} title="Datos de la Nave" />
        <div className="grid grid-cols-12 gap-x-2 gap-y-3">
          {/* Altura máxima nave */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-3">
            <FormField
              control={form.control}
              name="alturaMaximaNave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    <Building className="size-3 text-muted-foreground" />
                    Altura nave (m)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      className="text-sm h-9"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Ancho pasillo actual */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-3">
            <FormField
              control={form.control}
              name="anchoPasilloActual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    <Route className="size-3 text-muted-foreground" />
                    Ancho pasillo (m)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      className="text-sm h-9"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Superficie de trabajo */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-3">
            <FormField
              control={form.control}
              name="superficieTrabajo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    <Layers className="size-3 text-muted-foreground" />
                    Superficie (m²)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="0"
                      className="text-sm h-9"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Tipo operación */}
          <div className="col-span-6 sm:col-span-6 lg:col-span-3">
            <FormField
              control={form.control}
              name="tipoOperacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    Tipo de operación
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPO_OPERACION_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-sm"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Condiciones suelo */}
          <div className="col-span-12 sm:col-span-6">
            <FormField
              control={form.control}
              name="condicionesSuelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    Condiciones del suelo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hormigón, resina, irregular..."
                      className="text-sm h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
