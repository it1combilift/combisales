"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "@/lib/i18n/context";
import { InspectionFormSchema } from "@/schemas/inspections";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface ObservationsStepProps {
  form: UseFormReturn<InspectionFormSchema>;
}

const MAX_CHARS = 1000;

export function ObservationsStep({ form }: ObservationsStepProps) {
  const { t } = useTranslation();
  const { register, watch } = form;

  const observationsValue = watch("observations") || "";
  const charCount = observationsValue.length;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <MessageSquare className="size-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("inspectionsPage.form.observations.label")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("inspectionsPage.form.observations.hint")}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations" className="sr-only">
          {t("inspectionsPage.form.observations.label")}
        </Label>
        <Textarea
          id="observations"
          rows={8}
          maxLength={MAX_CHARS}
          placeholder={t("inspectionsPage.form.observations.placeholder")}
          {...register("observations")}
          className="resize-none min-h-[180px]"
        />
        <div className="flex justify-end">
          <span
            className={`text-[10px] tabular-nums ${
              charCount > MAX_CHARS * 0.9
                ? "text-amber-600 dark:text-amber-400 font-medium"
                : "text-muted-foreground"
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
}
