import { cn } from "@/lib/utils";
import { FORM_STEPS } from "../constants";
import { FormHeaderProps } from "../types";
import { Progress } from "@/components/ui/progress";
import { DialogTitle } from "@/components/ui/dialog";
import { getStepColorClasses } from "@/constants/visits";
import { useI18n } from "@/lib/i18n/context";

interface FormHeaderPropsExtended extends FormHeaderProps {
  shouldSkipStep3?: () => boolean;
  formSteps?: Array<{
    number: number;
    title: string;
    shortTitle: string;
    description: string;
    icon: any;
    color: string;
    fields: string[];
  }>;
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

  // Use provided formSteps or default FORM_STEPS
  const steps = formSteps ?? FORM_STEPS;

  // Calculate which step number corresponds to electric equipment
  // If formSteps has 7 items, customer step is included, so electric is step 4
  // If formSteps has 6 items, electric is step 3
  const electricStepNumber = steps.length > 6 ? 4 : 3;

  // Filtrar los pasos visibles (excluir Step 3/4 si no aplica - Equipos eléctricos)
  const visibleSteps = skipStep3
    ? steps.filter((step) => step.number !== electricStepNumber)
    : steps;

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
          <DialogTitle className="text-sm font-bold text-foreground truncate">
            {t(currentStepConfig.title as any)}
          </DialogTitle>
          <p className="text-xs text-muted-foreground truncate">
            {t(currentStepConfig.description as any)}
          </p>
        </div>

        {/* Compact progress badge - Visible on all screens */}
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

      {/* Responsive Stepper Wrapper - Compact Grid */}
      <div className="flex items-center justify-center gap-y-2 gap-x-1 mt-2 w-full p-0">
        {visibleSteps.map((step, idx) => {
          const isCompleted = completedSteps.has(step.number);
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
                title={t(step.title as any)}
              >
                <div
                  className={cn(
                    "relative size-7 sm:size-8 rounded-lg flex items-center justify-center transition-all duration-200 border shadow-sm",
                    isCurrent
                      ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                      // : isCompleted
                      //   ? "bg-[#60A82E]/10 border-[#60A82E]/30 text-[#60A82E]"
                        : "bg-muted/40 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border",
                  )}
                >
                  <Icon className="size-4" />
                  {/* Checkmark badge for completed steps */}
                  {/* {isCompleted && !isCurrent && (
                    <div className="absolute -top-1 -right-1 size-3.5 rounded-full bg-[#60A82E] flex items-center justify-center shadow-sm">
                      <Check className="size-2.5 text-white" strokeWidth={3} />
                    </div>
                  )} */}
                </div>
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] mt-1 font-medium w-full text-center leading-none transition-colors line-clamp-1",
                    isCurrent
                      ? "text-primary font-semibold"
                      // : isCompleted
                      //   ? "text-[#60A82E] font-medium"
                        : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {t(step.shortTitle as any)}
                </span>
              </button>

              {/* Connector line - Only visible on larger screens */}
              {idx < visibleSteps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block sm:w-3 h-px mx-0.5 self-start mt-4 transition-colors duration-300",
                    completedSteps.has(step.number) &&
                      completedSteps.has(visibleSteps[idx + 1]?.number)
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
