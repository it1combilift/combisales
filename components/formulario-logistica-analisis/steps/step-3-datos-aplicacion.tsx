import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { TipoAlimentacion, ALIMENTACION_LABELS } from "../types";
import { CalendarIcon, Package, Ruler, Clock } from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ==================== SECTION HEADER ====================
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="hidden md:flex items-center gap-1.5 pb-1.5 border-b border-border/40 mb-2">
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
 * Step 3: Datos de la Aplicación
 * Technical information about the application
 */
export function Step3Content({ form }: StepContentProps) {
  return (
    <div className="space-y-4">
      {/* ==================== PRODUCTO ==================== */}
      <section>
        <SectionHeader icon={Package} title="Descripción del Producto" />
        <FormField
          control={form.control}
          name="descripcionProducto"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                Producto a manipular <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa el producto a manipular..."
                  className="min-h-16 sm:min-h-20 md:min-h-24 lg:min-h-28 text-sm bg-background/50 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </section>

      {/* ==================== ALTURAS, PESOS Y ÁREA ==================== */}
      <section>
        <SectionHeader icon={Ruler} title="Dimensiones y Pesos" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Altura último nivel estantería */}
          <FormField
            control={form.control}
            name="alturaUltimoNivelEstanteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                  Alt. últ. nivel <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-8 pr-7"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      m
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          {/* Máxima altura elevación */}
          <FormField
            control={form.control}
            name="maximaAlturaElevacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                  Máx. elevación <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-8 pr-7"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      m
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          {/* Peso carga máxima altura */}
          <FormField
            control={form.control}
            name="pesoCargaMaximaAltura"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                  Peso máx. alt. <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="text-sm h-8 pr-8"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      kg
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          {/* Peso carga primer nivel */}
          <FormField
            control={form.control}
            name="pesoCargaPrimerNivel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                  Peso 1er niv. <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="text-sm h-8 pr-8"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      kg
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          {/* Ancho área trabajo */}
          <FormField
            control={form.control}
            name="dimensionesAreaTrabajoAncho"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                  Ancho área <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-8 pr-7"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      m
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          {/* Fondo área trabajo */}
          <FormField
            control={form.control}
            name="dimensionesAreaTrabajoFondo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                  Fondo área <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-8 pr-7"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      m
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* ==================== OPERACIÓN Y ALIMENTACIÓN ==================== */}
      <section>
        <SectionHeader icon={Clock} title="Operación y Alimentación" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="turnosTrabajo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                  Turnos <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    className="text-sm h-8"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fechaEstimadaDefinicion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium">
                  Fecha definición
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-8 text-left text-sm font-normal justify-start",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="size-3" />
                        {field.value ? (
                          format(field.value, "dd/MM/yy", { locale: es })
                        ) : (
                          <span className="text-xs">Seleccionar</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alimentacionDeseada"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                  Alimentación <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TipoAlimentacion).map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {ALIMENTACION_LABELS[tipo]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  );
}
