import { cn } from "@/lib/utils";
import { Check, Ban } from "lucide-react";
import { FORM_STEPS } from "../constants";
import { FormHeaderProps } from "../types";
import { Progress } from "@/components/ui/progress";
import { DialogTitle } from "@/components/ui/dialog";
import { getStepColorClasses } from "@/constants/visits";

interface FormHeaderPropsExtended extends FormHeaderProps {
  shouldSkipStep4?: () => boolean;
}

export function FormHeader({
  currentStep,
  currentStepConfig,
  progress,
  completedSteps,
  onGoToStep,
  shouldSkipStep4,
}: FormHeaderPropsExtended) {
  const currentColors = getStepColorClasses(currentStepConfig.color);
  const StepIcon = currentStepConfig.icon;
  const skipStep4 = shouldSkipStep4?.() ?? false;

  return (
    <header className="shrink-0 px-2 sm:px-4 py-2 bg-muted/20 border-b">
      {/* Combined row: Title + Progress + Stepper */}
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        {/* Current step icon */}
        <div
          className={cn(
            "size-7 rounded-lg flex items-center justify-center shrink-0",
            currentColors.bg
          )}
        >
          <StepIcon className={cn("size-3.5", currentColors.text)} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <DialogTitle className="text-xs font-bold text-foreground truncate">
            {currentStepConfig.title}
          </DialogTitle>
          <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
            {currentStepConfig.description}
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
        {FORM_STEPS.map((step, idx) => {
          const isCompleted = completedSteps.has(step.number);
          const isCurrent = currentStep === step.number;
          const Icon = step.icon;

          // Check if this step should be skipped (Step 4 when not electric)
          const isSkipped = step.number === 4 && skipStep4;

          return (
            <div key={step.number} className="flex items-center">
              <button
                type="button"
                onClick={() => !isSkipped && onGoToStep(step.number)}
                disabled={isSkipped}
                className={cn(
                  "relative flex items-center justify-center transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md p-0.5",
                  isSkipped ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
                title={
                  isSkipped
                    ? "No aplica (alimentación no eléctrica)"
                    : step.title
                }
              >
                <div
                  className={cn(
                    "size-6 sm:size-7 rounded-md flex items-center justify-center transition-all duration-200",
                    isSkipped
                      ? "bg-muted/40 text-muted-foreground/50"
                      : isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isCompleted
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {isSkipped ? (
                    <Ban className="size-3" strokeWidth={2} />
                  ) : isCompleted && !isCurrent ? (
                    <Check className="size-3" strokeWidth={2.5} />
                  ) : (
                    <Icon className="size-3" />
                  )}
                </div>
              </button>
              {/* Connector line */}
              {idx < FORM_STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-2 sm:w-4 h-0.5 mx-0.5",
                    isSkipped || (idx === 3 && skipStep4)
                      ? "bg-muted/40"
                      : completedSteps.has(step.number) &&
                        completedSteps.has(FORM_STEPS[idx + 1]?.number)
                      ? "bg-primary/40"
                      : "bg-border"
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
