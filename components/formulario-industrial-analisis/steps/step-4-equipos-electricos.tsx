import { Zap } from "lucide-react";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { AlertMessage } from "@/components/alert";
import { TipoAlimentacion } from "@prisma/client";
import { TipoCorriente, TIPO_CORRIENTE_LABELS } from "../types";

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

/**
 * Step 4: Equipos Eléctricos - Ultra Compact
 */
export function Step4Content({ form }: StepContentProps) {
  const alimentacion = form.watch("alimentacionDeseada");

  if (alimentacion !== TipoAlimentacion.ELECTRICO) {
    return (
      <div className="flex items-center justify-center">
        <AlertMessage
          variant="info"
          title="No se requieren especificaciones eléctricas"
          description="Dado que la alimentación deseada no es eléctrica, no es necesario completar las especificaciones eléctricas."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="hidden md:flex items-center gap-2 pb-2 border-b">
        <div className="size-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <Zap className="size-3 text-primary" />
        </div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Especificaciones Eléctricas
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Tipo de corriente */}
        <FormField
          control={form.control}
          name="equiposElectricos.tipoCorriente"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-[11px] font-medium">
                Tipo corriente
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="h-8 text-sm w-full">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(TipoCorriente).map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {TIPO_CORRIENTE_LABELS[tipo]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        {/* Voltaje */}
        <FormField
          control={form.control}
          name="equiposElectricos.voltaje"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium">Voltaje</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="220"
                    className="text-sm h-8 pr-6"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    V
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        {/* Frecuencia */}
        <FormField
          control={form.control}
          name="equiposElectricos.frecuencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium">
                Frecuencia
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="50"
                    className="text-sm h-8 pr-7"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    Hz
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        {/* Amperaje */}
        <FormField
          control={form.control}
          name="equiposElectricos.amperaje"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium">
                Amperaje
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="16"
                    className="text-sm h-8 pr-5"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    A
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        {/* Temperatura */}
        <FormField
          control={form.control}
          name="equiposElectricos.temperaturaAmbiente"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium">
                Temp. ambiente
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="20"
                    className="text-sm h-8 pr-6"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    °C
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        {/* Horas trabajo */}
        <FormField
          control={form.control}
          name="equiposElectricos.horasTrabajoPorDia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium">
                Horas/día
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    placeholder="8"
                    className="text-sm h-8 pr-5"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    h
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
