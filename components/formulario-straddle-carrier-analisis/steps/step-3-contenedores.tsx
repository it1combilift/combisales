"use client";

import { cn } from "@/lib/utils";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { CONTAINER_SIZES } from "../constants";
import { AlertMessage } from "@/components/alert";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Container, Layers, Weight, FileText, Box } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

// ==================== SECTION HEADER ====================
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="hidden md:flex items-center gap-1.5 pb-1.5 border-b border-border/40 mb-3">
      <div className="size-5 rounded bg-primary/10 flex items-center justify-center">
        <Icon className="size-3 text-primary" />
      </div>
      <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

// ==================== CONTAINER SIZE CARD ====================
interface ContainerSizeCardProps {
  form: UseFormReturn<any>;
  sizeKey: string;
  label: string;
}

function ContainerSizeCard({ form, sizeKey, label }: ContainerSizeCardProps) {
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
                : "hover:border-primary/40"
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
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <FormLabel className="text-xs sm:text-sm font-semibold cursor-pointer">
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
                  <FormLabel className="text-[10px] text-muted-foreground">
                    Cant/semana
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      disabled={!isSelected}
                      className={cn(
                        "text-center text-xs h-8",
                        !isSelected && "opacity-50"
                      )}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : null
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
  const manejaContenedores = form.watch("manejaContenedores");

  if (!manejaContenedores) {
    return (
      <div className="flex items-center justify-center py-6">
        <AlertMessage
          variant="info"
          title="Paso no aplicable"
          description="Este paso solo es necesario cuando el cliente maneja contenedores. Puedes continuar al siguiente paso."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ==================== OPCIONES GENERALES ==================== */}
      <section>
        <SectionHeader icon={Container} title="Opciones Generales" />
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
                    : "hover:bg-muted/30"
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
                  <FormLabel className="text-xs sm:text-sm font-medium cursor-pointer leading-tight">
                    Manejo individual
                  </FormLabel>
                  <FormDescription className="text-[10px] sm:text-xs leading-tight text-pretty">
                    Contenedores de forma individual
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
                    : "hover:bg-muted/30"
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
                  <FormLabel className="text-xs sm:text-sm font-medium cursor-pointer leading-tight">
                    Doble apilamiento
                  </FormLabel>
                  <FormDescription className="text-[10px] sm:text-xs leading-tight text-pretty">
                    Apilar dos contenedores
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* ==================== TAMAÑOS DE CONTENEDORES - Card Grid ==================== */}
      <section>
        <SectionHeader icon={Layers} title="Tamaños y Cantidades" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CONTAINER_SIZES.map((size) => (
            <ContainerSizeCard
              key={size.key}
              form={form}
              sizeKey={size.key}
              label={size.label}
            />
          ))}
        </div>
      </section>

      {/* ==================== PESO MÁXIMO ==================== */}
      <section>
        <SectionHeader icon={Weight} title="Peso Máximo" />
        <FormField
          control={form.control}
          name="pesoMaximoContenedor"
          render={({ field }) => (
            <FormItem className="max-w-xs">
              <FormLabel className="text-[11px] font-medium">
                Peso máximo a manipular
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
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    kg
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </section>

      {/* ==================== INFORMACIÓN ADICIONAL ==================== */}
      <section>
        <SectionHeader icon={FileText} title="Información Adicional" />
        <FormField
          control={form.control}
          name="infoAdicionalContenedores"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Añada cualquier información adicional sobre los contenedores..."
                  className="min-h-20 text-sm resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </section>
    </div>
  );
}
