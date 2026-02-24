"use client";

import Image from "next/image";
import { Separator } from "../ui/separator";
import { DialogOverlay } from "../ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateShort, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Inspection, InspectionStatus } from "@/interfaces/inspection";

import {
  CheckCircle2,
  Clock,
  Car,
  Calendar,
  Gauge,
  ArrowUpRight,
  ShieldCheck,
  Trash2,
  ImageIcon,
  ShieldXIcon,
  ShieldCheckIcon,
  CarFront,
  FileDown,
  Loader2,
} from "lucide-react";

interface InspectionCardProps {
  inspection: Inspection;
  onView: (inspection: Inspection) => void;
  onApprove?: (inspection: Inspection) => void;
  onDelete?: (inspection: Inspection) => void;
  onDownloadPdf?: (inspection: Inspection) => void;
  isGeneratingPdf?: boolean;
  generatingPdfId?: string;
  isAdmin?: boolean;
  currentUserId?: string;
}

export function InspectionCard({
  inspection,
  onView,
  onApprove,
  onDelete,
  onDownloadPdf,
  isGeneratingPdf,
  generatingPdfId,
  isAdmin,
  currentUserId,
}: InspectionCardProps) {
  const { t, locale } = useTranslation();

  const statusConfig: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive";
      icon: typeof CheckCircle2;
      colorClass: string;
    }
  > = {
    APPROVED: {
      variant: "default",
      icon: ShieldCheckIcon,
      colorClass:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    },
    REJECTED: {
      variant: "destructive",
      icon: ShieldXIcon,
      colorClass:
        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    },
    PENDING: {
      variant: "secondary",
      icon: Clock,
      colorClass:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
  };

  const config = statusConfig[inspection.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  // Calculate checklist score
  const checklistKeys = [
    "oilLevel",
    "coolantLevel",
    "brakeFluidLevel",
    "hydraulicLevel",
    "brakePedal",
    "clutchPedal",
    "gasPedal",
    "headlights",
    "tailLights",
    "brakeLights",
    "turnSignals",
    "hazardLights",
    "reversingLights",
    "dashboardLights",
  ] as const;

  const passedChecks = checklistKeys.filter(
    (key) => inspection[key as keyof Inspection] === true,
  ).length;
  const totalChecks = checklistKeys.length;
  const scorePercent = Math.round((passedChecks / totalChecks) * 100);

  const photosCount = inspection.photos?.length || 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer",
        "border-0 rounded-2xl shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/8",
        "bg-card border pb-0",
      )}
      onClick={() => onView(inspection)}
    >
      {/* Status accent bar */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] rounded-l-2xl transition-all duration-300 group-hover:w-1",
          inspection.status === InspectionStatus.PENDING
            ? "bg-amber-400 dark:bg-amber-500"
            : inspection.status === InspectionStatus.APPROVED
              ? "bg-emerald-400 dark:bg-emerald-500"
              : "bg-rose-400 dark:bg-rose-500",
        )}
      />

      <CardContent className="pl-5 pr-4 pb-4 pt-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Vehicle avatar */}
            <div className="relative shrink-0">
              <div className="size-20 rounded-xl overflow-hidden bg-muted border border-border/50">
                {inspection.vehicle.imageUrl ? (
                  <Image
                    src={inspection.vehicle.imageUrl}
                    alt={inspection.vehicle.model}
                    width={100}
                    height={100}
                    className="size-full object-contain object-center"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50">
                    <CarFront className="size-4 text-muted-foreground/60" />
                  </div>
                )}
              </div>
              {/* Online-style status dot */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card animate-pulse",
                  inspection.status === InspectionStatus.PENDING
                    ? "bg-amber-400"
                    : inspection.status === InspectionStatus.APPROVED
                      ? "bg-emerald-400"
                      : "bg-rose-400",
                )}
              />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
                {inspection.vehicle.model}
              </h3>
              <p className="text-[11px] font-mono text-muted-foreground tracking-wider mt-0.5">
                {inspection.vehicle.plate}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-xs font-medium h-6 px-2.5 gap-1.5 rounded-full border transition-colors duration-300 flex items-center justify-center",
              config.colorClass,
            )}
            title={t(
              `inspectionsPage.status.${inspection.status.toLowerCase()}`,
            )}
          >
            <StatusIcon className="size-2.5 animate-pulse" />
            {t(`inspectionsPage.status.${inspection.status.toLowerCase()}`)}
          </Badge>
        </div>

        {/* Divider */}
        <Separator className="my-0" />

        {/* Metadata */}
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground font-mono">
            {t("inspectionsPage.vehicles.assignedTo")}
          </span>
          {/* Inspector row with avatar */}
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-8 shrink-0 ring-2 ring-border/60 group-hover:ring-primary/20 transition-all duration-300">
              <AvatarImage
                className="object-cover object-center"
                src={inspection.user.image || undefined}
                alt={inspection.user.name || inspection.user.email}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {getInitials(inspection.user.name || inspection.user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                {inspection.user.name || inspection.user.email}
              </span>
              <span className="text-xs font-medium truncate max-w-[180px] text-muted-foreground">
                {inspection.user.email}
              </span>
            </div>
          </div>

          {/* Icon-based metadata */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                icon: Gauge,
                label: `${inspection.mileage.toLocaleString()} km`,
              },
              {
                icon: Calendar,
                label: formatDateShort(inspection.createdAt, locale),
              },
              {
                icon: ImageIcon,
                label: `${photosCount}/6 ${t("inspectionsPage.form.photos.uploaded")}`,
              },
            ].map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 min-w-0"
                title={label}
              >
                <div className="size-6 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                  <Icon className="size-3 text-muted-foreground" />
                </div>
                <span className="text-xs text-foreground/80 truncate font-mono">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Score bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              {t("inspectionsPage.card.checklistScore")}
            </span>
            <span
              className={cn(
                "text-[11px] font-semibold tabular-nums",
                scorePercent >= 80
                  ? "text-emerald-600 dark:text-emerald-400"
                  : scorePercent >= 50
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400",
              )}
            >
              {passedChecks}/{totalChecks} · {scorePercent}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                scorePercent >= 80
                  ? "bg-emerald-500"
                  : scorePercent >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500",
              )}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 h-8 text-xs font-medium gap-1.5 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              onView(inspection);
            }}
          >
            <ArrowUpRight className="size-3.5" />
            {t("inspectionsPage.card.viewDetails")}
          </Button>

          {onDownloadPdf && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadPdf(inspection);
              }}
              disabled={isGeneratingPdf && generatingPdfId === inspection.id}
              title={t("inspectionsPage.pdf.download")}
            >
              {isGeneratingPdf && generatingPdfId === inspection.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileDown className="size-4" />
              )}
            </Button>
          )}

          {isAdmin &&
            inspection.status === InspectionStatus.PENDING &&
            onApprove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(inspection);
                }}
                title={t("inspectionsPage.approval.review")}
              >
                <ShieldCheck className="size-4" />
              </Button>
            )}

          {(isAdmin ||
            (currentUserId &&
              inspection.userId === currentUserId &&
              inspection.status === InspectionStatus.PENDING)) &&
            onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(inspection);
                }}
                title={t("inspectionsPage.delete.title")}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
