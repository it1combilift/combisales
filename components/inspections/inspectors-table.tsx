"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

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
  ChevronUp,
  ChevronDown,
  ClipboardCheck,
  Mail,
  CarFront,
  Edit,
  Trash2,
} from "lucide-react";

interface InspectorData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  assignedVehicles?: {
    id: string;
    model: string;
    plate: string;
    status: string;
    imageUrl?: string | null;
  }[];
  _count?: {
    inspections: number;
    assignedVehicles: number;
  };
}

interface InspectorsTableProps {
  inspectors: InspectorData[];
  onEdit?: (inspector: InspectorData) => void;
  onDelete?: (inspector: InspectorData) => void;
}

type SortField =
  | "name"
  | "email"
  | "status"
  | "vehicles"
  | "inspections"
  | "createdAt";
type SortDirection = "asc" | "desc";

export function InspectorsTable({
  inspectors,
  onEdit,
  onDelete,
}: InspectorsTableProps) {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedInspectors = [...inspectors].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "name":
        comparison = (a.name || a.email).localeCompare(b.name || b.email);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "status":
        comparison = Number(b.isActive) - Number(a.isActive);
        break;
      case "vehicles":
        comparison =
          (a._count?.assignedVehicles ?? a.assignedVehicles?.length ?? 0) -
          (b._count?.assignedVehicles ?? b.assignedVehicles?.length ?? 0);
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
                <SortableHeader field="name">
                  {t("inspectionsPage.inspectorTable.name")}
                </SortableHeader>
                <SortableHeader field="status">
                  {t("inspectionsPage.inspectorTable.status")}
                </SortableHeader>
                <SortableHeader field="vehicles" className="text-left">
                  {t("inspectionsPage.inspectorTable.vehicles")}
                </SortableHeader>
                <SortableHeader
                  field="inspections"
                  className="text-right hidden md:table-cell"
                >
                  {t("inspectionsPage.inspectorTable.inspections")}
                </SortableHeader>
                <TableHead className="font-medium text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                  {t("inspectionsPage.inspectorTable.assignedPlates")}
                </TableHead>
                <SortableHeader
                  field="createdAt"
                  className="hidden xl:table-cell"
                >
                  {t("inspectionsPage.inspectorTable.joined")}
                </SortableHeader>
                {(onEdit || onDelete) && (
                  <TableHead className="w-20 p-2"></TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInspectors.map((inspector) => {
                const vehicleCount =
                  inspector._count?.assignedVehicles ??
                  inspector.assignedVehicles?.length ??
                  0;
                const inspectionCount = inspector._count?.inspections ?? 0;

                return (
                  <TableRow
                    key={inspector.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* Name + Avatar */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2.5">
                        {inspector.image ? (
                          <Image
                            src={inspector.image}
                            alt={inspector.name || inspector.email}
                            width={28}
                            height={28}
                            className="size-10 rounded-full object-cover object-center ring-1 ring-border shrink-0"
                          />
                        ) : (
                          <div className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 ring-1 ring-primary/20">
                            {getInitials(inspector.name || inspector.email)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div className="font-medium text-sm text-foreground leading-tight">
                            {inspector.name || inspector.email}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            {inspector.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2">
                      <Badge
                        variant={inspector.isActive ? "success" : "destructive"}
                        className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-0.5 font-medium w-fit"
                      >
                        {inspector.isActive ? (
                          <>
                            <CheckCircle2 className="size-2.5" />
                            <span>
                              {t("inspectionsPage.inspectors.active")}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-2.5" />
                            <span>
                              {t("inspectionsPage.inspectors.inactive")}
                            </span>
                          </>
                        )}
                      </Badge>
                    </TableCell>

                    {/* Vehicle count */}
                    <TableCell className="text-left py-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <CarFront className="size-3 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {vehicleCount}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          {vehicleCount}{" "}
                          {t("inspectionsPage.inspectors.vehiclesCount")}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Inspection count */}
                    <TableCell className="text-right hidden md:table-cell py-2">
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
                          {t("inspectionsPage.inspectors.inspectionsCount")}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Assigned plates */}
                    <TableCell className="hidden lg:table-cell py-2">
                      {inspector.assignedVehicles &&
                      inspector.assignedVehicles.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {inspector.assignedVehicles.slice(0, 2).map((v) => (
                            <Badge
                              key={v.id}
                              variant="outline"
                              className="text-[10px] h-5 px-1.5 gap-0.5 font-mono"
                            >
                              <Car className="size-2.5" />
                              {v.plate}
                            </Badge>
                          ))}
                          {inspector.assignedVehicles.length > 2 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-1.5"
                            >
                              +{inspector.assignedVehicles.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="text-xs text-muted-foreground hidden xl:table-cell py-2">
                      {formatDateShort(inspector.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    {(onEdit || onDelete) && (
                      <TableCell className="p-2">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => onEdit(inspector)}
                            >
                              <Edit className="size-3.5" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive"
                              onClick={() => onDelete(inspector)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
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
