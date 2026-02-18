"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InspectionStatus } from "@prisma/client";
import { useTranslation } from "@/lib/i18n/context";
import { Search, X, LayoutGrid, List } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InspectionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  showViewToggle?: boolean;
}

export function InspectionFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  onClearFilters,
  hasActiveFilters,
  activeFilterCount,
  showViewToggle = true,
}: InspectionFiltersProps) {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const FilterControls = () => (
    <div className="flex flex-wrap gap-3 w-full items-center">
      <div className="flex flex-col w-full sm:w-auto space-y-1.5">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-44 bg-background">
            <SelectValue placeholder={t("inspectionsPage.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("inspectionsPage.filters.allStatuses")}
            </SelectItem>
            <SelectItem value={InspectionStatus.PENDING}>
              {t("inspectionsPage.status.pending")}
            </SelectItem>
            <SelectItem value={InspectionStatus.APPROVED}>
              {t("inspectionsPage.status.approved")}
            </SelectItem>
            <SelectItem value={InspectionStatus.REJECTED}>
              {t("inspectionsPage.status.rejected")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={() => {
            onClearFilters();
            setIsSheetOpen(false);
          }}
          className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
        >
          <X className="size-4" />
          {t("inspectionsPage.filters.clearFilters")}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="relative flex-1">
          <div>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t("inspectionsPage.filters.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background max-w-md text-xs md:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-center items-center gap-2">
          <FilterControls />

          {showViewToggle && (
            <div className="hidden md:flex gap-1 border rounded-lg p-1 bg-muted/30">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => onViewModeChange("grid")}
                className="h-9 w-9"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="icon"
                onClick={() => onViewModeChange("table")}
                className="h-9 w-9"
              >
                <List className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1.5 pr-1">
              {t("inspectionsPage.filters.status")}:{" "}
              {t(`inspectionsPage.status.${statusFilter.toLowerCase()}`)}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 hover:bg-transparent"
                onClick={() => onStatusChange("all")}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
