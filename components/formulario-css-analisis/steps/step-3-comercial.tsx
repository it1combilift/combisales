import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StepContentProps } from "../types";
import { FieldWrapper } from "../ui/field-wrapper";
import { Briefcase, Phone, CalendarDays } from "lucide-react";

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
 * Step 3: Commercial Information
 * Fields: distribuidor, contactoDistribuidor, fechaCierre, datosClienteUsuarioFinal
 */
export function Step3Content({ form }: StepContentProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <FieldWrapper icon={Briefcase}>
          <FormField
            control={form.control}
            name="distribuidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Distribuidor
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre del distribuidor"
                    className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        <FieldWrapper icon={Phone}>
          <FormField
            control={form.control}
            name="contactoDistribuidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Contacto distribuidor
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email o teléfono"
                    className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>

      <FormField
        control={form.control}
        name="fechaCierre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Fecha de cierre estimada
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 sm:h-12 w-full justify-start text-left font-normal text-xs sm:text-sm rounded-lg border-input/80",
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

      <FieldWrapper>
        <FormField
          control={form.control}
          name="datosClienteUsuarioFinal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                Notas del usuario final
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional sobre el cliente o proyecto..."
                  className="min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm bg-background/50 resize-none border-input/80 focus:border-primary rounded-lg leading-relaxed"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldWrapper>
    </div>
  );
}
