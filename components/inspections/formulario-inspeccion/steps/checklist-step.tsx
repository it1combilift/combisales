"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "@/lib/i18n/context";
import { InspectionFormSchema } from "@/schemas/inspections";
import { CHECKLIST_GROUPS } from "@/interfaces/inspection";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";

interface ChecklistStepProps {
  form: UseFormReturn<InspectionFormSchema>;
}

export function ChecklistStep({ form }: ChecklistStepProps) {
  const { t } = useTranslation();
  const { watch, setValue } = form;

  return (
    <div className="space-y-6">
      {CHECKLIST_GROUPS.map((group) => (
        <div key={group.titleKey} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t(group.titleKey)}
          </h3>
          <div className="space-y-2 grid grid-cols-1 gap-2">
            {group.items.map((item) => {
              const value = watch(
                item.key as keyof InspectionFormSchema,
              ) as boolean;

              return (
                <div
                  key={item.key}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                    value
                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                      : "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {value ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    )}
                    <Label
                      htmlFor={item.key}
                      className="text-sm text-balance font-medium cursor-pointer"
                    >
                      {t(item.labelKey)}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        value
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {value
                        ? t("inspectionsPage.form.checklist.good")
                        : t("inspectionsPage.form.checklist.bad")}
                    </span>
                    <Switch
                      id={item.key}
                      checked={value}
                      onCheckedChange={(checked) =>
                        setValue(
                          item.key as keyof InspectionFormSchema,
                          checked as never,
                          { shouldValidate: true },
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
