import { TipoAlimentacion } from "../types";
import { StepContentProps } from "../types";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Package, Ruler, Clock } from "lucide-react";

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
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide text-balance">
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
  const { t } = useI18n();
  return (
    <div className="space-y-3 sm:space-y-4 pb-2">
      {/* ==================== PRODUCTO ==================== */}
      <section>
        <FormField
          control={form.control}
          name="descripcionProducto"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-1">
                {t(
                  "forms.logistica.fields.application.productDescription.label",
                )}{" "}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    "forms.logistica.fields.application.productDescription.placeholder",
                  )}
                  className="text-sm h-8 pr-7"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </section>

      {/* ==================== ALTURAS, PESOS Y ÁREA ==================== */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {/* Altura último nivel estantería */}
          <FormField
            control={form.control}
            name="alturaUltimoNivelEstanteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-1 text-balance">
                  {t(
                    "forms.logistica.fields.application.lastLevelHeight.label",
                  )}{" "}
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
                <FormLabel className="text-sm font-medium flex items-center gap-1 text-balance">
                  {t(
                    "forms.logistica.fields.application.maxLiftHeight.label",
                  )}{" "}
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
                <FormLabel className="text-sm font-medium flex items-center gap-1 text-balance">
                  {t(
                    "forms.logistica.fields.application.maxLoadWeight.label",
                  )}{" "}
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
                <FormLabel className="text-sm font-medium flex items-center gap-1 text-balance">
                  {t(
                    "forms.logistica.fields.application.firstLevelLoadWeight.label",
                  )}{" "}
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
                <FormLabel className="text-sm font-medium flex items-center gap-1 text-balance">
                  {t(
                    "forms.logistica.fields.application.workAreaWidth.label",
                  )}{" "}
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
                <FormLabel className="text-sm font-medium flex items-center gap-1 text-balance">
                  {t(
                    "forms.logistica.fields.application.workAreaDepth.label",
                  )}{" "}
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
          title={t(
            "forms.logistica.fields.application.headers.operationAndPower",
          )}
        />
        <div className="grid grid-cols-2 gap-2 w-full">
          <FormField
            control={form.control}
            name="turnosTrabajo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium flex items-center gap-1 text-balance">
                  {t("forms.logistica.fields.application.shifts.label")}{" "}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder={t(
                      "forms.logistica.fields.application.shifts.placeholder",
                    )}
                    className="text-sm h-8 w-full"
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
                <FormLabel className="text-sm font-medium flex items-center gap-1 text-balance">
                  {t(
                    "forms.logistica.fields.application.powerSource.label",
                  )}{" "}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TipoAlimentacion).map((tipo) => (
                      <SelectItem key={tipo} value={tipo} className="text-sm">
                        {t(`common.powerSource.${tipo}`)}
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
