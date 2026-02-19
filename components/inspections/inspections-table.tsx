"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDateShort } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
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
  User,
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
} from "lucide-react";

interface InspectionsTableProps {
  inspections: Inspection[];
  onView: (inspection: Inspection) => void;
  onApprove?: (inspection: Inspection) => void;
  onDelete?: (inspection: Inspection) => void;
  isAdmin?: boolean;
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
  isAdmin,
}: InspectionsTableProps) {
  const { t } = useTranslation();
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="size-3 ml-0.5" />
    ) : (
      <ChevronDown className="size-3 ml-0.5" />
    );
  };

  const SortableHeader = ({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead
      className={cn(
        "font-medium text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
        className,
      )}
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center">
        {children}
        <SortIcon field={field} />
      </span>
    </TableHead>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<
      string,
      { icon: typeof CheckCircle2; colorClass: string; label: string }
    > = {
      PENDING: {
        icon: Clock,
        colorClass:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        label: t("inspectionsPage.status.pending"),
      },
      APPROVED: {
        icon: CheckCircle2,
        colorClass:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        label: t("inspectionsPage.status.approved"),
      },
      REJECTED: {
        icon: XCircle,
        colorClass:
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        label: t("inspectionsPage.status.rejected"),
      },
    };

    const c = config[status] || config.PENDING;
    const Icon = c.icon;

    return (
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] px-1.5 py-0 h-5 flex items-center gap-0.5 font-medium w-fit border",
          c.colorClass,
        )}
      >
        <Icon className="size-2.5" />
        <span>{c.label}</span>
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                <TableHead className="w-14 font-medium text-xs text-muted-foreground p-2">
                  {t("inspectionsPage.inspectionTable.image")}
                </TableHead>
                <SortableHeader field="vehicle">
                  {t("inspectionsPage.inspectionTable.vehicle")}
                </SortableHeader>
                <SortableHeader
                  field="inspector"
                  className="hidden sm:table-cell"
                >
                  {t("inspectionsPage.inspectionTable.inspector")}
                </SortableHeader>
                <SortableHeader field="status">
                  {t("inspectionsPage.inspectionTable.status")}
                </SortableHeader>
                <SortableHeader
                  field="mileage"
                  className="hidden md:table-cell text-right"
                >
                  {t("inspectionsPage.inspectionTable.mileage")}
                </SortableHeader>
                <SortableHeader
                  field="score"
                  className="hidden lg:table-cell text-right"
                >
                  {t("inspectionsPage.inspectionTable.score")}
                </SortableHeader>
                <SortableHeader
                  field="photos"
                  className="hidden lg:table-cell text-right"
                >
                  {t("inspectionsPage.inspectionTable.photos")}
                </SortableHeader>
                <SortableHeader
                  field="createdAt"
                  className="hidden xl:table-cell"
                >
                  {t("inspectionsPage.inspectionTable.date")}
                </SortableHeader>
                <TableHead className="w-24 p-2"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInspections.map((inspection) => {
                const scorePercent = getScore(inspection);
                const photosCount = inspection.photos?.length || 0;

                return (
                  <TableRow
                    key={inspection.id}
                    className="hover:bg-muted/20 transition-colors group cursor-pointer"
                    onClick={() => onView(inspection)}
                  >
                    {/* Vehicle Image */}
                    <TableCell className="p-2">
                      <div className="relative size-12 overflow-hidden bg-muted/50 rounded-lg">
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
                    <TableCell className="py-2">
                      <div className="font-medium text-sm text-foreground leading-tight">
                        {inspection.vehicle.model}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {inspection.vehicle.plate}
                      </div>
                    </TableCell>

                    {/* Inspector */}
                    <TableCell className="hidden sm:table-cell py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="size-6 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0">
                          <User className="size-3" />
                        </div>
                        <span className="text-xs text-foreground truncate max-w-[120px]">
                          {inspection.user.name || inspection.user.email}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2">
                      <StatusBadge status={inspection.status} />
                    </TableCell>

                    {/* Mileage */}
                    <TableCell className="text-right hidden md:table-cell py-2">
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <Gauge className="size-3 text-muted-foreground" />
                        <span className="font-mono font-medium text-foreground">
                          {inspection.mileage.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>

                    {/* Score */}
                    <TableCell className="hidden lg:table-cell py-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
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
                                "text-xs font-semibold tabular-nums min-w-8 text-right",
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
                    <TableCell className="text-right hidden lg:table-cell py-2">
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <ImageIcon className="size-3 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {photosCount}/6
                        </span>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground hidden xl:table-cell py-2">
                      {formatDateShort(inspection.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="p-2">
                      <div
                        className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => onView(inspection)}
                            >
                              <ArrowUpRight className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            {t("inspectionsPage.card.viewDetails")}
                          </TooltipContent>
                        </Tooltip>

                        {isAdmin &&
                          inspection.status === InspectionStatus.PENDING &&
                          onApprove && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
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

                        {isAdmin && onDelete && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
