"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { Vehicle, VehicleStatus } from "@/interfaces/inspection";

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
  Edit,
  Trash2,
  ClipboardCheck,
} from "lucide-react";

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
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
}: VehiclesTableProps) {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>("model");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
          ((a as any)._count?.inspections || 0) -
          ((b as any)._count?.inspections || 0);
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

  return (
    <TooltipProvider>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                <TableHead className="w-14 font-medium text-xs text-muted-foreground p-2">
                  {t("inspectionsPage.vehicleTable.image")}
                </TableHead>
                <SortableHeader field="model">
                  {t("inspectionsPage.vehicleTable.model")}
                </SortableHeader>
                <SortableHeader field="plate" className="hidden sm:table-cell">
                  {t("inspectionsPage.vehicleTable.plate")}
                </SortableHeader>
                <SortableHeader field="status">
                  {t("inspectionsPage.vehicleTable.status")}
                </SortableHeader>
                <SortableHeader
                  field="inspector"
                  className="hidden md:table-cell"
                >
                  {t("inspectionsPage.vehicleTable.inspector")}
                </SortableHeader>
                <SortableHeader
                  field="inspections"
                  className="text-right hidden lg:table-cell"
                >
                  {t("inspectionsPage.vehicleTable.inspections")}
                </SortableHeader>
                <SortableHeader
                  field="createdAt"
                  className="hidden xl:table-cell"
                >
                  {t("inspectionsPage.vehicleTable.created")}
                </SortableHeader>
                <TableHead className="w-20 p-2"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVehicles.map((vehicle) => {
                const isActive = vehicle.status === VehicleStatus.ACTIVE;
                const inspectionCount =
                  (vehicle as any)._count?.inspections || 0;

                return (
                  <TableRow
                    key={vehicle.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* Image */}
                    <TableCell className="p-2">
                      <div className="relative size-16 overflow-hidden bg-muted/50 rounded">
                        {vehicle.imageUrl ? (
                          <Image
                            src={vehicle.imageUrl}
                            alt={vehicle.model}
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

                    {/* Model + plate on mobile */}
                    <TableCell className="py-2">
                      <div className="font-medium text-sm text-foreground leading-tight">
                        {vehicle.model}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5 sm:hidden">
                        {vehicle.plate}
                      </div>
                    </TableCell>

                    {/* Plate */}
                    <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell py-2">
                      {vehicle.plate}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2">
                      <Badge
                        variant={isActive ? "success" : "destructive"}
                        className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-0.5 font-medium w-fit"
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="size-2.5" />
                            <span>{t("inspectionsPage.vehicles.active")}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-2.5" />
                            <span>
                              {t("inspectionsPage.vehicles.inactive")}
                            </span>
                          </>
                        )}
                      </Badge>
                    </TableCell>

                    {/* Inspector */}
                    <TableCell className="hidden md:table-cell py-2">
                      {vehicle.assignedInspector ? (
                        <div className="flex items-center gap-2">
                          {vehicle.assignedInspector.image ? (
                            <Image
                              src={vehicle.assignedInspector.image}
                              alt={
                                vehicle.assignedInspector.name ||
                                vehicle.assignedInspector.email
                              }
                              width={20}
                              height={20}
                              className="rounded-full size-10 object-cover object-center ring-1 ring-border shrink-0"
                            />
                          ) : (
                            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary text-[9px] font-bold shrink-0">
                              {getInitials(
                                vehicle.assignedInspector.name ||
                                  vehicle.assignedInspector.email,
                              )}
                            </div>
                          )}
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm text-foreground truncate max-w-[120px]">
                              {vehicle.assignedInspector.name ||
                                vehicle.assignedInspector.email}
                            </span>
                            <span className="text-xs text-foreground truncate max-w-[120px]">
                              {vehicle.assignedInspector.email}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                          <User className="size-3" />
                          {t("inspectionsPage.vehicles.noInspector")}
                        </span>
                      )}
                    </TableCell>

                    {/* Inspections count */}
                    <TableCell className="text-right hidden lg:table-cell py-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-1 text-xs">
                            <ClipboardCheck className="size-3 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {inspectionCount}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          {inspectionCount}{" "}
                          {t("inspectionsPage.vehicles.inspectionCount")}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Created */}
                    <TableCell className="text-xs text-muted-foreground hidden xl:table-cell py-2">
                      {formatDateShort(vehicle.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="p-2">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => onEdit(vehicle)}
                          >
                            <Edit className="size-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            onClick={() => onDelete(vehicle)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
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
