"use client";

import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ==================== INFO FIELD COMPONENT ====================
export const InfoField = ({
  label,
  value,
  icon: Icon,
  isLink = false,
  className = "",
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ElementType;
  isLink?: boolean;
  className?: string;
}) => {
  if (value === null || value === undefined || value === "") return null;

  const displayValue = typeof value === "number" ? value.toString() : value;

  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />}
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">
        {isLink ? (
          <a
            href={
              displayValue.startsWith("http")
                ? displayValue
                : `https://${displayValue}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1 break-all"
          >
            <span className="truncate max-w-[200px]">{displayValue}</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        ) : (
          <span className="wrap-break-word">{displayValue}</span>
        )}
      </dd>
    </div>
  );
};

// ==================== INFO SECTION COMPONENT ====================
export const InfoSection = ({
  title,
  description,
  icon: Icon,
  children,
  className = "",
  headerAction,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}) => (
  <Card className={cn("overflow-hidden", className)}>
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base font-semibold">
          <div className="flex items-center justify-center size-8 rounded-xl bg-primary/10 shrink-0">
            <Icon className="size-4 text-primary" />
          </div>
          <span className="truncate">{title}</span>
        </CardTitle>
        {headerAction}
      </div>
      {description && (
        <CardDescription className="text-xs mt-1.5 ml-11 sm:ml-12">
          {description}
        </CardDescription>
      )}
    </CardHeader>
    <CardContent className="pt-0">{children}</CardContent>
  </Card>
);

// ==================== STAT CARD COMPONENT ====================
export const StatCard = ({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 p-1 sm:p-2 rounded-xl bg-muted/40 border border-border/50",
      className
    )}
  >
    <div className="flex items-center justify-center size-8 rounded-lg bg-background border border-border/60 shadow-sm">
      <Icon className="size-4 text-muted-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground truncate text-balance">
        {value}
      </p>
    </div>
  </div>
);

// ==================== NUMBER DISPLAY COMPONENT ====================
export const NumberDisplay = ({
  label,
  value,
  unit,
  icon: Icon,
}: {
  label: string;
  value?: number | null;
  unit?: string;
  icon?: React.ElementType;
}) => {
  if (value === null || value === undefined) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />}
        {label}
      </span>
      <span className="text-sm font-bold text-primary">
        {value}
        {unit && (
          <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        )}
      </span>
    </div>
  );
};
