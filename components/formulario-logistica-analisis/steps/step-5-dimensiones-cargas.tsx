import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { StepContentProps, DimensionCarga } from "../types";
import { Plus, Trash2, Package, Ruler } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useState } from "react";
import {
  CollapsibleImageTrigger,
  CollapsibleImageContent,
} from "@/components/ui/collapsible-image";

// ==================== SECTION HEADER ====================
function SectionHeader({
  icon: Icon,
  title,
  action,
  secondaryAction,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pb-2 border-b mb-3">
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground text-pretty">
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        {secondaryAction}
        {action}
      </div>
    </div>
  );
}

// ==================== CARGA ROW ====================
function CargaRow({
  carga,
  index,
  onUpdate,
  onRemove,
  labels,
}: {
  carga: DimensionCarga;
  index: number;
  onUpdate: (field: keyof DimensionCarga, value: any) => void;
  onRemove: () => void;
  labels: {
    length: string;
    depth: string;
    height: string;
    weight: string;
    percentage: string;
    productPlaceholder: string;
  };
}) {
  const fields = [
    { key: "largo", label: labels.length, unit: "mm", placeholder: "0.00" },
    { key: "fondo", label: labels.depth, unit: "mm", placeholder: "0.00" },
    { key: "alto", label: labels.height, unit: "mm", placeholder: "0.00" },
    { key: "peso", label: labels.weight, unit: "kg", placeholder: "0" },
    {
      key: "porcentaje",
      label: labels.percentage,
      unit: "%",
      placeholder: "0",
    },
  ];

  return (
    <div className="border rounded-lg p-3 bg-card hover:bg-muted/20 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="size-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <Input
          placeholder={labels.productPlaceholder}
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
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
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
                    parseFloat(e.target.value) || null,
                  )
                }
                className="h-9 text-sm pr-8 font-mono"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
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
  const { t } = useI18n();
  const dimensionesCargas = form.watch("dimensionesCargas") || [];

  const labels = {
    length: t("forms.fields.length"),
    depth: t("forms.fields.depth"),
    height: t("forms.fields.height"),
    weight: t("forms.fields.weight"),
    percentage: t("forms.logistica.fields.loads.percentage"),
    productPlaceholder: t("forms.logistica.fields.loads.productPlaceholder"),
  };

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
      (c: DimensionCarga) => c.id !== id,
    );
    form.setValue("dimensionesCargas", updated, { shouldValidate: true });
  };

  const handleUpdateRow = (
    id: string,
    field: keyof DimensionCarga,
    value: any,
  ) => {
    const updated = dimensionesCargas.map((c: DimensionCarga) =>
      c.id === id ? { ...c, [field]: value } : c,
    );
    form.setValue("dimensionesCargas", updated, { shouldValidate: true });
  };

  const totalPorcentaje = dimensionesCargas.reduce(
    (sum: number, c: DimensionCarga) => sum + (c.porcentaje || 0),
    0,
  );

  const isValid = Math.abs(totalPorcentaje - 100) < 0.01;

  // State for collapsible reference image
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <div className="space-y-3 sm:space-y-4 min-h-full pb-2">
      {/* Header with add button and reference image trigger */}
      <SectionHeader
        icon={Package}
        title={t("forms.logistica.fields.loads.header")}
        secondaryAction={
          <CollapsibleImageTrigger
            buttonLabel={t(
              "forms.logistica.fields.loads.referenceImage.button",
            )}
            isOpen={isImageOpen}
            onClick={() => setIsImageOpen(!isImageOpen)}
          />
        }
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-sm"
            onClick={handleAddRow}
          >
            <Plus className="size-3.5" />
            {t("common.add")}
          </Button>
        }
      />

      {/* Reference Image - Collapsible Content */}
      {isImageOpen && (
        <CollapsibleImageContent
          src="/logistic-Dimensions-and-Weights-of-Loads.png"
          alt={t("forms.logistica.fields.loads.referenceImage.alt")}
          maxHeight="medium"
        />
      )}

      {/* Empty state */}
      {dimensionesCargas.length === 0 ? (
        <div className="border border-dashed rounded-lg p-2 md:p-6 text-center space-y-2">
          <Ruler className="size-4 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground text-balance">
            {t("forms.logistica.fields.loads.empty")}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={handleAddRow}
          >
            <Plus className="size-3.5" />
            {t("forms.logistica.fields.loads.addFirst")}
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
                labels={labels}
                onUpdate={(field, value) =>
                  handleUpdateRow(carga.id, field, value)
                }
                onRemove={() => handleRemoveRow(carga.id)}
              />
            ))}
          </div>

          {/* Percentage indicator */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-sm">
                {t("forms.logistica.fields.loads.totalPercentage")}
              </span>
              <span
                className={cn(
                  "font-bold text-sm",
                  isValid
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive",
                )}
              >
                {totalPorcentaje.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.min(totalPorcentaje, 100)}
              className={cn(
                "h-2",
                isValid ? "[&>div]:bg-green-500" : "[&>div]:bg-destructive",
              )}
            />
            {!isValid && dimensionesCargas.length > 0 && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <span className="size-1 rounded-full bg-destructive inline-block" />
                {t("forms.logistica.fields.loads.percentageError")}
              </p>
            )}
          </div>
        </>
      )}

      {form.formState.errors.dimensionesCargas && (
        <FormMessage className="text-sm">
          {form.formState.errors.dimensionesCargas.message?.toString()}
        </FormMessage>
      )}
    </div>
  );
}

// Alias export para compatibilidad con el nuevo flujo de steps
export { Step5Content as Step4Content };
