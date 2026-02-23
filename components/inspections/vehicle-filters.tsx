"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VehicleStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { Search, X, LayoutGrid, List } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  assignmentFilter: string;
  onAssignmentChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showViewToggle?: boolean;
}

export function VehicleFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  assignmentFilter,
  onAssignmentChange,
  viewMode,
  onViewModeChange,
  showViewToggle = true,
}: VehicleFiltersProps) {
  const { t } = useTranslation();

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "all" || assignmentFilter !== "all";

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 w-full">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t(
                "inspectionsPage.vehicleFilters.searchPlaceholder",
              )}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background h-9 text-xs w-full"
            />
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-fit h-9 bg-background">
              <SelectValue
                placeholder={t("inspectionsPage.vehicleFilters.status")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("inspectionsPage.vehicleFilters.allStatuses")}
              </SelectItem>
              <SelectItem value={VehicleStatus.ACTIVE}>
                {t("inspectionsPage.vehicles.active")}
              </SelectItem>
              <SelectItem value={VehicleStatus.INACTIVE}>
                {t("inspectionsPage.vehicles.inactive")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Assignment filter */}
          <Select value={assignmentFilter} onValueChange={onAssignmentChange}>
            <SelectTrigger className="w-fit h-9 bg-background hidden sm:inline-flex">
              <SelectValue
                placeholder={t("inspectionsPage.vehicleFilters.assignment")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("inspectionsPage.vehicleFilters.allAssignments")}
              </SelectItem>
              <SelectItem value="assigned">
                {t("inspectionsPage.vehicleFilters.assigned")}
              </SelectItem>
              <SelectItem value="unassigned">
                {t("inspectionsPage.vehicleFilters.unassigned")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Clear */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground"
              onClick={() => {
                onSearchChange("");
                onStatusChange("all");
                onAssignmentChange("all");
              }}
            >
              <X className="size-3.5" />
              <span className="hidden sm:inline">
                {t("inspectionsPage.filters.clearFilters")}
              </span>
            </Button>
          )}
        </div>

        {/* View toggle */}
        {showViewToggle && (
          <div className="hidden md:flex gap-1 border rounded-lg p-0.5 bg-muted/30">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("grid")}
              className="h-8 w-8"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("list")}
              className="h-8 w-8"
            >
              <List className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex gap-1.5 flex-wrap">
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-1 px-2">
              {statusFilter === VehicleStatus.ACTIVE
                ? t("inspectionsPage.vehicles.active")
                : t("inspectionsPage.vehicles.inactive")}
              <button onClick={() => onStatusChange("all")}>
                <X className="size-2.5" />
              </button>
            </Badge>
          )}
          {assignmentFilter !== "all" && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-1 px-2">
              {assignmentFilter === "assigned"
                ? t("inspectionsPage.vehicleFilters.assigned")
                : t("inspectionsPage.vehicleFilters.unassigned")}
              <button onClick={() => onAssignmentChange("all")}>
                <X className="size-2.5" />
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-1 px-2">
              &ldquo;{searchQuery}&rdquo;
              <button onClick={() => onSearchChange("")}>
                <X className="size-2.5" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
