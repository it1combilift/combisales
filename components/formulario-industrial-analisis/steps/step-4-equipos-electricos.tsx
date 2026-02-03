"use client";

import { TipoCorriente } from "../types";
import { Zap, Ban } from "lucide-react";
import { StepContentProps } from "../types";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertMessage } from "@/components/alert";
import { TipoAlimentacion } from "@prisma/client";
import { Textarea } from "@/components/ui/textarea";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Step 4: Equipos Eléctricos
 */
export function Step4Content({ form }: StepContentProps) {
  const { t } = useI18n();
  const alimentacion = form.watch("alimentacionDeseada");
  const noAplica = form.watch("equiposElectricos.noAplica") ?? false;

  if (alimentacion !== TipoAlimentacion.ELECTRICO) {
    return (
      <div className="flex items-center justify-center py-4">
        <AlertMessage
          variant="info"
          title={t(
            "forms.industrial.fields.electrical.notApplicable.alert.title",
          )}
          description={t(
            "forms.industrial.fields.electrical.notApplicable.alert.description",
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 min-h-full pb-2">
      {/* Header */}
      <div className="hidden md:flex items-center justify-between gap-2 pb-2 border-b">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="size-3 text-primary" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("forms.industrial.fields.electrical.header")}
          </h3>
        </div>
      </div>

      {/* Toggle "No aplica" */}
      <FormField
        control={form.control}
        name="equiposElectricos.noAplica"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3 sm:p-4 cols-span-2 sm:col-span-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-x-1.5">
                <Ban className="size-3 text-muted-foreground" />
                <FormLabel className="text-sm font-medium cursor-pointer text-balance">
                  {t("forms.industrial.fields.electrical.notApplicable.label")}
                </FormLabel>
              </div>
              <FormDescription className="text-xs text-muted-foreground text-balance max-w-sm border-l-2 border-muted-foreground/30 pl-2">
                {t(
                  "forms.industrial.fields.electrical.notApplicable.description",
                )}
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                className="cursor-pointer"
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Campos de especificaciones (deshabilitados si noAplica) */}
      <div
        className={`grid md:grid-cols-2 grid-cols-1 gap-2 transition-opacity duration-200 ${
          noAplica ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* Tipo de corriente */}
        <FormField
          control={form.control}
          name="equiposElectricos.tipoCorriente"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-sm">
                {t("forms.industrial.fields.electrical.currentType")}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="text-sm w-full text-pretty">
                    <SelectValue placeholder={t("forms.selectOption")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(TipoCorriente).map((tipo) => (
                    <SelectItem
                      key={tipo}
                      value={tipo}
                      className="text-sm text-pretty"
                    >
                      {t(`visits.currentTypes.${tipo}` as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Voltaje */}
        <FormField
          control={form.control}
          name="equiposElectricos.voltaje"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                {t("forms.industrial.fields.electrical.voltage")}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="220"
                    className="text-sm h-8 pr-6 text-pretty"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    V
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Frecuencia */}
        <FormField
          control={form.control}
          name="equiposElectricos.frecuencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                {t("forms.industrial.fields.electrical.frequency")}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="50"
                    className="text-sm h-8 pr-7 text-pretty"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    Hz
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Amperaje */}
        <FormField
          control={form.control}
          name="equiposElectricos.amperaje"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                {t("forms.industrial.fields.electrical.amperage")}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="16"
                    className="text-sm h-8 pr-5 text-pretty"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    A
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Temperatura */}
        <FormField
          control={form.control}
          name="equiposElectricos.temperaturaAmbiente"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                {t("forms.industrial.fields.electrical.ambientTemp")}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="20"
                    className="text-sm h-8 pr-6 text-pretty"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    °C
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Horas trabajo */}
        <FormField
          control={form.control}
          name="equiposElectricos.horasTrabajoPorDia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                {t("forms.industrial.fields.electrical.workHours")}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    placeholder="8"
                    className="text-sm h-8 pr-5 text-pretty"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value ?? ""}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    h
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>

      {/* Notas / Observaciones */}
      <div
        className={`transition-opacity duration-200 ${
          noAplica ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <FormField
          control={form.control}
          name="equiposElectricos.notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                {t("forms.industrial.fields.electrical.notes")}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    "forms.industrial.fields.electrical.notesPlaceholder",
                  )}
                  className="text-sm min-h-[60px] resize-none text-pretty"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// Alias export para compatibilidad con el nuevo flujo de steps
export { Step4Content as Step3Content };
