"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { cn, formatDateShort, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Inspection, InspectionStatus } from "@/interfaces/inspection";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Car,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  Trash2,
  Gauge,
  ImageIcon,
  ArrowUpDown,
  FileDown,
  Loader2,
} from "lucide-react";

interface InspectionsTableProps {
  inspections: Inspection[];
  onView: (inspection: Inspection) => void;
  onApprove?: (inspection: Inspection) => void;
  onDelete?: (inspection: Inspection) => void;
  onDownloadPdf?: (inspection: Inspection) => void;
  isGeneratingPdf?: boolean;
  generatingPdfId?: string;
  isAdmin?: boolean;
  currentUserId?: string;
}

type SortField =
  | "vehicle"
  | "inspector"
  | "status"
  | "mileage"
  | "score"
  | "photos"
  | "createdAt";
type SortDirection = "asc" | "desc";

const statusOrder: Record<string, number> = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
};

export function InspectionsTable({
  inspections,
  onView,
  onApprove,
  onDelete,
  onDownloadPdf,
  isGeneratingPdf,
  generatingPdfId,
  isAdmin,
  currentUserId,
}: InspectionsTableProps) {
  const { t, locale } = useTranslation();
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  const getScore = (insp: Inspection) => {
    const passed = checklistKeys.filter(
      (key) => insp[key as keyof Inspection] === true,
    ).length;
    return Math.round((passed / checklistKeys.length) * 100);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedInspections = [...inspections].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "vehicle":
        comparison = a.vehicle.model.localeCompare(b.vehicle.model);
        break;
      case "inspector":
        comparison = (a.user.name || a.user.email).localeCompare(
          b.user.name || b.user.email,
        );
        break;
      case "status":
        comparison =
          (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
        break;
      case "mileage":
        comparison = a.mileage - b.mileage;
        break;
      case "score":
        comparison = getScore(a) - getScore(b);
        break;
      case "photos":
        comparison = (a.photos?.length || 0) - (b.photos?.length || 0);
        break;
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  /* Sort icon helper */
  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return <ArrowUpDown className="size-3 ml-1 opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="size-3 ml-1" />
    ) : (
      <ChevronDown className="size-3 ml-1" />
    );
  }

  /* Sortable header cell */
  function SortableHeader({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <TableHead
        className={cn(
          "font-medium text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap",
          sortField === field && "text-foreground",
          className,
        )}
        onClick={() => handleSort(field)}
      >
        <span className="inline-flex items-center">
          {children}
          <SortIcon field={field} />
        </span>
      </TableHead>
    );
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<
      string,
      { icon: typeof CheckCircle2; colorClass: string; label: string }
    > = {
      PENDING: {
        icon: Clock,
        colorClass:
          "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/60",
        label: t("inspectionsPage.status.pending"),
      },
      APPROVED: {
        icon: CheckCircle2,
        colorClass:
          "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/60",
        label: t("inspectionsPage.status.approved"),
      },
      REJECTED: {
        icon: XCircle,
        colorClass:
          "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/60",
        label: t("inspectionsPage.status.rejected"),
      },
    };

    const c = config[status] || config.PENDING;
    const Icon = c.icon;

    return (
      <Badge
        variant="outline"
        className={cn(
          "text-[11px] px-2 py-0.5 h-auto flex items-center gap-1 font-semibold w-fit border shadow-xs",
          c.colorClass,
        )}
      >
        <Icon className="size-3" />
        <span>{c.label}</span>
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
                <TableHead className="w-16 font-medium text-xs text-muted-foreground px-4 py-3">
                  {t("inspectionsPage.inspectionTable.image")}
                </TableHead>
                <SortableHeader field="vehicle" className="px-3 py-3">
                  {t("inspectionsPage.inspectionTable.vehicle")}
                </SortableHeader>
                <SortableHeader
                  field="inspector"
                  className="hidden sm:table-cell px-3 py-3"
                >
                  {t("inspectionsPage.inspectionTable.inspector")}
                </SortableHeader>
                <SortableHeader field="status" className="px-3 py-3">
                  {t("inspectionsPage.inspectionTable.status")}
                </SortableHeader>
                <SortableHeader
                  field="mileage"
                  className="hidden md:table-cell text-right px-3 py-3"
                >
                  {t("inspectionsPage.inspectionTable.mileage")}
                </SortableHeader>
                <SortableHeader
                  field="score"
                  className="hidden lg:table-cell text-right px-3 py-3"
                >
                  {t("inspectionsPage.inspectionTable.score")}
                </SortableHeader>
                <SortableHeader
                  field="photos"
                  className="hidden lg:table-cell text-right px-3 py-3"
                >
                  {t("inspectionsPage.inspectionTable.photos")}
                </SortableHeader>
                <SortableHeader
                  field="createdAt"
                  className="hidden xl:table-cell px-3 py-3"
                >
                  {t("inspectionsPage.inspectionTable.date")}
                </SortableHeader>
                <TableHead className="w-28 px-3 py-3">
                  <span className="sr-only">{t("common.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInspections.map((inspection) => {
                const scorePercent = getScore(inspection);
                const photosCount = inspection.photos?.length || 0;

                return (
                  <TableRow
                    key={inspection.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer border-border/40"
                    onClick={() => onView(inspection)}
                  >
                    {/* Vehicle Image */}
                    <TableCell className="px-4 py-3">
                      <div className="relative size-12 overflow-hidden bg-secondary/50 rounded-lg shrink-0 ring-1 ring-border/30">
                        {inspection.vehicle.imageUrl ? (
                          <Image
                            src={inspection.vehicle.imageUrl}
                            alt={inspection.vehicle.model}
                            fill
                            className="object-contain object-center"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Car className="size-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Vehicle model + plate */}
                    <TableCell className="px-3 py-3">
                      <div className="font-semibold text-sm text-foreground leading-tight">
                        {inspection.vehicle.model}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground mt-0.5 tracking-wide">
                        {inspection.vehicle.plate}
                      </div>
                    </TableCell>

                    {/* Inspector */}
                    <TableCell
                      className="hidden sm:table-cell px-3 py-3"
                      title={inspection.user.name || inspection.user.email}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8 shrink-0 ring-2 ring-border/60 group-hover:ring-primary/20 transition-all duration-300">
                          <AvatarImage
                            className="object-cover object-center"
                            src={inspection.user.image || undefined}
                            alt={inspection.user.name || inspection.user.email}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {getInitials(
                              inspection.user.name || inspection.user.email,
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-medium text-foreground truncate max-w-[130px]">
                            {inspection.user.name || inspection.user.email}
                          </span>
                          <span className="text-xs font-medium truncate max-w-[130px] text-muted-foreground">
                            {inspection.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-3 py-3">
                      <StatusBadge status={inspection.status} />
                    </TableCell>

                    {/* Mileage */}
                    <TableCell className="text-right hidden md:table-cell px-3 py-3">
                      <div className="inline-flex items-center gap-1.5 text-xs bg-muted/50 rounded-md px-2 py-1 border border-border/30">
                        <Gauge className="size-3 text-muted-foreground" />
                        <span className="font-mono font-semibold text-foreground tabular-nums">
                          {inspection.mileage.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>

                    {/* Score */}
                    <TableCell className="hidden lg:table-cell px-3 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-2.5">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  scorePercent >= 80
                                    ? "bg-emerald-500"
                                    : scorePercent >= 50
                                      ? "bg-amber-500"
                                      : "bg-rose-500",
                                )}
                                style={{ width: `${scorePercent}%` }}
                              />
                            </div>
                            <span
                              className={cn(
                                "text-xs font-bold tabular-nums min-w-8 text-right",
                                scorePercent >= 80
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : scorePercent >= 50
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-rose-600 dark:text-rose-400",
                              )}
                            >
                              {scorePercent}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          {
                            checklistKeys.filter(
                              (key) =>
                                inspection[key as keyof Inspection] === true,
                            ).length
                          }
                          /{checklistKeys.length}{" "}
                          {t("inspectionsPage.card.checklistScore")}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Photos */}
                    <TableCell className="text-right hidden lg:table-cell px-3 py-3">
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <ImageIcon className="size-3 text-muted-foreground" />
                        <span className="font-semibold text-foreground tabular-nums">
                          {photosCount}
                        </span>
                        <span className="text-muted-foreground">/6</span>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground hidden xl:table-cell px-3 py-3">
                      {formatDateShort(inspection.createdAt, locale)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-3 py-3">
                      <div
                        className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                              onClick={() => onView(inspection)}
                            >
                              <ArrowUpRight className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            {t("inspectionsPage.card.viewDetails")}
                          </TooltipContent>
                        </Tooltip>

                        {onDownloadPdf && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => onDownloadPdf(inspection)}
                                disabled={
                                  isGeneratingPdf &&
                                  generatingPdfId === inspection.id
                                }
                              >
                                {isGeneratingPdf &&
                                generatingPdfId === inspection.id ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <FileDown className="size-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">
                              {t("inspectionsPage.pdf.download")}
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {isAdmin &&
                          inspection.status === InspectionStatus.PENDING &&
                          onApprove && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                  onClick={() => onApprove(inspection)}
                                >
                                  <ShieldCheck className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs">
                                {t("inspectionsPage.approval.review")}
                              </TooltipContent>
                            </Tooltip>
                          )}

                        {(isAdmin ||
                          (currentUserId &&
                            inspection.userId === currentUserId &&
                            inspection.status === InspectionStatus.PENDING)) &&
                          onDelete && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => onDelete(inspection)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs">
                                {t("inspectionsPage.delete.title")}
                              </TooltipContent>
                            </Tooltip>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
