import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContenedorMedida } from "@prisma/client";
import { CONTENEDOR_MEDIDA_LABELS } from "@/interfaces/visits";
import { StepContentProps } from "../types";

/**
 * Step 6: Container Measurements
 * Fields: contenedorMedida, contenedorMedidaOtro
 */
export function Step6Content({ form }: StepContentProps) {
  const standardSizes = [
    ContenedorMedida.VEINTE_PIES,
    ContenedorMedida.TREINTA_PIES,
    ContenedorMedida.CUARENTA_PIES,
    ContenedorMedida.CUARENTA_Y_CINCO_PIES,
  ];

  const specialOptions = [ContenedorMedida.TODOS, ContenedorMedida.OTRO];

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="contenedorMedida"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Medida del contenedor
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value}>
                {/* Standard sizes - grid layout */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {standardSizes.map((key) => (
                    <Label
                      key={key}
                      className={cn(
                        "flex items-center justify-between rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 select-none",
                        field.value === key
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-input/80 hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={key} className="size-3.5" />
                        <span className="text-xs font-medium">
                          {CONTENEDOR_MEDIDA_LABELS[key as ContenedorMedida]}
                        </span>
                      </div>
                      {field.value === key && (
                        <div className="size-5 rounded-full bg-primary/15 flex items-center justify-center">
                          <Check className="size-3 text-primary" />
                        </div>
                      )}
                    </Label>
                  ))}
                </div>

                {/* Separator */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Opciones adicionales
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>

                {/* Special options - full width */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {specialOptions.map((key) => {
                    const isAllSizes = key === ContenedorMedida.TODOS;
                    return (
                      <Label
                        key={key}
                        className={cn(
                          "flex items-center justify-between rounded-xl border-2 p-3 cursor-pointer transition-all duration-200 select-none",
                          field.value === key
                            ? isAllSizes
                              ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10"
                              : "border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10"
                            : "border-input/80 hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value={key} className="size-3.5" />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">
                              {
                                CONTENEDOR_MEDIDA_LABELS[
                                  key as ContenedorMedida
                                ]
                              }
                            </span>
                            <span className="text-[10px] text-muted-foreground text-balance">
                              {isAllSizes
                                ? "Trabaja con múltiples medidas"
                                : "Especificar dimensiones"}
                            </span>
                          </div>
                        </div>
                        {field.value === key && (
                          <div
                            className={cn(
                              "size-5 rounded-full flex items-center justify-center",
                              isAllSizes
                                ? "bg-emerald-500/15"
                                : "bg-amber-500/15"
                            )}
                          >
                            <Check
                              className={cn(
                                "size-3",
                                isAllSizes
                                  ? "text-emerald-500"
                                  : "text-amber-500"
                              )}
                            />
                          </div>
                        )}
                      </Label>
                    );
                  })}
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {form.watch("contenedorMedida") === ContenedorMedida.OTRO && (
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
