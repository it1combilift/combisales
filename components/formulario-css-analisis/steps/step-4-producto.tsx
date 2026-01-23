import { Textarea } from "@/components/ui/textarea";
import { StepContentProps } from "../types";
import { useI18n } from "@/lib/i18n/context";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

/**
 * Step 1: Producto y Fecha de Cierre
 * Fields: descripcionProducto
 *
 * Este paso ahora es el primero del formulario tras la optimización.
 * Incluye la descripción del producto (requerida) y la fecha de cierre estimada (opcional).
 */
export function Step1Content({ form }: StepContentProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Descripción del producto */}
      <FormField
        control={form.control}
        name="descripcionProducto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              {t("forms.css.fields.productDescription.label")}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={t(
                  "forms.css.fields.productDescription.placeholder",
                )}
                className="min-h-40 sm:min-h-[200px] text-xs sm:text-sm bg-background/50 resize-none leading-relaxed border-input/80 focus:border-primary rounded-lg"
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
