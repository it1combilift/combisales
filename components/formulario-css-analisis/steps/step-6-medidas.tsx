import { cn } from "@/lib/utils";
import { StepContentProps } from "../types";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContenedorMedida } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

/**
 * Step 6: Container Measurements (Multi-select)
 * Fields: contenedorMedidas, contenedorMedidaOtro
 */
export function Step6Content({ form }: StepContentProps) {
  const { t } = useI18n();
  // Medidas estándar disponibles (sin TODOS que fue eliminado)
  const standardSizes = [
    ContenedorMedida.VEINTE_PIES,
    ContenedorMedida.TREINTA_PIES,
    ContenedorMedida.CUARENTA_PIES,
    ContenedorMedida.CUARENTA_Y_CINCO_PIES,
  ];

  const selectedMedidas = form.watch("contenedorMedidas") || [];
  const hasOtroSelected = selectedMedidas.includes(ContenedorMedida.OTRO);

  // Handler para toggle de medidas
  const handleMedidaToggle = (
    medida: ContenedorMedida,
    checked: boolean,
    currentValue: ContenedorMedida[],
  ) => {
    if (checked) {
      return [...currentValue, medida];
    } else {
      if (medida === ContenedorMedida.OTRO) {
        form.setValue("contenedorMedidaOtro", "");
      }
      return currentValue.filter((m) => m !== medida);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <FormField
        control={form.control}
        name="contenedorMedidas"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium flex items-center gap-1.5">
              {t("forms.css.fields.measurements.label")}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="space-y-3">
                {/* Standard sizes - grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {standardSizes.map((medida) => {
                    const isSelected = field.value?.includes(medida);
                    return (
                      <Label
                        key={medida}
                        className={cn(
                          "flex items-center justify-between rounded-xl border-2 p-2 sm:p-3 cursor-pointer transition-all duration-200 select-none",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-input/80 hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm",
                        )}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              field.onChange(
                                handleMedidaToggle(
                                  medida,
                                  !!checked,
                                  field.value || [],
                                ),
                              );
                            }}
                            className="size-4"
                          />
                          <span className="text-sm font-medium">
                            {t(`visits.containerMeasures.${medida}` as any)}
                          </span>
                        </div>
                      </Label>
                    );
                  })}
                </div>

                {/* Separator */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t("forms.css.fields.measurements.customLabel")}
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>

                {/* Opción "Otro" */}
                <Label
                  className={cn(
                    "flex items-center justify-between rounded-xl border-2 p-2 sm:p-3 cursor-pointer transition-all duration-200 select-none",
                    hasOtroSelected
                      ? "border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10"
                      : "border-input/80 hover:border-amber-500/50 hover:bg-accent/50 hover:shadow-sm",
                  )}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox
                      checked={hasOtroSelected}
                      onCheckedChange={(checked) => {
                        field.onChange(
                          handleMedidaToggle(
                            ContenedorMedida.OTRO,
                            !!checked,
                            field.value || [],
                          ),
                        );
                      }}
                      className="size-4"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {t(
                          `visits.containerMeasures.${ContenedorMedida.OTRO}` as any,
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("forms.css.fields.measurements.specifyAdditional")}
                      </span>
                    </div>
                  </div>
                </Label>
              </div>
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      {hasOtroSelected && (
        <FormField
          control={form.control}
          name="contenedorMedidaOtro"
          render={({ field }) => (
            <FormItem className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                {t("forms.css.fields.measurements.specifyLabel")}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    "forms.css.fields.measurements.specifyPlaceholder",
                  )}
                  className="h-11 text-xs sm:text-sm bg-background border-input/80 focus:border-primary rounded-lg"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground text-pretty">
                {t("forms.css.fields.measurements.specifyDescription")}
              </FormDescription>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

// Alias para nuevo sistema de steps (ahora es Step 3)
export { Step6Content as Step3Content };
