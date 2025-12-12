"use client";

import { cn } from "@/lib/utils";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  ArrowUpDown,
  MoveHorizontal,
  Route,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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

// ==================== DIMENSION INPUT ====================
interface DimensionInputProps {
  control: any;
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  unit?: string;
  placeholder?: string;
}

function DimensionInput({
  control,
  name,
  label,
  icon: Icon,
  unit = "m",
  placeholder = "0.00",
}: DimensionInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Icon className="absolute left-2 top-1/2 -translate-y-1/2 size-3 sm:size-3.5 text-muted-foreground" />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={placeholder}
                className="text-xs sm:text-sm h-8 sm:h-9 pl-7 sm:pl-8 pr-7 sm:pr-8"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
              />
              <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground">
                {unit}
              </span>
            </div>
          </FormControl>
          <FormMessage className="text-[10px]" />
        </FormItem>
      )}
    />
  );
}

/**
 * Step 5: Otros
 * Additional conditions and restrictions
 */
export function Step5Content({ form }: StepContentProps) {
  const pisoPlano = form.watch("pisoPlano");

  return (
    <div className="space-y-4">
      {/* ==================== ZONAS DE PASO ==================== */}
      <section>
        <SectionHeader icon={Route} title="Zonas de Paso" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="zonasPasoAncho"
            label="Ancho"
            icon={MoveHorizontal}
          />
          <DimensionInput
            control={form.control}
            name="zonasPasoAlto"
            label="Alto"
            icon={ArrowUpDown}
          />
        </div>
      </section>

      {/* ==================== CONDICIONES DEL PISO ==================== */}
      <section>
        <SectionHeader icon={Route} title="Condiciones del Piso" />
        <div className="space-y-3">
          {/* Piso plano toggle - Visual card */}
          <FormField
            control={form.control}
            name="pisoPlano"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-1.5 cursor-pointer transition-all select-none",
                  field.value
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    : "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                )}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={cn(
                    "shrink-0 size-8 rounded-lg flex items-center justify-center",
                    field.value
                      ? "bg-green-100 dark:bg-green-900/50"
                      : "bg-amber-100 dark:bg-amber-900/50"
                  )}
                >
                  {field.value ? (
                    <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="size-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <FormLabel className="text-xs font-medium cursor-pointer">
                    ¿El piso es plano?
                  </FormLabel>
                  <FormDescription className="text-[12px]">
                    {field.value
                      ? "Piso plano y uniforme"
                      : "Piso con irregularidades"}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Descripción condiciones piso - Compact */}
          <FormField
            control={form.control}
            name="condicionesPiso"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                  Descripción del piso
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      pisoPlano
                        ? "Añada detalles adicionales si es necesario..."
                        : "Describa las irregularidades, desniveles, tipo de superficie..."
                    }
                    className="min-h-16 sm:min-h-20 text-xs sm:text-sm resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* ==================== RESTRICCIONES ==================== */}
      <section>
        <SectionHeader icon={AlertTriangle} title="Restricciones" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="restriccionesAltura"
            label="Restricción altura"
            icon={ArrowUpDown}
          />
          <DimensionInput
            control={form.control}
            name="restriccionesAnchura"
            label="Restricción anchura"
            icon={MoveHorizontal}
          />
        </div>
      </section>

      {/* ==================== NOTAS ADICIONALES ==================== */}
      <section>
        <SectionHeader icon={FileText} title="Notas Adicionales" />
        <FormField
          control={form.control}
          name="notasAdicionales"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Añada cualquier otra información relevante..."
                  className="min-h-20 sm:min-h-24 text-xs sm:text-sm resize-none"
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

// Alias export para compatibilidad con el nuevo flujo de steps
export { Step5Content as Step4Content };
