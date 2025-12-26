"use client";

import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Filter,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MachineFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  availabilityFilter: string;
  onAvailabilityChange: (value: string) => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  insuranceFilter: string;
  onInsuranceChange: (value: string) => void;
  hoursRangeFilter: string;
  onHoursRangeChange: (value: string) => void;
  locations: string[];
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  showViewToggle?: boolean;
}

export function MachineFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  availabilityFilter,
  onAvailabilityChange,
  locationFilter,
  onLocationChange,
  insuranceFilter,
  onInsuranceChange,
  hoursRangeFilter,
  onHoursRangeChange,
  locations,
  viewMode,
  onViewModeChange,
  onClearFilters,
  hasActiveFilters,
  activeFilterCount,
  showViewToggle = true,
}: MachineFiltersProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const FilterControls = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div
      className={
        inSheet ? "space-y-4" : "flex flex-wrap gap-3 w-full items-center pt-4"
      }
    >
      <div
        className={inSheet ? "" : "flex flex-col w-full sm:w-auto space-y-1.5"}
      >
        <Label className={inSheet ? "sr-only" : "w-fit"}>Estados</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger
            className={inSheet ? "w-full" : "w-full sm:w-40 bg-background"}
          >
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Operativa">Operativa</SelectItem>
            <SelectItem value="NO Operativa">No Operativa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className={inSheet ? "" : "flex flex-col w-full sm:w-auto space-y-1.5"}
      >
        <Label className={inSheet ? "sr-only" : "w-full"}>Disponibilidad</Label>
        <Select value={availabilityFilter} onValueChange={onAvailabilityChange}>
          <SelectTrigger
            className={inSheet ? "w-full" : "w-full sm:w-40 bg-background"}
          >
            <SelectValue placeholder="Disponibilidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="available">Disponibles</SelectItem>
            <SelectItem value="unavailable">No disponibles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className={inSheet ? "" : "flex flex-col w-full sm:w-auto space-y-1.5"}
      >
        <Label className={inSheet ? "sr-only" : "w-full"}>Ubicación</Label>
        <Select value={locationFilter} onValueChange={onLocationChange}>
          <SelectTrigger
            className={inSheet ? "w-full" : "w-full sm:w-40 bg-background"}
          >
            <SelectValue placeholder="Ubicación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={inSheet ? "" : "flex flex-col w-full sm:w-auto space-y-1.5"}
      >
        <Label className={inSheet ? "sr-only" : "w-full"}>Seguro</Label>
        <Select value={insuranceFilter} onValueChange={onInsuranceChange}>
          <SelectTrigger
            className={inSheet ? "w-full" : "w-full sm:w-40 bg-background"}
          >
            <SelectValue placeholder="Seguro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="insured">Aseguradas</SelectItem>
            <SelectItem value="not-insured">Sin seguro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className={inSheet ? "" : "flex flex-col w-full sm:w-auto space-y-1.5"}
      >
        <Label className={inSheet ? "sr-only" : "w-full"}>Horas de uso</Label>
        <Select value={hoursRangeFilter} onValueChange={onHoursRangeChange}>
          <SelectTrigger
            className={inSheet ? "w-full" : "w-full sm:w-[180px] bg-background"}
          >
            <SelectValue placeholder="Horas de uso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="0-1000">0 - 1,000 h</SelectItem>
            <SelectItem value="1000-5000">1,000 - 5,000 h</SelectItem>
            <SelectItem value="5000-10000">5,000 - 10,000 h</SelectItem>
            <SelectItem value="10000+">Más de 10,000 h</SelectItem>
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
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción, S/N o distribuidor..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background h-11 max-w-md"
          />
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden h-11 w-11 shrink-0 relative bg-transparent"
            >
              <SlidersHorizontal className="size-4" />
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 size-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="size-5" />
                Filtros avanzados
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterControls inSheet />
            </div>
          </SheetContent>
        </Sheet>

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

      <div className="hidden lg:block">
        <FilterControls />
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1.5 pr-1">
              Estado: {statusFilter}
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
          {availabilityFilter !== "all" && (
            <Badge variant="secondary" className="gap-1.5 pr-1">
              {availabilityFilter === "available"
                ? "Disponibles"
                : "No disponibles"}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 hover:bg-transparent"
                onClick={() => onAvailabilityChange("all")}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {locationFilter !== "all" && (
            <Badge variant="secondary" className="gap-1.5 pr-1">
              Ubicación: {locationFilter}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 hover:bg-transparent"
                onClick={() => onLocationChange("all")}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {insuranceFilter !== "all" && (
            <Badge variant="secondary" className="gap-1.5 pr-1">
              {insuranceFilter === "insured" ? "Aseguradas" : "Sin seguro"}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 hover:bg-transparent"
                onClick={() => onInsuranceChange("all")}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {hoursRangeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1.5 pr-1">
              Horas: {hoursRangeFilter}
              <Button
                variant="ghost"
                size="icon"
                className="size-4 hover:bg-transparent"
                onClick={() => onHoursRangeChange("all")}
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
