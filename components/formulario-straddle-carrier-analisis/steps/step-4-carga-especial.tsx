"use client";

import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import {
  Package,
  Ruler,
  ArrowUpDown,
  Weight,
  MoveHorizontal,
} from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { AlertMessage } from "@/components/alert";

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
  step?: string;
}

function DimensionInput({
  control,
  name,
  label,
  icon: Icon,
  unit = "m",
  placeholder = "0.00",
  step = "0.01",
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
                step={step}
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
 * Step 4: Cuadro 2 - Carga Especial (Dimensiones)
 */
export function Step4Content({ form }: StepContentProps) {
  const manejaCargaEspecial = form.watch("manejaCargaEspecial");

  if (!manejaCargaEspecial) {
    return (
      <div className="flex items-center justify-center py-6">
        <AlertMessage
          variant="info"
          title="Paso no aplicable"
          description="Este paso solo es necesario cuando el cliente maneja carga especial. Puedes continuar al siguiente paso."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ==================== LONGITUD DE PRODUCTOS ==================== */}
      <section>
        <SectionHeader icon={Ruler} title="Longitud de Productos" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="productoMasLargo"
            label="Más largo"
            icon={Ruler}
          />
          <DimensionInput
            control={form.control}
            name="productoMasCorto"
            label="Más corto"
            icon={Ruler}
          />
        </div>
      </section>

      {/* ==================== ANCHO DE PRODUCTOS ==================== */}
      <section>
        <SectionHeader icon={MoveHorizontal} title="Ancho de Productos" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="productoMasAncho"
            label="Más ancho"
            icon={MoveHorizontal}
          />
          <DimensionInput
            control={form.control}
            name="productoMasEstrecho"
            label="Más estrecho"
            icon={MoveHorizontal}
          />
        </div>
      </section>

      {/* ==================== ALTURA + PUNTOS DE ELEVACIÓN ==================== */}
      <section>
        <SectionHeader
          icon={ArrowUpDown}
          title="Altura y Puntos de Elevación"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="productoMasAlto"
            label="Producto más alto"
            icon={ArrowUpDown}
          />
          <DimensionInput
            control={form.control}
            name="puntosElevacionLongitud"
            label="Elev. longitud"
            icon={Ruler}
          />
          <DimensionInput
            control={form.control}
            name="puntosElevacionAncho"
            label="Elev. ancho"
            icon={MoveHorizontal}
          />
        </div>
      </section>

      {/* ==================== PESOS MÁXIMOS ==================== */}
      <section>
        <SectionHeader icon={Weight} title="Pesos Máximos" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="pesoMaximoProductoLargo"
            label="Peso máx. prod. largo"
            icon={Weight}
            unit="kg"
            placeholder="0"
            step="0.1"
          />
          <DimensionInput
            control={form.control}
            name="pesoMaximoProductoCorto"
            label="Peso máx. prod. corto"
            icon={Weight}
            unit="kg"
            placeholder="0"
            step="0.1"
          />
        </div>
      </section>
    </div>
  );
}
