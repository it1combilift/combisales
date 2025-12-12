import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { FormHeaderProps } from "../types";
import { Progress } from "@/components/ui/progress";
import { DialogTitle } from "@/components/ui/dialog";
import { FORM_STEPS, getStepColorClasses } from "@/constants/visits";

/**
 * Form header with title, progress bar, and step navigation
 */
export function FormHeader({
  currentStep,
  currentStepConfig,
  progress,
  completedSteps,
  onGoToStep,
}: FormHeaderProps) {
  const currentColors = getStepColorClasses(currentStepConfig.color);
  const StepIcon = currentStepConfig.icon;

  return (
    <header className="shrink-0 px-3 sm:px-4 pt-3 pb-0.5 bg-linear-to-b from-muted/30 to-background border-b border-border/50">
      {/* Title Row */}
      <div className="flex items-center gap-3 sm:gap-4 mb-3 w-full">
        <div
          className={cn(
            "size-8 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300",
            currentColors.bg,
            currentColors.border.replace("border-", "ring-")
          )}
        >
          <StepIcon className={cn("size-4", currentColors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <DialogTitle className="text-sm font-bold text-foreground truncate">
            {currentStepConfig.name}
          </DialogTitle>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {currentStepConfig.description}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2 mb-3 hidden md:block w-full">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-medium text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between gap-0.5 sm:gap-1 w-full mx-auto md:mx-0">
        {FORM_STEPS.map((step) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = currentStep === step.id;
          const isAccessible = true; // Free navigation
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="flex items-center justify-center flex-1"
            >
              <button
                type="button"
                onClick={() => onGoToStep(step.id)}
                disabled={!isAccessible}
                className={cn(
                  "relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer",
                  "group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-1"
                )}
                title={step.name}
              >
                <div
                  className={cn(
                    "size-8 sm:size-9 rounded-lg flex items-center justify-center transition-all duration-300",
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                      : isCompleted
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : isAccessible
                      ? "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                      : "bg-muted/40 text-muted-foreground/40 cursor-not-allowed"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>

                <span
                  className={cn(
                    "hidden lg:block text-[10px] mt-1.5 font-medium transition-colors max-w-[60px] truncate",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-primary/80"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </header>
  );
}
