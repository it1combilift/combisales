import { StepContentProps } from "../types";
import { useI18n } from "@/lib/i18n/context";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="pb-2 h-full flex flex-col">
      {/* Descripción del producto */}
      <FormField
        control={form.control}
        name="descripcionProducto"
        render={({ field }) => (
          <FormItem className="flex flex-col flex-1">
            <FormLabel className="text-sm font-medium flex items-center gap-1.5">
              {t("forms.css.fields.productDescription.label")}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl className="flex-1">
              <Textarea
                placeholder={t(
                  "forms.css.fields.productDescription.placeholder",
                )}
                className="h-full min-h-[200px] sm:min-h-0 text-sm bg-background/50 resize-none leading-relaxed border-input/80 focus:border-primary rounded-lg"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
}
