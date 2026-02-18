import { cn } from "@/lib/utils";
import { INSPECTION_STEPS, getStepColorClasses } from "../constants";
import { useTranslation } from "@/lib/i18n/context";
import { Progress } from "@/components/ui/progress";
import { DialogTitle } from "@/components/ui/dialog";

interface InspectionFormHeaderProps {
  currentStep: number;
  progress: number;
  completedSteps: Set<number>;
  onGoToStep: (step: number) => void;
}

export function InspectionFormHeader({
  currentStep,
  progress,
  completedSteps,
  onGoToStep,
}: InspectionFormHeaderProps) {
  const { t } = useTranslation();

  const currentStepConfig = INSPECTION_STEPS.find(
    (s) => s.number === currentStep,
  )!;
  const currentColors = getStepColorClasses(currentStepConfig.color);
  const StepIcon = currentStepConfig.icon;

  return (
    <header className="shrink-0 px-2 sm:px-4 py-2 bg-muted/20 border-b">
      {/* Combined row: Icon + Title + Progress */}
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

        {/* Title & description */}
        <div className="flex-1 min-w-0">
          <DialogTitle className="text-sm font-bold text-foreground truncate">
            {t(currentStepConfig.title)}
          </DialogTitle>
          <p className="text-xs text-muted-foreground truncate">
            {t(currentStepConfig.description)}
          </p>
        </div>

        {/* Compact progress badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md mr-6">
          <Progress
            value={progress}
            className="h-1.5 w-10 md:w-16 [&>div]:bg-[#60A82E]"
          />
          <span className="text-xs font-medium text-[#60A82E]">
            {progress}%
          </span>
        </div>
      </div>

      {/* Stepper with clickable steps */}
      <div className="flex items-center justify-center gap-y-2 gap-x-1 mt-2 w-full p-0">
        {INSPECTION_STEPS.map((step, idx) => {
          const isCurrent = currentStep === step.number;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex items-center px-0.5">
              <button
                type="button"
                onClick={() => onGoToStep(step.number)}
                className={cn(
                  "relative flex flex-col items-center justify-start transition-all duration-200 cursor-pointer group w-fit",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60A82E] rounded-md p-0.5",
                )}
                title={t(step.title)}
              >
                <div
                  className={cn(
                    "relative size-7 sm:size-8 rounded-lg flex items-center justify-center transition-all duration-200 border shadow-sm",
                    isCurrent
                      ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border",
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] mt-1 font-medium w-full text-center leading-none transition-colors line-clamp-1",
                    isCurrent
                      ? "text-primary font-semibold"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {t(step.shortTitle)}
                </span>
              </button>

              {/* Connector line */}
              {idx < INSPECTION_STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block sm:w-3 h-px mx-0.5 self-start mt-4 transition-colors duration-300",
                    completedSteps.has(step.number) &&
                      completedSteps.has(INSPECTION_STEPS[idx + 1]?.number)
                      ? "bg-[#60A82E]"
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

// Keep old name as alias for backward compatibility
export { InspectionFormHeader as FormHeader };
