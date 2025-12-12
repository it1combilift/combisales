import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContenedorTipo } from "@prisma/client";
import { CONTENEDOR_TIPO_LABELS } from "@/interfaces/visits";
import { CONTENEDOR_TIPO_ICONS } from "@/constants/visits";
import { StepContentProps } from "../types";

/**
 * Step 5: Container Types and Operation
 * Fields: contenedorTipos, contenedoresPorSemana, condicionesSuelo
 */
export function Step5Content({ form }: StepContentProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <FormField
        control={form.control}
        name="contenedorTipos"
        render={({ field }) => {
          // Separate location types (mutual exclusive) from environment types (can select both)
          const locationTypes: ContenedorTipo[] = [
            ContenedorTipo.SOBRE_CAMION,
            ContenedorTipo.EN_SUELO,
          ];
          const environmentTypes: ContenedorTipo[] = [
            ContenedorTipo.INTERIOR,
            ContenedorTipo.EXTERIOR,
          ];

          // Get current selections
          const selectedLocation = field.value?.find((v: ContenedorTipo) =>
            locationTypes.includes(v)
          );
          const selectedEnvironments =
            field.value?.filter((v: ContenedorTipo) =>
              environmentTypes.includes(v)
            ) || [];

          // Handle location selection (mutual exclusive)
          const handleLocationChange = (location: ContenedorTipo) => {
            const currentEnvironments =
              field.value?.filter((v: ContenedorTipo) =>
                environmentTypes.includes(v)
              ) || [];
            field.onChange([location, ...currentEnvironments]);
          };

          // Handle environment selection (can select multiple)
          const handleEnvironmentChange = (
            environment: ContenedorTipo,
            checked: boolean
          ) => {
            const currentLocation = field.value?.find((v: ContenedorTipo) =>
              locationTypes.includes(v)
            );
            const currentEnvironments =
              field.value?.filter((v: ContenedorTipo) =>
                environmentTypes.includes(v)
              ) || [];

            let newEnvironments: ContenedorTipo[];
            if (checked) {
              newEnvironments = [...currentEnvironments, environment];
            } else {
              newEnvironments = currentEnvironments.filter(
                (v: ContenedorTipo) => v !== environment
              );
            }

            field.onChange(
              currentLocation
                ? [currentLocation, ...newEnvironments]
                : newEnvironments
            );
          };

          return (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                Tipo de contenedor
                <span className="text-destructive">*</span>
              </FormLabel>

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Ubicación del contenedor
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {locationTypes.map((key) => {
                      const isChecked = selectedLocation === key;
                      const Icon = CONTENEDOR_TIPO_ICONS[key];
                      const label = CONTENEDOR_TIPO_LABELS[key];
                      return (
                        <Label
                          key={key}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border-2 p-1 cursor-pointer transition-all duration-200 select-none group",
                            isChecked
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                              : "border-input/80 hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                          )}
                          onClick={() => handleLocationChange(key)}
                        >
                          <div
                            className={cn(
                              "size-8 rounded-xl flex items-center justify-center transition-all duration-200",
                              isChecked
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            )}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium block text-balance">
                              {label}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                              isChecked
                                ? "border-primary bg-primary"
                                : "border-input/80 bg-background"
                            )}
                          >
                            {isChecked && (
                              <Check className="size-3 text-primary-foreground" />
                            )}
                          </div>
                        </Label>
                      );
                    })}
                  </div>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Ambiente de trabajo
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>

                {/* Environment Type - Can select multiple */}
                <div className="space-y-2">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Selecciona uno o ambos
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {environmentTypes.map((key) => {
                      const isChecked = selectedEnvironments.includes(key);
                      const Icon = CONTENEDOR_TIPO_ICONS[key];
                      const label = CONTENEDOR_TIPO_LABELS[key];
                      return (
                        <Label
                          key={key}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border-2 p-1 cursor-pointer transition-all duration-200 select-none group",
                            isChecked
                              ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10"
                              : "border-input/80 hover:border-emerald-500/50 hover:bg-accent/50 hover:shadow-sm"
                          )}
                        >
                          <div
                            className={cn(
                              "size-8 rounded-xl flex items-center justify-center transition-all duration-200",
                              isChecked
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-600"
                            )}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium block text-pretty">
                              {label}
                            </span>
                          </div>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleEnvironmentChange(key, !!checked)
                            }
                            className={cn(
                              "size-4 border-2 rounded-sm transition-all duration-200",
                              isChecked
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-input/80 bg-background/50"
                            )}
                          />
                        </Label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <FormMessage className="text-xs" />
            </FormItem>
          );
        }}
      />

      <div className="pt-4 border-t border-border/60">
        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          <FormField
            control={form.control}
            name="contenedoresPorSemana"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Contenedores por semana
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 5"
                    min={1}
                    className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condicionesSuelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Condiciones del suelo
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Compactado, rocoso..."
                    className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

// Alias para nuevo sistema de steps (ahora es Step 2)
export { Step5Content as Step2Content };
