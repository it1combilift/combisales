import React from "react";
import { AlertCircleIcon, CheckCircle2Icon, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AlertVariant = "default" | "destructive" | "success" | "info";

interface AlertMessageProps {
  title?: string;
  description?: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
}

export function AlertMessage({
  title,
  description,
  variant = "default",
  className,
}: AlertMessageProps) {
  const Icon =
    variant === "destructive"
      ? AlertCircleIcon
      : variant === "success"
      ? CheckCircle2Icon
      : Info;

  const alertVariant = variant as any;
  const classForAlert =
    className ??
    `${
      variant === "destructive"
        ? "bg-red-50/90 dark:bg-red-900/18 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-900"
        : variant === "success"
        ? "bg-green-50/90 dark:bg-green-900/18 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-900"
        : variant === "info"
        ? "bg-blue-50/90 dark:bg-blue-900/18 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-900"
        : "text-gray-700 dark:text-gray-900"
    }`;

  const iconColorClass =
    variant === "destructive"
      ? "text-red-700 dark:text-red-900"
      : variant === "success"
      ? "text-green-700 dark:text-green-900"
      : variant === "info"
      ? "text-blue-700 dark:text-blue-900"
      : "text-gray-700 dark:text-gray-900";

  const ariaLive = variant === "destructive" ? "assertive" : "polite";

  return (
    <Alert
      variant={alertVariant}
      className={classForAlert}
      aria-live={ariaLive}
    >
      <Icon className={`h-5 w-5 shrink-0 ${iconColorClass}`} />
      {title && (
        <AlertTitle
          className={
            "text-sm font-medium " +
            (variant === "destructive"
              ? "text-red-800 dark:text-red-200"
              : variant === "success"
              ? "text-green-800 dark:text-green-200"
              : variant === "info"
              ? "text-blue-800 dark:text-blue-200"
              : "text-card-foreground dark:text-card-foreground")
          }
        >
          {title}
        </AlertTitle>
      )}
      {description && (
        <AlertDescription
          className={
            "text-sm " +
            (variant === "destructive"
              ? "text-red-600/95 dark:text-red-300/90"
              : variant === "success"
              ? "text-green-700/95 dark:text-green-200/90"
              : variant === "info"
              ? "text-blue-700/95 dark:text-blue-200/90"
              : "text-muted-foreground")
          }
        >
          {description}
        </AlertDescription>
      )}
    </Alert>
  );
}
