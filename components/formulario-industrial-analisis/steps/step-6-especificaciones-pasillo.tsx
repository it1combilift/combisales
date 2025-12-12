import { cn } from "@/lib/utils";
import { Ruler } from "lucide-react";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { TipoAlimentacion } from "@prisma/client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

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
      <FormLabel className="text-[11px] font-medium flex items-center gap-1.5">
        <span
          className={cn(
            "shrink-0 size-4 rounded-full flex items-center justify-center text-[9px] font-bold",
            isConditional
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {number}
        </span>
        <span className="truncate">{label}</span>
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            type="number"
            placeholder="0"
            className="h-8 text-sm pr-9"
            {...field}
            onChange={(e) => field.onChange(parseFloat(e.target.value))}
            value={field.value ?? ""}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            mm
          </span>
        </div>
      </FormControl>
      <FormMessage className="text-[10px]" />
    </FormItem>
  );
}

/**
 * Step 6: Especificaciones del Pasillo - Ultra Compact
 */
export function Step6Content({ form }: StepContentProps) {
  const alimentacion = form.watch("alimentacionDeseada");
  const isGuided = alimentacion === TipoAlimentacion.ELECTRICO;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="hidden md:flex items-center gap-2 pb-2 border-b">
        <div className="size-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <Ruler className="size-3 text-primary" />
        </div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Especificaciones del Pasillo
        </h3>
        {isGuided && (
          <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
            + Rieles guía
          </span>
        )}
      </div>

      {/* All fields in compact grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Dimensiones del producto */}
        <FormField
          control={form.control}
          name="especificacionesPasillo.profundidadProducto"
          render={({ field }) => (
            <NumberedInput
              number={1}
              label="Profundidad producto"
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
              label="Ancho entre productos"
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
              label="Dist. entre estanterías"
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
              label="Fondo útil estantería"
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
              label="Altura base estantería"
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
                label="Dist. bajo rieles guía"
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
              label="Altura suelo→1er brazo"
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
                  label="Dist. entre rieles guía"
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
                  label="Altura libre→guía"
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
              label="Grosor pilar/columna"
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
              label="Altura último nivel"
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
              label="Altura máx. interior"
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
