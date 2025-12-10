import { StepContentProps } from "../types";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Lightbulb } from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

/**
 * Step 2: Descripción de la Operación - Ultra Compact
 */
export function Step2Content({ form }: StepContentProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
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
                className="min-h-[120px] sm:min-h-[180px] text-xs bg-background/50 resize-none leading-relaxed"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-[10px]" />
          </FormItem>
        )}
      />
    </div>
  );
}
