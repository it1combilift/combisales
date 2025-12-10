import { cn } from "@/lib/utils";
import { FieldWrapperProps } from "../types";

/**
 * Wrapper component for form fields with optional icon
 * Handles icon positioning and styling
 */
export function FieldWrapper({
  children,
  icon: Icon,
  className,
}: FieldWrapperProps) {
  return (
    <div
      className={cn(
        "group relative",
        Icon && "[&_input]:pl-11 [&_textarea]:pl-11",
        className
      )}
    >
      {children}
      {Icon && (
        <div className="absolute left-3 top-11 size-4 flex items-center justify-center pointer-events-none z-10">
          <Icon className="size-3 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200" />
        </div>
      )}
    </div>
  );
}
