import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { StepContentProps } from "../types";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

/**
 * Step 1: Producto y Fecha de Cierre
 * Fields: descripcionProducto, fechaCierre
 *
 * Este paso ahora es el primero del formulario tras la optimización.
 * Incluye la descripción del producto (requerida) y la fecha de cierre estimada (opcional).
 */
export function Step1Content({ form }: StepContentProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Descripción del producto */}
      <FormField
        control={form.control}
        name="descripcionProducto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Descripción detallada del proyecto
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describa detalladamente el producto, incluyendo capacidades, dimensiones, frecuencia de uso..."
                className="min-h-40 sm:min-h-[200px] text-xs sm:text-sm bg-background/50 resize-none leading-relaxed border-input/80 focus:border-primary rounded-lg"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Fecha de cierre estimada */}
      <FormField
        control={form.control}
        name="fechaCierre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Fecha de cierre estimada
              <span className="text-muted-foreground text-[10px] ml-1">
                (opcional)
              </span>
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 sm:h-12 w-full sm:w-auto min-w-60 justify-start text-left font-normal text-xs sm:text-sm rounded-lg border-input/80",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="size-4" />
                    {field.value
                      ? format(field.value, "PPP", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}
