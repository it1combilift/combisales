import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { FormHeaderProps } from "../types";
import { Progress } from "@/components/ui/progress";
import { DialogTitle } from "@/components/ui/dialog";
import { getStepColorClasses } from "../constants";

/**
 * Form header with title, progress bar, and step navigation
 * Standardized design with connector lines between steps
 */
export function FormHeader({
  currentStep,
  currentStepConfig,
  progress,
  completedSteps,
  onGoToStep,
  formSteps,
  enableCustomerEntry = false,
}: FormHeaderProps) {
  const { t } = useI18n();
  const currentColors = getStepColorClasses(currentStepConfig.color);
  const StepIcon = currentStepConfig.icon;

  // Build dynamic step key map based on enableCustomerEntry
  // When enableCustomerEntry is true: steps 1-3 are customer, steps 4-7 are product
  // When enableCustomerEntry is false: steps 1-4 are product only
  const getStepTranslationKey = (stepNumber: number): string => {
    if (enableCustomerEntry) {
      // DEALER flow: 7 steps (3 customer + 4 product)
      const customerKeys = ["company", "location", "commercial"];
      const productKeys = ["product", "container", "measurements", "files"];
      if (stepNumber <= 3) {
        return customerKeys[stepNumber - 1];
      }
      return productKeys[stepNumber - 4];
    }
    // Normal flow: 4 product steps
    const productKeys = ["product", "container", "measurements", "files"];
    return productKeys[stepNumber - 1] || "product";
  };

  const currentStepKey = getStepTranslationKey(currentStepConfig.number);
  const currentTitle = t(`forms.css.steps.${currentStepKey}.title` as any);
  const currentDescription = t(
    `forms.css.steps.${currentStepKey}.description` as any,
  );

  return (
    <header className="shrink-0 px-2 sm:px-4 py-2 bg-muted/20 border-b">
      {/* Combined row: Title + Progress */}
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        {/* Current step icon */}
        <div
          className={cn(
            "size-7 sm:size-8 rounded-lg flex items-center justify-center shrink-0",
            currentColors.bg,
          )}
        >
          <StepIcon className={cn("size-3.5 sm:size-4", currentColors.text)} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <DialogTitle className="text-xs sm:text-sm font-bold text-foreground truncate">
            {currentTitle}
          </DialogTitle>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
            {currentDescription}
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

      {/* Compact stepper with connector lines */}
      <div className="flex items-center justify-center gap-0.5 mt-2 w-full">
        {formSteps.map((step, idx) => {
          const isCompleted = completedSteps.has(step.number);
          const isCurrent = currentStep === step.number;
          const Icon = step.icon;
          const stepKey = getStepTranslationKey(step.number);

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
                    "text-[9px] mt-1 font-medium max-w-[63px] truncate text-center leading-tight",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-primary/70"
                        : "text-muted-foreground",
                  )}
                >
                  {t(`forms.css.steps.${stepKey}.title` as any)}
                </span>
              </button>
              {/* Connector line */}
              {idx < formSteps.length - 1 && (
                <div
                  className={cn(
                    "w-2 sm:w-3 h-0.5 mx-0.5 self-start mt-3 sm:mt-3.5",
                    completedSteps.has(step.number) &&
                      completedSteps.has(formSteps[idx + 1]?.number)
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
