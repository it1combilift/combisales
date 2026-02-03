"use client";

import { cn } from "@/lib/utils";
import { Weight, Box } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { CONTAINER_SIZES } from "../constants";
import { UseFormReturn } from "react-hook-form";
import { AlertMessage } from "@/components/alert";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

// ==================== CONTAINER SIZE CARD ====================
interface ContainerSizeCardProps {
  form: UseFormReturn<any>;
  sizeKey: string;
  label: string;
  quantityLabel: string;
}

function ContainerSizeCard({
  form,
  sizeKey,
  label,
  quantityLabel,
}: ContainerSizeCardProps) {
  return (
    <FormField
      control={form.control}
      name={`contenedoresTamanios.${sizeKey}.selected`}
      render={({ field: selectedField }) => {
        const isSelected = selectedField.value;

        return (
          <div
            className={cn(
              "rounded-lg border p-2.5 sm:p-3 transition-all",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "hover:border-primary/40",
            )}
          >
            {/* Size header with checkbox */}
            <FormItem className="flex items-center gap-2 cursor-pointer select-none mb-2">
              <FormControl>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => selectedField.onChange(checked)}
                  className="size-3.5"
                />
              </FormControl>
              <div
                className="flex items-center gap-1.5"
                onClick={() => selectedField.onChange(!isSelected)}
              >
                <Box
                  className={cn(
                    "size-3.5",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <FormLabel className="text-sm font-semibold cursor-pointer">
                  {label}
                </FormLabel>
              </div>
            </FormItem>

            {/* Quantity input */}
            <FormField
              control={form.control}
              name={`contenedoresTamanios.${sizeKey}.cantidad`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-muted-foreground">
                    {quantityLabel}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      disabled={!isSelected}
                      className={cn(
                        "text-center text-xs h-8",
                        !isSelected && "opacity-50",
                      )}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );
      }}
    />
  );
}

/**
 * Step 3: Cuadro 1 - Contenedores
 */
export function Step3Content({ form }: StepContentProps) {
  const { t } = useI18n();
  const manejaContenedores = form.watch("manejaContenedores");

  if (!manejaContenedores) {
    return (
      <div className="flex items-center justify-center py-6">
        <AlertMessage
          variant="info"
          title={t("forms.straddleCarrier.fields.notApplicable.title")}
          description={t(
            "forms.straddleCarrier.fields.notApplicable.containersDescription",
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-full pb-2">
      {/* ==================== OPCIONES GENERALES ==================== */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Manejo de contenedores individuales */}
          <FormField
            control={form.control}
            name="manejaContenedoresIndiv"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all select-none",
                  field.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-muted/30",
                )}
              >
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
                <div
                  className="flex-1 min-w-0"
                  onClick={() => field.onChange(!field.value)}
                >
                  <FormLabel className="text-sm font-medium cursor-pointer leading-tight">
                    {t(
                      "forms.straddleCarrier.fields.containers.individualHandling.label",
                    )}
                  </FormLabel>
                  <FormDescription className="text-sm leading-tight text-pretty">
                    {t(
                      "forms.straddleCarrier.fields.containers.individualHandling.description",
                    )}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Doble apilamiento */}
          <FormField
            control={form.control}
            name="dobleApilamiento"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all select-none",
                  field.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-muted/30",
                )}
              >
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
                <div
                  className="flex-1 min-w-0"
                  onClick={() => field.onChange(!field.value)}
                >
                  <FormLabel className="text-sm font-medium cursor-pointer leading-tight">
                    {t(
                      "forms.straddleCarrier.fields.containers.doubleStacking.label",
                    )}
                  </FormLabel>
                  <FormDescription className="text-sm leading-tight text-pretty">
                    {t(
                      "forms.straddleCarrier.fields.containers.doubleStacking.description",
                    )}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* ==================== TAMAÑOS DE CONTENEDORES - Card Grid ==================== */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CONTAINER_SIZES.map((size) => (
            <ContainerSizeCard
              key={size.key}
              form={form}
              sizeKey={size.key}
              label={size.label}
              quantityLabel={t(
                "forms.straddleCarrier.fields.containers.quantityPerWeek",
              )}
            />
          ))}
        </div>
      </section>

      {/* ==================== PESO MÁXIMO ==================== */}
      <section>
        <FormField
          control={form.control}
          name="pesoMaximoContenedor"
          render={({ field }) => (
            <FormItem className="max-w-xs">
              <FormLabel className="text-sm font-medium">
                {t("forms.straddleCarrier.fields.containers.maxWeight.label")}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Weight className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    className="text-sm h-9 pl-8 pr-10"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : null,
                      )
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    kg
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </section>

      {/* ==================== INFORMACIÓN ADICIONAL ==================== */}
      <section>
        <FormField
          control={form.control}
          name="infoAdicionalContenedores"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={t(
                    "forms.straddleCarrier.fields.containers.additionalInfo.placeholder",
                  )}
                  className="min-h-20 text-sm resize-none text-balance"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </section>
    </div>
  );
}

export { Step3Content as Step2Content };
