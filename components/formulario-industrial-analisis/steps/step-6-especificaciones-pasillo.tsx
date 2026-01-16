import { cn } from "@/lib/utils";
import { Ruler } from "lucide-react";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { TipoAlimentacion } from "@prisma/client";
import { useState } from "react";
import {
  CollapsibleImageTrigger,
  CollapsibleImageContent,
} from "@/components/ui/collapsible-image";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useI18n } from "@/lib/i18n/context";

// ==================== COMPACT NUMBERED INPUT ====================
function NumberedInput({
  number,
  label,
  field,
  isConditional = false,
}: {
  number: number;
  label: string;
  field: any;
  isConditional?: boolean;
}) {
  return (
    <FormItem>
      <FormLabel className="font-medium flex items-center gap-1.5 text-balance">
        <span
          className={cn(
            "shrink-0 size-4 rounded-full flex items-center justify-center text-[9px] md:text-xs font-bold",
            isConditional
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {number}
        </span>
        <span className="truncate text-balance text-[9px] md:text-xs">
          {label}
        </span>
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            type="number"
            placeholder="0"
            className="h-8 text-xs pr-9 font-mono text-balance"
            {...field}
            onChange={(e) => field.onChange(parseFloat(e.target.value))}
            value={field.value ?? ""}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            mm
          </span>
        </div>
      </FormControl>
      <FormMessage className="text-xs" />
    </FormItem>
  );
}

/**
 * Step 6: Especificaciones del Pasillo - Ultra Compact
 */
export function Step6Content({ form }: StepContentProps) {
  const { t } = useI18n();
  const alimentacion = form.watch("alimentacionDeseada");
  const isGuided = alimentacion === TipoAlimentacion.ELECTRICO;

  // State for collapsible reference image
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header with reference image trigger */}
      <div className="hidden md:flex items-center gap-2 pb-2 border-b">
        <div className="size-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <Ruler className="size-3 text-primary" />
        </div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t("forms.industrial.fields.aisle.header")}
        </h3>
        <div className="ml-auto flex items-center gap-2">
          {isGuided && (
            <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
              {t("forms.industrial.fields.aisle.guideRailsLabel")}
            </span>
          )}

          <CollapsibleImageTrigger
            buttonLabel={t(
              "forms.industrial.fields.aisle.referenceImage.button"
            )}
            isOpen={isImageOpen}
            onClick={() => setIsImageOpen(!isImageOpen)}
          />
        </div>
      </div>

      {/* Mobile header with reference image trigger */}
      <div className="md:hidden flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
            <Ruler className="size-3 text-primary" />
          </div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("forms.industrial.fields.aisle.header")}
          </h3>
        </div>
        <CollapsibleImageTrigger
          buttonLabel={t("forms.industrial.fields.aisle.referenceImage.button")}
          isOpen={isImageOpen}
          onClick={() => setIsImageOpen(!isImageOpen)}
        />
      </div>

      {/* Reference Image - Collapsible Content */}
      {isImageOpen && (
        <CollapsibleImageContent
          src="/industrial-aisle-spec.png"
          alt={t("forms.industrial.fields.aisle.referenceImage.alt")}
          maxHeight="medium"
        />
      )}

      {/* All fields in compact grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-3 place-items-center">
        {/* Dimensiones del producto */}
        <FormField
          control={form.control}
          name="especificacionesPasillo.profundidadProducto"
          render={({ field }) => (
            <NumberedInput
              number={1}
              label={t("forms.industrial.fields.aisle.productDepth")}
              field={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="especificacionesPasillo.anchoLibreEntreProductos"
          render={({ field }) => (
            <NumberedInput
              number={2}
              label={t("forms.industrial.fields.aisle.widthBetweenProducts")}
              field={field}
            />
          )}
        />

        {/* Estanterías */}
        <FormField
          control={form.control}
          name="especificacionesPasillo.distanciaLibreEntreEstanterias"
          render={({ field }) => (
            <NumberedInput
              number={3}
              label={t("forms.industrial.fields.aisle.distBetweenRacks")}
              field={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="especificacionesPasillo.fondoUtilEstanteria"
          render={({ field }) => (
            <NumberedInput
              number={4}
              label={t("forms.industrial.fields.aisle.rackUsefulDepth")}
              field={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="especificacionesPasillo.alturaBaseEstanteria"
          render={({ field }) => (
            <NumberedInput
              number={5}
              label={t("forms.industrial.fields.aisle.rackBaseHeight")}
              field={field}
            />
          )}
        />

        {/* Rieles guía (solo eléctrico) */}
        {isGuided && (
          <FormField
            control={form.control}
            name="especificacionesPasillo.distanciaBajoRielesGuia"
            render={({ field }) => (
              <NumberedInput
                number={6}
                label={t("forms.industrial.fields.aisle.distUnderGuideRails")}
                field={field}
                isConditional
              />
            )}
          />
        )}

        <FormField
          control={form.control}
          name="especificacionesPasillo.alturaSueloPrimerBrazo"
          render={({ field }) => (
            <NumberedInput
              number={7}
              label={t("forms.industrial.fields.aisle.heightFloorFirstArm")}
              field={field}
            />
          )}
        />

        {isGuided && (
          <>
            <FormField
              control={form.control}
              name="especificacionesPasillo.distanciaEntreRielesGuia"
              render={({ field }) => (
                <NumberedInput
                  number={8}
                  label={t(
                    "forms.industrial.fields.aisle.distBetweenGuideRails"
                  )}
                  field={field}
                  isConditional
                />
              )}
            />
            <FormField
              control={form.control}
              name="especificacionesPasillo.alturaLibreHastaGuia"
              render={({ field }) => (
                <NumberedInput
                  number={9}
                  label={t("forms.industrial.fields.aisle.clearHeightToGuide")}
                  field={field}
                  isConditional
                />
              )}
            />
          </>
        )}

        {/* Estructura edificio */}
        <FormField
          control={form.control}
          name="especificacionesPasillo.grosorPilarColumna"
          render={({ field }) => (
            <NumberedInput
              number={10}
              label={t("forms.industrial.fields.aisle.columnThickness")}
              field={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="especificacionesPasillo.alturaUltimoNivel"
          render={({ field }) => (
            <NumberedInput
              number={11}
              label={t("forms.industrial.fields.aisle.lastLevelHeight")}
              field={field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="especificacionesPasillo.alturaMaximaInteriorEdificio"
          render={({ field }) => (
            <NumberedInput
              number={12}
              label={t("forms.industrial.fields.aisle.maxInteriorHeight")}
              field={field}
            />
          )}
        />
      </div>
    </div>
  );
}

// Alias export para compatibilidad con el nuevo flujo de steps
export { Step6Content as Step5Content };
