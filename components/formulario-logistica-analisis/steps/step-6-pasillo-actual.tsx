import { Route, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StepContentProps, TIPO_ESTANTERIAS_OPTIONS } from "../types";

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

// ==================== SECTION HEADER ====================
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="hidden md:flex items-center gap-1.5 pb-1.5 border-b border-border/40 mb-3">
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
 * Step 6: Pasillo Actual
 * Information about the current aisle configuration
 */
export function Step6Content({ form }: StepContentProps) {
  return (
    <div className="space-y-4">
      {/* ==================== DISTANCIAS DEL PASILLO ==================== */}
      <section>
        <SectionHeader icon={Route} title="Distancias del Pasillo" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Distancia entre estanterías */}
          <FormField
            control={form.control}
            name="pasilloActual.distanciaEntreEstanterias"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium">
                  Dist. entre estanterías
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-9 pr-7"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
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

          {/* Distancia entre productos */}
          <FormField
            control={form.control}
            name="pasilloActual.distanciaEntreProductos"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium">
                  Dist. entre productos
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-9 pr-7"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
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

          {/* Ancho pasillo disponible */}
          <FormField
            control={form.control}
            name="pasilloActual.anchoPasilloDisponible"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel className="text-[11px] font-medium">
                  Ancho pasillo disponible
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-9 pr-7"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
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

      {/* ==================== ESTANTERÍAS ==================== */}
      <section>
        <SectionHeader icon={Layers} title="Información de Estanterías" />
        <div className="space-y-3">
          {/* Row 1: Tipo de estanterías - full width en mobile */}
          <FormField
            control={form.control}
            name="pasilloActual.tipoEstanterias"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium">
                  Tipo de estanterías
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPO_ESTANTERIAS_OPTIONS.map((option) => (
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

          {/* Row 2: Niveles y Altura - 2 columnas */}
          <div className="grid grid-cols-2 gap-2">
            {/* Nivel de estanterías */}
            <FormField
              control={form.control}
              name="pasilloActual.nivelEstanterias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    Niveles de estanterías
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      className="text-sm h-9"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            {/* Altura máxima estantería */}
            <FormField
              control={form.control}
              name="pasilloActual.alturaMaximaEstanteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    Altura máx. estantería
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="text-sm h-9 pr-7"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseFloat(e.target.value) : null
                          )
                        }
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
        </div>
      </section>
    </div>
  );
}

// Alias export para compatibilidad con el nuevo flujo de steps
export { Step6Content as Step5Content };
