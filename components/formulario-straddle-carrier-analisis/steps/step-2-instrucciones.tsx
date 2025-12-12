"use client";

import { cn } from "@/lib/utils";
import { StepContentProps } from "../types";
import { Switch } from "@/components/ui/switch";

import {
  AlertCircle,
  Container,
  Package,
  Info,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";

/**
 * Step 2: Instrucciones
 * Shows instructions and allows user to select which sections to complete
 */
export function Step2Content({ form }: StepContentProps) {
  const manejaContenedores = form.watch("manejaContenedores");
  const manejaCargaEspecial = form.watch("manejaCargaEspecial");

  const hasSelection = manejaContenedores || manejaCargaEspecial;

  return (
    <div className="space-y-4">
      {/* ==================== INSTRUCCIONES - Compact ==================== */}
      <div className="rounded-lg border border-blue-200/80 bg-linear-to-br from-blue-50/80 to-blue-50/40 dark:border-blue-900/60 dark:from-blue-950/40 dark:to-blue-950/20 p-3 sm:p-4">
        <div className="flex gap-3">
          <div className="shrink-0 size-7 sm:size-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Info className="size-3.5 sm:size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1.5">
              Instrucciones
            </h3>
            <div className="space-y-1">
              {[
                {
                  num: "1",
                  text: (
                    <>
                      Complete <strong>Cuadro 1</strong> si maneja contenedores
                    </>
                  ),
                },
                {
                  num: "2",
                  text: (
                    <>
                      Complete <strong>Cuadro 2</strong> si es carga especial
                    </>
                  ),
                },
                {
                  num: "3",
                  text: (
                    <>
                      Complete <strong>ambos</strong> si trabaja ambos tipos
                    </>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="flex items-center gap-2 text-[11px] sm:text-xs text-blue-800 dark:text-blue-200"
                >
                  <span className="shrink-0 size-4 rounded-full bg-blue-200/80 dark:bg-blue-800/80 flex items-center justify-center text-[9px] sm:text-[10px] font-bold">
                    {item.num}
                  </span>
                  <span className="truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SELECCIÓN DE TIPO DE CARGA ==================== */}
      <div className="space-y-3">
        <h4 className="text-xs sm:text-sm font-semibold text-foreground">
          ¿Qué tipo de carga maneja el cliente?
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {/* Contenedores */}
          <FormField
            control={form.control}
            name="manejaContenedores"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 sm:p-4 transition-all cursor-pointer select-none",
                  field.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={cn(
                    "shrink-0 size-9 sm:size-10 rounded-lg flex items-center justify-center transition-colors",
                    field.value
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Container className="size-4 sm:size-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <FormLabel className="text-xs sm:text-sm font-medium cursor-pointer leading-tight">
                    Contenedores
                  </FormLabel>
                  <FormDescription className="text-[10px] sm:text-xs leading-tight">
                    Cuadro 1: Contenedores estándar
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

          {/* Carga especial */}
          <FormField
            control={form.control}
            name="manejaCargaEspecial"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 sm:p-4 transition-all cursor-pointer select-none",
                  field.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={cn(
                    "shrink-0 size-9 sm:size-10 rounded-lg flex items-center justify-center transition-colors",
                    field.value
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Package className="size-4 sm:size-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <FormLabel className="text-xs sm:text-sm font-medium cursor-pointer leading-tight">
                    Carga especial
                  </FormLabel>
                  <FormDescription className="text-[10px] sm:text-xs leading-tight">
                    Cuadro 2: Dimensiones específicas
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
        </div>

        {/* Warning if none selected */}
        {!hasSelection && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>Seleccione al menos una opción para continuar.</span>
          </div>
        )}

        {/* Summary of steps - visual flow */}
        {hasSelection && (
          <div className="rounded-lg bg-muted/40 border border-border/50 p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
              <span className="text-[11px] sm:text-xs font-medium text-foreground">
                Pasos a completar:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
              {manejaContenedores && (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    <Container className="size-2.5 sm:size-3" />
                    Contenedores
                  </span>
                  <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                </>
              )}
              {manejaCargaEspecial && (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    <Package className="size-2.5 sm:size-3" />
                    Carga especial
                  </span>
                  <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                </>
              )}
              <span className="text-muted-foreground">Otros</span>
              <ChevronRight className="size-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Archivos</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
