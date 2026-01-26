import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { FORM_STEPS } from "../constants";
import { FormHeaderProps } from "../types";
import { Progress } from "@/components/ui/progress";
import { DialogTitle } from "@/components/ui/dialog";
import { getStepColorClasses } from "@/constants/visits";
import { useI18n } from "@/lib/i18n/context";

interface FormHeaderPropsExtended extends FormHeaderProps {
  shouldSkipStep3?: () => boolean;
}

export function FormHeader({
  currentStep,
  currentStepConfig,
  progress,
  completedSteps,
  onGoToStep,
  shouldSkipStep3,
  formSteps,
}: FormHeaderPropsExtended) {
  const { t } = useI18n();
  const currentColors = getStepColorClasses(currentStepConfig.color);
  const StepIcon = currentStepConfig.icon;
  const skipStep3 = shouldSkipStep3?.() ?? false;

  // Use dynamic formSteps if provided, otherwise fall back to FORM_STEPS
  const stepsToUse = formSteps || FORM_STEPS;

  const visibleSteps = skipStep3
    ? stepsToUse.filter((step) => step.number !== 3)
    : stepsToUse;

  return (
    <header className="shrink-0 px-2 sm:px-4 py-2 bg-muted/20 border-b">
      {/* Combined row: Title + Progress + Stepper */}
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        {/* Current step icon */}
        <div
          className={cn(
            "size-7 rounded-lg flex items-center justify-center shrink-0",
            currentColors.bg,
          )}
        >
          <StepIcon className={cn("size-3.5", currentColors.text)} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <DialogTitle className="text-xs font-bold text-foreground truncate">
            {t(currentStepConfig.title as any)}
          </DialogTitle>
          <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
            {t(currentStepConfig.description as any)}
          </p>
        </div>

        {/* Compact progress badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md mr-6">
          <Progress value={progress} className="h-1 w-16" />
          <span className="text-[10px] font-medium text-primary">
            {progress}%
          </span>
        </div>
      </div>

      {/* Compact stepper */}
      <div className="flex items-center justify-center gap-0.5 mt-2 w-full">
        {visibleSteps.map((step, idx) => {
          const isCompleted = completedSteps.has(step.number);
          const isCurrent = currentStep === step.number;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex items-center">
              <button
                type="button"
                onClick={() => onGoToStep(step.number)}
                className={cn(
                  "relative flex flex-col items-center justify-center transition-all duration-200 cursor-pointer",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md p-0.5",
                )}
                title={t(step.title as any)}
              >
                <div
                  className={cn(
                    "size-6 sm:size-7 rounded-md flex items-center justify-center transition-all duration-200",
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isCompleted
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="size-3" strokeWidth={2.5} />
                  ) : (
                    <Icon className="size-3" />
                  )}
                </div>
                <span
                  className={cn(
                    "block text-[9px] mt-1 font-medium max-w-[60px] truncate text-center leading-tight",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-primary/70"
                        : "text-muted-foreground",
                  )}
                >
                  {t(step.shortTitle as any)}
                </span>
              </button>
              {/* Connector line */}
              {idx < visibleSteps.length - 1 && (
                <div
                  className={cn(
                    "w-2 sm:w-3 h-0.5 mx-0.5 self-start mt-3 sm:mt-3.5",
                    completedSteps.has(step.number) &&
                      completedSteps.has(visibleSteps[idx + 1]?.number)
                      ? "bg-primary/40"
                      : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </header>
  );
}
