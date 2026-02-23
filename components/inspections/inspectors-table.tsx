"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { cn, getInitials, getRoleBadge } from "@/lib/utils";

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
  CarFront,
  ArrowUpDown,
  MoreHorizontal,
  PencilLine,
  Trash2,
  AlertCircle,
  Lock,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllRoles } from "@/lib/roles";
import { Role } from "@prisma/client";

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
  const { t, locale } = useTranslation();
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
                <SortableHeader field="name" className="px-4 py-3">
                  {t("inspectionsPage.inspectorTable.name")}
                </SortableHeader>
                <SortableHeader field="status" className="px-3 py-3">
                  {t("inspectionsPage.inspectorTable.status")}
                </SortableHeader>
                <SortableHeader
                  field="vehicles"
                  className="text-center px-3 py-3"
                >
                  {t("inspectionsPage.inspectorTable.vehicles")}
                </SortableHeader>
                <SortableHeader
                  field="inspections"
                  className="text-center hidden md:table-cell px-3 py-3"
                >
                  {t("inspectionsPage.inspectorTable.inspections")}
                </SortableHeader>
                <TableHead className="font-medium text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap px-3 py-3">
                  {t("inspectionsPage.inspectorTable.assignedPlates")}
                </TableHead>
                <SortableHeader
                  field="createdAt"
                  className="hidden xl:table-cell px-3 py-3"
                >
                  {t("inspectionsPage.inspectorTable.joined")}
                </SortableHeader>
                {(onEdit || onDelete) && (
                  <TableHead className="w-14 px-3 py-3">
                    <span className="sr-only">{t("common.actions")}</span>
                  </TableHead>
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
                const roles = (inspector.roles || []) as string[];
                const hasInspectorRole = roles.includes("INSPECTOR");
                const hasSellerRole = roles.includes("SELLER");

                return (
                  <TableRow
                    key={inspector.id}
                    className="hover:bg-muted/30 transition-colors group border-border/40"
                  >
                    {/* Name + Avatar */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {inspector.image ? (
                          <Image
                            src={inspector.image}
                            alt={inspector.name || inspector.email}
                            width={36}
                            height={36}
                            className="size-9 rounded-full object-cover object-center ring-2 ring-border shrink-0"
                          />
                        ) : (
                          <div className="size-9 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 ring-2 ring-primary/20">
                            {getInitials(inspector.name || inspector.email)}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-foreground leading-tight truncate">
                            {inspector.name || inspector.email}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5 truncate">
                            {inspector.email}
                          </span>
                          <div className="flex gap-1 mt-1">
                            {getAllRoles(inspector.roles as Role[]).map(
                              (role) => getRoleBadge(role),
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-3 py-3">
                      <Badge
                        variant={
                          inspector.isActive
                            ? "outline-success"
                            : "outline-destructive"
                        }
                        className="text-[11px] px-2 py-0.5 h-auto font-semibold shadow-xs"
                      >
                        {inspector.isActive ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            <span>
                              {t("inspectionsPage.inspectors.active")}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3" />
                            <span>
                              {t("inspectionsPage.inspectors.inactive")}
                            </span>
                          </>
                        )}
                      </Badge>
                    </TableCell>

                    {/* Vehicle count */}
                    <TableCell className="text-center px-3 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 text-xs rounded-md px-2 py-1 border",
                              vehicleCount > 0
                                ? "bg-sky-50 dark:bg-sky-950/30 border-sky-200/60 dark:border-sky-800/50"
                                : "bg-muted/40 border-border/40",
                            )}
                          >
                            <CarFront
                              className={cn(
                                "size-3",
                                vehicleCount > 0
                                  ? "text-sky-600 dark:text-sky-400"
                                  : "text-muted-foreground/50",
                              )}
                            />
                            <span
                              className={cn(
                                "font-bold tabular-nums",
                                vehicleCount > 0
                                  ? "text-sky-700 dark:text-sky-300"
                                  : "text-muted-foreground",
                              )}
                            >
                              {vehicleCount}
                            </span>
                            {/* SELLER-only lock icon when vehicle assigned */}
                            {hasSellerRole &&
                              !hasInspectorRole &&
                              vehicleCount >= 1 && (
                                <Lock className="size-2.5 text-amber-500" />
                              )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {vehicleCount > 0
                            ? `${vehicleCount} ${t("inspectionsPage.inspectors.vehiclesCount")}`
                            : t(
                                "inspectionsPage.inspectors.noVehiclesAssigned",
                              )}
                          {hasSellerRole &&
                            !hasInspectorRole &&
                            vehicleCount >= 1 && (
                              <span className="block text-amber-400 mt-0.5 dark:text-amber-700">
                                {t(
                                  "inspectionsPage.inspectors.sellerMaxOneVehicle",
                                )}
                              </span>
                            )}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Inspection count */}
                    <TableCell className="text-center hidden md:table-cell px-3 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1.5 text-xs bg-violet-50 dark:bg-violet-950/30 rounded-md px-2 py-1 border border-violet-200/60 dark:border-violet-800/50">
                            <ClipboardCheck className="size-3 text-violet-600 dark:text-violet-400" />
                            <span className="font-bold text-violet-700 dark:text-violet-300 tabular-nums">
                              {inspectionCount}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {inspectionCount}{" "}
                          {t("inspectionsPage.inspectors.inspectionsCount")}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Assigned plates */}
                    <TableCell className="hidden lg:table-cell px-3 py-3">
                      {inspector.assignedVehicles &&
                      inspector.assignedVehicles.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {inspector.assignedVehicles.slice(0, 2).map((v) => (
                            <Badge
                              key={v.id}
                              variant="outline"
                              className="text-[10px] h-5 px-2 gap-1 font-mono bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/60 dark:border-sky-800/50 text-sky-700 dark:text-sky-300"
                            >
                              <CarFront className="size-2.5 text-sky-500" />
                              {v.plate}
                            </Badge>
                          ))}
                          {inspector.assignedVehicles.length > 2 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 px-2"
                            >
                              +{inspector.assignedVehicles.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="size-3 text-muted-foreground/40" />
                          <span className="text-[11px] text-muted-foreground/70">
                            {t("inspectionsPage.inspectors.noVehiclesAssigned")}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="text-xs text-muted-foreground hidden xl:table-cell px-3 py-3">
                      {formatDateShort(inspector.createdAt, locale)}
                    </TableCell>

                    {/* Actions */}
                    {(onEdit || onDelete) && (
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
                          <DropdownMenuContent align="end" className="w-40">
                            {onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit(inspector)}
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
                                onClick={() => onDelete(inspector)}
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
