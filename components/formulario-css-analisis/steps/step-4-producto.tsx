import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { StepContentProps } from "../types";

/**
 * Step 4: Product Description
 * Fields: descripcionProducto
 */
export function Step4Content({ form }: StepContentProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <FormField
        control={form.control}
        name="descripcionProducto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Descripción detallada
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describa detalladamente el producto, incluyendo capacidades, dimensiones, frecuencia de uso..."
                className="min-h-[180px] sm:min-h-[220px] text-xs sm:text-sm bg-background/50 resize-none leading-relaxed border-input/80 focus:border-primary rounded-lg"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}
