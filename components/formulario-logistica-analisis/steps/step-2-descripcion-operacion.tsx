import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StepContentProps } from "../types";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  ArrowUpDown,
  DoorOpen,
  AlertTriangle,
  Route,
  Layers,
  Building,
  CalendarDays,
} from "lucide-react";

/**
 * Step 1: Descripción de la Operación - Logística
 * (Antes Step 2, renumerado tras eliminar datos del cliente)
 * Includes fechaCierre and additional fields for ramps, doors, restrictions, etc.
 */
export function Step1Content({ form }: StepContentProps) {
  const { t, locale } = useI18n();
  const tieneRampas = form.watch("tieneRampas");
  const tienePasosPuertas = form.watch("tienePasosPuertas");
  const tieneRestricciones = form.watch("tieneRestricciones");

  return (
    <div className="space-y-4">
      {/* ==================== NOTAS OPERACIÓN ==================== */}
      <section>
        <FormField
          control={form.control}
          name="notasOperacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                {t("forms.logistica.fields.operation.notes.label")}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    "forms.logistica.fields.operation.notes.placeholder"
                  )}
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
        <div className="space-y-4">
          {/* Rampas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium flex items-center gap-2">
                <ArrowUpDown className="size-3.5 text-muted-foreground" />
                {t("forms.logistica.fields.operation.ramps.label")}
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
                        placeholder={t(
                          "forms.logistica.fields.operation.ramps.placeholder"
                        )}
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
                {t("forms.logistica.fields.operation.doors.label")}
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
                        placeholder={t(
                          "forms.logistica.fields.operation.doors.placeholder"
                        )}
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
                {t("forms.logistica.fields.operation.restrictions.label")}
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
                        placeholder={t(
                          "forms.logistica.fields.operation.restrictions.placeholder"
                        )}
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
        <div className="space-y-4">
          {/* Row 1: Dimensiones principales */}
          <div className="grid grid-cols-2 gap-2">
            {/* Altura máxima nave */}
            <FormField
              control={form.control}
              name="alturaMaximaNave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    <Building className="size-3 text-muted-foreground" />
                    {t("forms.logistica.fields.operation.maxHeight.label")} (m)
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

            {/* Ancho pasillo actual */}
            <FormField
              control={form.control}
              name="anchoPasilloActual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    <Route className="size-3 text-muted-foreground" />
                    {t("forms.logistica.fields.operation.aisleWidth.label")} (m)
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

            {/* Superficie de trabajo */}
            <FormField
              control={form.control}
              name="superficieTrabajo"
              render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    <Layers className="size-3 text-muted-foreground" />
                    {t("forms.logistica.fields.operation.surface.label")} (m²)
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

          {/* Row 2: Tipo operación y Condiciones suelo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Tipo operación */}
            <FormField
              control={form.control}
              name="tipoOperacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    {t("forms.logistica.fields.operation.type.label")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm w-full">
                        <SelectValue placeholder={t("common.select")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="almacenamiento" className="text-sm">
                        {t("forms.logistica.options.operationType.storage")}
                      </SelectItem>
                      <SelectItem value="cross-docking" className="text-sm">
                        {t(
                          "forms.logistica.options.operationType.crossDocking"
                        )}
                      </SelectItem>
                      <SelectItem value="picking" className="text-sm">
                        {t("forms.logistica.options.operationType.picking")}
                      </SelectItem>
                      <SelectItem value="carga-descarga" className="text-sm">
                        {t(
                          "forms.logistica.options.operationType.loadingUnloading"
                        )}
                      </SelectItem>
                      <SelectItem
                        value="preparacion-pedidos"
                        className="text-sm"
                      >
                        {t("forms.logistica.options.operationType.orderPrep")}
                      </SelectItem>
                      <SelectItem value="mixto" className="text-sm">
                        {t("forms.logistica.options.operationType.mixed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* Condiciones suelo */}
            <FormField
              control={form.control}
              name="condicionesSuelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    {t("forms.logistica.fields.operation.floor.label")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.logistica.fields.operation.floor.placeholder"
                      )}
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

      {/* ==================== FECHA CIERRE ==================== */}
      <section className="w-full">
        <FormField
          control={form.control}
          name="fechaCierre"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-[11px] font-medium">
                {t("forms.logistica.fields.operation.closingDate.label")}
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-8 text-xs",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="size-4" />
                      {field.value
                        ? format(field.value, "PPP", {
                            locale: locale === "en" ? undefined : es,
                          })
                        : t("forms.selectDate")}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value!}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={locale === "en" ? undefined : es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </section>
    </div>
  );
}

// Alias export para compatibilidad
export { Step1Content as Step2Content };
