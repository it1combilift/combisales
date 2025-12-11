import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { StepContentProps, DimensionCarga } from "../types";
import { Plus, Trash2, Package, Ruler } from "lucide-react";

// ==================== SECTION HEADER ====================
function SectionHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pb-2 border-b mb-3">
      <div className="flex items-center gap-2">
        <div className="size-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="size-3 text-primary" />
        </div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}

// ==================== CARGA ROW ====================
function CargaRow({
  carga,
  index,
  onUpdate,
  onRemove,
}: {
  carga: DimensionCarga;
  index: number;
  onUpdate: (field: keyof DimensionCarga, value: any) => void;
  onRemove: () => void;
}) {
  const fields = [
    { key: "largo", label: "Largo", unit: "m", placeholder: "0.00" },
    { key: "fondo", label: "Fondo", unit: "m", placeholder: "0.00" },
    { key: "alto", label: "Alto", unit: "m", placeholder: "0.00" },
    { key: "peso", label: "Peso", unit: "kg", placeholder: "0" },
    { key: "porcentaje", label: "%", unit: "%", placeholder: "0" },
  ];

  return (
    <div className="border rounded-lg p-3 bg-card hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="size-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <Input
          placeholder="Nombre del producto"
          value={carga.producto}
          onChange={(e) => onUpdate("producto", e.target.value)}
          className="h-9 text-sm flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 hover:bg-destructive/10"
          onClick={onRemove}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {fields.map(({ key, label, unit, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                placeholder={placeholder}
                value={(carga as any)[key] ?? ""}
                onChange={(e) =>
                  onUpdate(
                    key as keyof DimensionCarga,
                    parseFloat(e.target.value) || null
                  )
                }
                className="h-9 text-sm pr-8 font-mono"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Step 5: Dimensiones de las Cargas
 */
export function Step5Content({ form }: StepContentProps) {
  const dimensionesCargas = form.watch("dimensionesCargas") || [];

  const handleAddRow = () => {
    const newRow: DimensionCarga = {
      id: crypto.randomUUID(),
      producto: "",
      largo: null,
      fondo: null,
      alto: null,
      peso: null,
      porcentaje: null,
    };

    form.setValue("dimensionesCargas", [...dimensionesCargas, newRow], {
      shouldValidate: true,
    });
  };

  const handleRemoveRow = (id: string) => {
    const updated = dimensionesCargas.filter(
      (c: DimensionCarga) => c.id !== id
    );
    form.setValue("dimensionesCargas", updated, { shouldValidate: true });
  };

  const handleUpdateRow = (
    id: string,
    field: keyof DimensionCarga,
    value: any
  ) => {
    const updated = dimensionesCargas.map((c: DimensionCarga) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    form.setValue("dimensionesCargas", updated, { shouldValidate: true });
  };

  const totalPorcentaje = dimensionesCargas.reduce(
    (sum: number, c: DimensionCarga) => sum + (c.porcentaje || 0),
    0
  );

  const isValid = Math.abs(totalPorcentaje - 100) < 0.01;

  return (
    <div className="space-y-4">
      {/* Header with add button */}
      <SectionHeader
        icon={Package}
        title="Dimensiones de Cargas"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handleAddRow}
          >
            <Plus className="size-3.5" />
            Agregar
          </Button>
        }
      />

      {/* Empty state */}
      {dimensionesCargas.length === 0 ? (
        <div className="border border-dashed rounded-lg p-6 text-center">
          <Ruler className="size-6 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground text-balance">
            No hay cargas agregadas
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleAddRow}
          >
            <Plus className="size-3.5" />
            Agregar primera carga
          </Button>
        </div>
      ) : (
        <>
          {/* Card-based view */}
          <div className="space-y-3">
            {dimensionesCargas.map((carga: DimensionCarga, index: number) => (
              <CargaRow
                key={carga.id}
                carga={carga}
                index={index}
                onUpdate={(field, value) =>
                  handleUpdateRow(carga.id, field, value)
                }
                onRemove={() => handleRemoveRow(carga.id)}
              />
            ))}
          </div>

          {/* Percentage indicator */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                Total porcentaje:
              </span>
              <span
                className={cn(
                  "font-bold text-base",
                  isValid
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                )}
              >
                {totalPorcentaje.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.min(totalPorcentaje, 100)}
              className={cn(
                "h-2",
                isValid ? "[&>div]:bg-green-500" : "[&>div]:bg-destructive"
              )}
            />
            {!isValid && dimensionesCargas.length > 0 && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <span className="size-1 rounded-full bg-destructive inline-block" />
                Los porcentajes deben sumar exactamente 100%
              </p>
            )}
          </div>
        </>
      )}

      {form.formState.errors.dimensionesCargas && (
        <FormMessage className="text-xs">
          {form.formState.errors.dimensionesCargas.message?.toString()}
        </FormMessage>
      )}
    </div>
  );
}
