import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StepContentProps } from "../types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { FileText, CalendarDays } from "lucide-react";

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
 * Step 1: Descripción de la Operación (anteriormente Step 2)
 * Fields: notasOperacion, fechaCierre
 *
 * Este paso ahora es el primero del formulario tras la optimización.
 */
export function Step1Content({ form }: StepContentProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="hidden md:flex items-center gap-2 pb-2 border-b">
        <div className="size-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="size-3 text-primary" />
        </div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Descripción de la Operación
        </h3>
      </div>

      <FormField
        control={form.control}
        name="notasOperacion"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[11px] font-medium flex items-center gap-1">
              Notas sobre la operación
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe las condiciones y restricciones del área de trabajo..."
                className="min-h-[120px] sm:min-h-40 text-xs bg-background/50 resize-none leading-relaxed"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />

      {/* Fecha de cierre estimada */}
      <FormField
        control={form.control}
        name="fechaCierre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[11px] font-medium flex items-center gap-1">
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
                      "h-10 w-full sm:w-auto min-w-[220px] justify-start text-left font-normal text-xs rounded-lg border-input/80",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="size-4 mr-2" />
                    {field.value
                      ? format(field.value, "PPP", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ?? undefined}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  );
}

// Mantener compatibilidad con nombre anterior
export { Step1Content as Step2Content };
