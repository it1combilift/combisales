"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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


interface InspectorFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  vehicleFilter: string;
  onVehicleFilterChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showViewToggle?: boolean;
}

export function InspectorFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  vehicleFilter,
  onVehicleFilterChange,
  viewMode,
  onViewModeChange,
  showViewToggle = true,
}: InspectorFiltersProps) {
  const { t } = useTranslation();

  const hasActiveFilters =
    searchQuery !== "" || statusFilter !== "all" || vehicleFilter !== "all";

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-between flex-wrap">
        <div className="flex justify-start flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t(
                "inspectionsPage.inspectorFilters.searchPlaceholder",
              )}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background h-9 text-xs md:w-auto w-full"
            />
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-fit h-9 bg-background">
              <SelectValue
                placeholder={t("inspectionsPage.inspectorFilters.status")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("inspectionsPage.inspectorFilters.allStatuses")}
              </SelectItem>
              <SelectItem value="active">
                {t("inspectionsPage.inspectors.active")}
              </SelectItem>
              <SelectItem value="inactive">
                {t("inspectionsPage.inspectors.inactive")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Vehicle assignment filter */}
          <Select value={vehicleFilter} onValueChange={onVehicleFilterChange}>
            <SelectTrigger className="w-fit h-9 bg-background hidden sm:flex">
              <SelectValue
                placeholder={t("inspectionsPage.inspectorFilters.vehicles")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("inspectionsPage.inspectorFilters.allVehicles")}
              </SelectItem>
              <SelectItem value="with-vehicles">
                {t("inspectionsPage.inspectorFilters.withVehicles")}
              </SelectItem>
              <SelectItem value="without-vehicles">
                {t("inspectionsPage.inspectorFilters.withoutVehicles")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground"
            onClick={() => {
              onSearchChange("");
              onStatusChange("all");
              onVehicleFilterChange("all");
            }}
          >
            <X className="size-3.5" />
            <span className="hidden sm:inline">
              {t("inspectionsPage.filters.clearFilters")}
            </span>
          </Button>
        )}

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
              {statusFilter === "active"
                ? t("inspectionsPage.inspectors.active")
                : t("inspectionsPage.inspectors.inactive")}
              <button onClick={() => onStatusChange("all")}>
                <X className="size-2.5" />
              </button>
            </Badge>
          )}
          {vehicleFilter !== "all" && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-1 px-2">
              {vehicleFilter === "with-vehicles"
                ? t("inspectionsPage.inspectorFilters.withVehicles")
                : t("inspectionsPage.inspectorFilters.withoutVehicles")}
              <button onClick={() => onVehicleFilterChange("all")}>
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
