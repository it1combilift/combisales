"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StepContentProps } from "../types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useI18n } from "@/lib/i18n/context";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  AlertCircle,
  Container,
  Package,
  Info,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  CalendarIcon,
  CalendarDays,
} from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Step 1: Instrucciones (Antes Step 2, renumerado tras eliminar datos del cliente)
 * Shows instructions and allows user to select which sections to complete
 * Includes fechaCierre field
 */
export function Step1Content({ form }: StepContentProps) {
  const { t, locale } = useI18n();
  const isMobile = useIsMobile();
  const [isInstructionsOpen, setIsInstructionsOpen] = React.useState(!isMobile);
  const manejaContenedores = form.watch("manejaContenedores");
  const manejaCargaEspecial = form.watch("manejaCargaEspecial");

  const hasSelection = manejaContenedores || manejaCargaEspecial;

  React.useEffect(() => {
    setIsInstructionsOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="space-y-3">
      {/* ==================== INSTRUCCIONES - Collapsible ==================== */}
      <Collapsible
        open={isInstructionsOpen}
        onOpenChange={setIsInstructionsOpen}
        className="rounded-lg overflow-hidden border"
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center w-full p-2 text-left"
          >
            <div className="shrink-0 size-7  rounded-full flex items-center justify-center">
              <Info className="size-3.5" />
            </div>
            <h3 className="flex-1 text-xs sm:text-sm font-semibold">
              {t("forms.straddleCarrier.fields.instructions.title")}
            </h3>
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isInstructionsOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <div className="px-3 pb-3 sm:pb-4 pt-0">
            <div className="space-y-1 pl-5">
              {[
                {
                  num: "1",
                  text: (
                    <>{t("forms.straddleCarrier.fields.instructions.step1")}</>
                  ),
                },
                {
                  num: "2",
                  text: (
                    <>{t("forms.straddleCarrier.fields.instructions.step2")}</>
                  ),
                },
                {
                  num: "3",
                  text: (
                    <>{t("forms.straddleCarrier.fields.instructions.step3")}</>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="flex items-center gap-2 text-[11px] sm:text-xs"
                >
                  <span className="shrink-0 size-4 rounded-full bg-muted flex items-center justify-center text-[9px] sm:text-[10px]">
                    {item.num}
                  </span>
                  <span className="truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ==================== SELECCIÓN DE TIPO DE CARGA ==================== */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-foreground">
          {t("forms.straddleCarrier.fields.handlesContainers.question")}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Contenedores */}
          <FormField
            control={form.control}
            name="manejaContenedores"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-1.5 transition-all cursor-pointer select-none",
                  field.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={cn(
                    "shrink-0 size-8 rounded-lg flex items-center justify-center transition-colors",
                    field.value
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Container className="size-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <FormLabel className="text-xs font-medium cursor-pointer leading-tight">
                    {t("forms.straddleCarrier.fields.handlesContainers.label")}
                  </FormLabel>
                  <FormDescription className="text-[10px] leading-tight text-pretty">
                    {t(
                      "forms.straddleCarrier.fields.handlesContainers.description"
                    )}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 cursor-pointer"
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
                  "flex items-center gap-3 rounded-lg border p-1.5 transition-all cursor-pointer select-none",
                  field.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onClick={() => field.onChange(!field.value)}
              >
                <div
                  className={cn(
                    "shrink-0 size-8 rounded-lg flex items-center justify-center transition-colors",
                    field.value
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Package className="size-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <FormLabel className="text-xs font-medium cursor-pointer leading-tight">
                    {t("forms.straddleCarrier.fields.handlesSpecialLoad.label")}
                  </FormLabel>
                  <FormDescription className="text-[10px] leading-tight text-pretty">
                    {t(
                      "forms.straddleCarrier.fields.handlesSpecialLoad.description"
                    )}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 cursor-pointer"
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
            <span>
              {t("forms.straddleCarrier.fields.handlesContainers.warning")}
            </span>
          </div>
        )}

        {/* Summary of steps - visual flow */}
        {hasSelection && (
          <div className="rounded-lg bg-muted/40 border border-border/50 p-2.5 sm:p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
              <span className="text-[11px] sm:text-xs font-medium text-foreground">
                {t(
                  "forms.straddleCarrier.fields.handlesContainers.stepsToComplete"
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-balance">
              {manejaContenedores && (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    <Container className="size-2.5 sm:size-3" />
                    {t("forms.straddleCarrier.fields.handlesContainers.label")}
                  </span>
                  <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                </>
              )}
              {manejaCargaEspecial && (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    <Package className="size-2.5 sm:size-3" />
                    {t("forms.straddleCarrier.fields.handlesSpecialLoad.label")}
                  </span>
                  <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                </>
              )}
              <span className="text-muted-foreground">
                {t("forms.straddleCarrier.steps.others.shortTitle")}
              </span>
              <ChevronRight className="size-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {t("forms.straddleCarrier.steps.files.shortTitle")}
              </span>
            </div>
          </div>
        )}
      </div>

      <FormField
        control={form.control}
        name="fechaCierre"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-[11px] font-medium flex items-center gap-1.5">
              {t("forms.straddleCarrier.fields.closingDate.label")}
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-8 text-xs",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="size-3.5" />
                    {field.value
                      ? format(new Date(field.value), "PPP", {
                          locale: locale === "en" ? undefined : es,
                        })
                      : t(
                          "forms.straddleCarrier.fields.closingDate.placeholder"
                        )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date ?? null)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={locale === "en" ? undefined : es}
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

// Alias export para compatibilidad
export { Step1Content as Step2Content };
