"use client";

import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";
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
      <h3 className="text-balance text-[11px] font-semibold text-foreground uppercase tracking-wide">
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
          <FormLabel className="text-[10px] sm:text-[11px] md:text-sm font-medium text-muted-foreground">
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
                className="text-[10px] sm:text-xs md:text-sm h-8 sm:h-9 pl-7 sm:pl-8 pr-7 sm:pr-8"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
              />
              <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                {unit}
              </span>
            </div>
          </FormControl>
          <FormMessage className="text-[10px] sm:text-xs md:text-sm" />
        </FormItem>
      )}
    />
  );
}

/**
 * Step 4: Cuadro 2 - Carga Especial (Dimensiones)
 */
export function Step4Content({ form }: StepContentProps) {
  const { t } = useI18n();
  const manejaCargaEspecial = form.watch("manejaCargaEspecial");

  if (!manejaCargaEspecial) {
    return (
      <div className="flex items-center justify-center py-6">
        <AlertMessage
          variant="info"
          title={t("forms.straddleCarrier.fields.notApplicable.title")}
          description={t(
            "forms.straddleCarrier.fields.notApplicable.specialLoadDescription"
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* ==================== LONGITUD DE PRODUCTOS ==================== */}
      <section>
        <SectionHeader
          icon={Ruler}
          title={t(
            "forms.straddleCarrier.fields.specialLoad.productLength.title"
          )}
        />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="productoMasLargo"
            label={t(
              "forms.straddleCarrier.fields.specialLoad.productLength.longest"
            )}
            icon={Ruler}
          />
          <DimensionInput
            control={form.control}
            name="productoMasCorto"
            label={t(
              "forms.straddleCarrier.fields.specialLoad.productLength.shortest"
            )}
            icon={Ruler}
          />
        </div>
      </section>

      {/* ==================== ANCHO DE PRODUCTOS ==================== */}
      <section>
        <SectionHeader
          icon={MoveHorizontal}
          title={t(
            "forms.straddleCarrier.fields.specialLoad.productWidth.title"
          )}
        />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="productoMasAncho"
            label={t(
              "forms.straddleCarrier.fields.specialLoad.productWidth.widest"
            )}
            icon={MoveHorizontal}
          />
          <DimensionInput
            control={form.control}
            name="productoMasEstrecho"
            label={t(
              "forms.straddleCarrier.fields.specialLoad.productWidth.narrowest"
            )}
            icon={MoveHorizontal}
          />
        </div>
      </section>

      {/* ==================== ALTURA + PUNTOS DE ELEVACIÓN ==================== */}
      <section>
        <SectionHeader
          icon={ArrowUpDown}
          title={t(
            "forms.straddleCarrier.fields.specialLoad.heightAndLifting.title"
          )}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="productoMasAlto"
            label={t(
              "forms.straddleCarrier.fields.specialLoad.heightAndLifting.tallestProduct"
            )}
            icon={ArrowUpDown}
          />
          <DimensionInput
            control={form.control}
            name="puntosElevacionLongitud"
            label={t(
              "forms.straddleCarrier.fields.specialLoad.heightAndLifting.liftingLength"
            )}
            icon={Ruler}
          />
          <DimensionInput
            control={form.control}
            name="puntosElevacionAncho"
            label={t(
              "forms.straddleCarrier.fields.specialLoad.heightAndLifting.liftingWidth"
            )}
            icon={MoveHorizontal}
          />
        </div>
      </section>

      {/* ==================== PESOS MÁXIMOS ==================== */}
      <section>
        <SectionHeader
          icon={Weight}
          title={t("forms.straddleCarrier.fields.specialLoad.maxWeights.title")}
        />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DimensionInput
            control={form.control}
            name="pesoMaximoProductoLargo"
            label={t(
              "forms.straddleCarrier.fields.specialLoad.maxWeights.longProduct"
            )}
            icon={Weight}
            unit="kg"
            placeholder="0"
            step="0.1"
          />
          <DimensionInput
            control={form.control}
            name="pesoMaximoProductoCorto"
            label={t(
              "forms.straddleCarrier.fields.specialLoad.maxWeights.shortProduct"
            )}
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

// Alias export para compatibilidad con el nuevo flujo de steps
export { Step4Content as Step3Content };
