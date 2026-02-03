import { TipoAlimentacion } from "../types";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { Package, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

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
    <div className="hidden md:flex items-center gap-1.5 pb-1.5 border-b border-border/40 mb-2">
      <div className="size-5 rounded bg-primary/10 flex items-center justify-center">
        <Icon className="size-3 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide text-balance">
        {title}
      </h3>
    </div>
  );
}

/**
 * Step 3: Datos de la Aplicación
 * Technical information about the application
 * Optimized layout with grouped fields
 */
export function Step3Content({ form }: StepContentProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col space-y-3 sm:space-y-4 pb-2">
      {/* ==================== PRODUCTO ==================== */}
      <section>
        <FormField
          control={form.control}
          name="descripcionProducto"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm flex items-center gap-1">
                {t("forms.industrial.fields.productDescription.label")}{" "}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    "forms.industrial.fields.productDescription.placeholder",
                  )}
                  className="text-sm h-8 pr-7 text-pretty"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </section>

      {/* ==================== ALTURAS, PESOS Y ÁREA EN UNA SOLA SECCIÓN ==================== */}
      <section>
        <div className="grid grid-cols-1 gap-2">
          {/* Altura último nivel estantería */}
          <FormField
            control={form.control}
            name="alturaUltimoNivelEstanteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm flex items-center gap-1 text-balance">
                  {t(
                    "forms.industrial.fields.dimensionsAndWeights.lastLevelHeight",
                  )}{" "}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-8 pr-7 text-pretty"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      m
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          {/* Máxima altura elevación */}
          <FormField
            control={form.control}
            name="maximaAlturaElevacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm flex items-center gap-1 text-balance">
                  {t(
                    "forms.industrial.fields.dimensionsAndWeights.maxElevation",
                  )}{" "}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-8 pr-7 text-pretty"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      m
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          {/* Peso carga máxima altura */}
          <FormField
            control={form.control}
            name="pesoCargaMaximaAltura"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm flex items-center gap-1 text-balance">
                  {t(
                    "forms.industrial.fields.dimensionsAndWeights.maxHeightLoadWeight",
                  )}{" "}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="text-sm h-8 pr-8 text-pretty"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      kg
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          {/* Peso carga primer nivel */}
          <FormField
            control={form.control}
            name="pesoCargaPrimerNivel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm flex items-center gap-1 text-balance">
                  {t(
                    "forms.industrial.fields.dimensionsAndWeights.firstLevelLoadWeight",
                  )}{" "}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      className="text-sm h-8 pr-8 text-pretty"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      kg
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          {/* Ancho área trabajo */}
          <FormField
            control={form.control}
            name="dimensionesAreaTrabajoAncho"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm flex items-center gap-1 text-balance">
                  {t(
                    "forms.industrial.fields.dimensionsAndWeights.areaWidth",
                  )}{" "}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-8 pr-7 text-pretty"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      m
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          {/* Fondo área trabajo */}
          <FormField
            control={form.control}
            name="dimensionesAreaTrabajoFondo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm flex items-center gap-1 text-balance">
                  {t(
                    "forms.industrial.fields.dimensionsAndWeights.areaDepth",
                  )}{" "}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-sm h-8 pr-7 text-pretty"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      value={field.value ?? ""}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      m
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* ==================== OPERACIÓN Y ALIMENTACIÓN ==================== */}
      <section>
        <SectionHeader
          icon={Clock}
          title={t("forms.industrial.fields.operationAndPower.header")}
        />
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="turnosTrabajo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm flex items-center gap-1 text-balance">
                  {t("forms.industrial.fields.operationAndPower.shifts")}{" "}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    className="text-sm h-8 text-pretty"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alimentacionDeseada"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm flex items-center gap-1 text-balance">
                  {t(
                    "forms.industrial.fields.operationAndPower.powerSource",
                  )}{" "}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-sm w-full text-pretty">
                      <SelectValue placeholder={t("forms.selectOption")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TipoAlimentacion).map((tipo) => (
                      <SelectItem
                        key={tipo}
                        value={tipo}
                        className="text-sm text-pretty"
                      >
                        {t(`visits.powerTypes.${tipo}` as any)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  );
}

// Alias export para compatibilidad con el nuevo flujo de steps
export { Step3Content as Step2Content };
