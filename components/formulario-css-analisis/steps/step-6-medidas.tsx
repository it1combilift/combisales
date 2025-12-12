import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContenedorMedida } from "@prisma/client";
import { CONTENEDOR_MEDIDA_LABELS } from "@/interfaces/visits";
import { StepContentProps } from "../types";
import { Label } from "@/components/ui/label";

/**
 * Step 6: Container Measurements (Multi-select)
 * Fields: contenedorMedidas, contenedorMedidaOtro
 */
export function Step6Content({ form }: StepContentProps) {
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
    currentValue: ContenedorMedida[]
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
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="contenedorMedidas"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Medidas del contenedor
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormDescription className="text-[11px] text-muted-foreground mb-2">
              Seleccione todas las medidas con las que trabaja el cliente
            </FormDescription>
            <FormControl>
              <div className="space-y-3">
                {/* Standard sizes - grid layout */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {standardSizes.map((medida) => {
                    const isSelected = field.value?.includes(medida);
                    return (
                      <label
                        key={medida}
                        className={cn(
                          "flex items-center justify-between rounded-xl border-2 p-2 sm:p-3 cursor-pointer transition-all duration-200 select-none",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-input/80 hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
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
                                  field.value || []
                                )
                              );
                            }}
                            className="size-4"
                          />
                          <span className="text-xs sm:text-sm font-medium">
                            {CONTENEDOR_MEDIDA_LABELS[medida]}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="size-5 rounded-full bg-primary/15 flex items-center justify-center">
                            <Check className="size-3 text-primary" />
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Separator */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Medida personalizada
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>

                {/* Opción "Otro" */}
                <Label
                  className={cn(
                    "flex items-center justify-between rounded-xl border-2 p-2 sm:p-3 cursor-pointer transition-all duration-200 select-none",
                    hasOtroSelected
                      ? "border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10"
                      : "border-input/80 hover:border-amber-500/50 hover:bg-accent/50 hover:shadow-sm"
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
                            field.value || []
                          )
                        );
                      }}
                      className="size-4"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-medium">
                        {CONTENEDOR_MEDIDA_LABELS[ContenedorMedida.OTRO]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Especificar dimensiones adicionales
                      </span>
                    </div>
                  </div>
                  {hasOtroSelected && (
                    <div className="size-5 rounded-full bg-amber-500/15 flex items-center justify-center">
                      <Check className="size-3 text-amber-500" />
                    </div>
                  )}
                </Label>
              </div>
            </FormControl>
            <FormMessage className="text-xs" />
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
                Especificar medida
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: 45 pies, 12m x 2.5m x 2.9m..."
                  className="h-11 text-xs sm:text-sm bg-background border-input/80 focus:border-primary rounded-lg"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground text-pretty">
                Indique las dimensiones exactas (largo x ancho x alto)
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

// Alias para nuevo sistema de steps (ahora es Step 3)
export { Step6Content as Step3Content };
