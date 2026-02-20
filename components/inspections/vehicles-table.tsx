"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { Vehicle, VehicleStatus } from "@/interfaces/inspection";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
  ChevronUp,
  ChevronDown,
  Trash2,
  ClipboardCheck,
  ArrowUpDown,
  MoreHorizontal,
  PencilLine,
  Play,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onStartInspection?: (vehicle: Vehicle) => void;
}

type SortField =
  | "model"
  | "plate"
  | "status"
  | "inspector"
  | "inspections"
  | "createdAt";
type SortDirection = "asc" | "desc";

export function VehiclesTable({
  vehicles,
  onEdit,
  onDelete,
  onStartInspection,
}: VehiclesTableProps) {
  const [sortField, setSortField] = useState<SortField>("model");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { t, locale } = useTranslation();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedVehicles = [...vehicles].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "model":
        comparison = a.model.localeCompare(b.model);
        break;
      case "plate":
        comparison = a.plate.localeCompare(b.plate);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "inspector":
        comparison = (
          a.assignedInspector?.name ||
          a.assignedInspector?.email ||
          ""
        ).localeCompare(
          b.assignedInspector?.name || b.assignedInspector?.email || "",
        );
        break;
      case "inspections":
        comparison =
          (a._count?.inspections ?? 0) - (b._count?.inspections ?? 0);
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

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
                <TableHead className="w-16 font-medium text-xs text-muted-foreground px-4 py-3">
                  {t("inspectionsPage.vehicleTable.image")}
                </TableHead>
                <SortableHeader field="model" className="px-3 py-3">
                  {t("inspectionsPage.vehicleTable.model")}
                </SortableHeader>
                <SortableHeader
                  field="plate"
                  className="hidden sm:table-cell px-3 py-3"
                >
                  {t("inspectionsPage.vehicleTable.plate")}
                </SortableHeader>
                <SortableHeader field="status" className="px-3 py-3">
                  {t("inspectionsPage.vehicleTable.status")}
                </SortableHeader>
                <SortableHeader
                  field="inspector"
                  className="hidden md:table-cell px-3 py-3"
                >
                  {t("inspectionsPage.vehicleTable.inspector")}
                </SortableHeader>
                <SortableHeader
                  field="inspections"
                  className="text-right hidden lg:table-cell px-3 py-3"
                >
                  {t("inspectionsPage.vehicleTable.inspections")}
                </SortableHeader>
                <SortableHeader
                  field="createdAt"
                  className="hidden xl:table-cell px-3 py-3"
                >
                  {t("inspectionsPage.vehicleTable.created")}
                </SortableHeader>
                {(onEdit || onDelete || onStartInspection) && (
                  <TableHead className="w-14 px-3 py-3">
                    <span className="sr-only">{t("common.actions")}</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVehicles.map((vehicle) => {
                const isActive = vehicle.status === VehicleStatus.ACTIVE;
                const inspectionCount =
                  vehicle.inspections?.length ||
                  vehicle._count?.inspections ||
                  0;

                return (
                  <TableRow
                    key={vehicle.id}
                    className="hover:bg-muted/30 transition-colors group border-border/40"
                  >
                    {/* Thumbnail */}
                    <TableCell className="px-4 py-3">
                      <div className="size-12 relative overflow-hidden bg-secondary/50 rounded-lg ring-1 ring-border/30 shrink-0">
                        {vehicle.imageUrl ? (
                          <Image
                            src={vehicle.imageUrl}
                            alt={vehicle.model}
                            fill
                            className="object-cover object-center w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Car className="size-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Model + plate on mobile */}
                    <TableCell className="px-3 py-3">
                      <div className="font-medium text-sm text-foreground leading-tight">
                        {vehicle.model}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5 sm:hidden tracking-wide">
                        {vehicle.plate}
                      </div>
                    </TableCell>

                    {/* Plate */}
                    <TableCell className="hidden sm:table-cell px-3 py-3">
                      <Badge variant="outline-info" className="shadow-xs">
                        {vehicle.plate}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-3 py-3">
                      <Badge
                        variant={
                          isActive ? "outline-success" : "outline-destructive"
                        }
                        className="text-[10px] px-1.5 py-0 h-5 font-semibold shadow-xs"
                      >
                        {isActive ? (
                          <CheckCircle2 className="size-2.5" />
                        ) : (
                          <XCircle className="size-2.5" />
                        )}
                        {isActive
                          ? t("inspectionsPage.vehicles.active")
                          : t("inspectionsPage.vehicles.inactive")}
                      </Badge>
                    </TableCell>

                    {/* Inspector */}
                    <TableCell className="hidden md:table-cell px-3 py-3">
                      {vehicle.assignedInspector ? (
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-9 shrink-0 ring-2 ring-border/60">
                            <AvatarImage
                              className="object-cover object-center"
                              src={vehicle.assignedInspector.image || undefined}
                              alt={
                                vehicle.assignedInspector.name ||
                                vehicle.assignedInspector.email
                              }
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                              {getInitials(
                                vehicle.assignedInspector.name ||
                                  vehicle.assignedInspector.email,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col leading-tight min-w-0">
                            <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
                              {vehicle.assignedInspector.name ||
                                vehicle.assignedInspector.email}
                            </span>
                            {vehicle.assignedInspector.name && (
                              <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                                {vehicle.assignedInspector.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                          <User className="size-3" />
                          {t("inspectionsPage.vehicleTable.notAssigned")}
                        </span>
                      )}
                    </TableCell>

                    {/* Inspections */}
                    <TableCell className="text-right hidden lg:table-cell px-3 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-500/10 cursor-default">
                            <ClipboardCheck className="size-3 text-violet-500" />
                            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 tabular-nums">
                              {inspectionCount}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          {inspectionCount === 1
                            ? t(
                                "inspectionsPage.vehicleCard.inspectionCountSingular",
                                { count: inspectionCount },
                              )
                            : t("inspectionsPage.vehicleCard.inspectionCount", {
                                count: inspectionCount,
                              })}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Created */}
                    <TableCell className="text-xs text-muted-foreground hidden xl:table-cell px-3 py-3">
                      {formatDateShort(vehicle.createdAt, locale)}
                    </TableCell>

                    {/* Actions */}
                    {(onEdit || onDelete || onStartInspection) && (
                      <TableCell className="px-3 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="size-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
                            >
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">
                                {t("common.actions")}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {onStartInspection && (
                              <DropdownMenuItem
                                onClick={() => onStartInspection(vehicle)}
                                className="cursor-pointer"
                              >
                                <Play className="size-4" />
                                {t(
                                  "inspectionsPage.vehicleCard.startInspection",
                                )}
                              </DropdownMenuItem>
                            )}
                            {onStartInspection && (onEdit || onDelete) && (
                              <DropdownMenuSeparator />
                            )}
                            {onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit(vehicle)}
                                className="cursor-pointer"
                              >
                                <PencilLine className="size-4" />
                                {t("common.edit")}
                              </DropdownMenuItem>
                            )}
                            {onEdit && onDelete && <DropdownMenuSeparator />}
                            {onDelete && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(vehicle)}
                                className="cursor-pointer"
                              >
                                <Trash2 className="size-4" />
                                {t("common.delete")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
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
