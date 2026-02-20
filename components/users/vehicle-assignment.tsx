"use client";

import { cn, getInitials } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Role, VehicleStatus } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, X, Check, AlertTriangle, CarFront } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface VehicleItem {
  id: string;
  model: string;
  plate: string;
  status: VehicleStatus;
  imageUrl: string | null;
  assignedInspectorId: string | null;
  assignedInspector?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface VehicleAssignmentProps {
  /** IDs of currently selected vehicles */
  selectedVehicleIds: string[];
  /** Callback when vehicle selection changes */
  onSelectionChange: (ids: string[]) => void;
  /** The ID of the user being edited (to not grey-out their own vehicles) */
  editingUserId?: string | null;
  /** Selected roles of the user being created/edited */
  userRoles?: Role[];
  className?: string;
}

/**
 * Vehicle assignment component for INSPECTOR/SELLER users.
 * SELLER (without INSPECTOR) can have max 1 vehicle.
 */
export function VehicleAssignment({
  selectedVehicleIds,
  onSelectionChange,
  editingUserId,
  userRoles = [],
  className,
}: VehicleAssignmentProps) {
  const { t } = useI18n();
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // SELLER-only (no INSPECTOR) can only have 1 vehicle
  const isSellOnly =
    userRoles.includes(Role.SELLER) && !userRoles.includes(Role.INSPECTOR);
  const maxVehicles = isSellOnly ? 1 : Infinity;

  // Fetch vehicles (admin context — returns all)
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/vehicles");
        if (!response.ok) throw new Error("Failed to fetch vehicles");
        const data = await response.json();
        // Only show ACTIVE vehicles
        setVehicles(
          (data as VehicleItem[]).filter(
            (v) => v.status === VehicleStatus.ACTIVE,
          ),
        );
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError(t("users.form.vehicleAssignment.errorLoading"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, [t]);

  // Filtered vehicles based on search
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    const query = searchQuery.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.model.toLowerCase().includes(query) ||
        v.plate.toLowerCase().includes(query),
    );
  }, [vehicles, searchQuery]);

  // Selected vehicle objects
  const selectedVehicles = useMemo(
    () => vehicles.filter((v) => selectedVehicleIds.includes(v.id)),
    [vehicles, selectedVehicleIds],
  );

  // Available vehicles: not selected + either unassigned or assigned to the editing user
  const availableVehicles = useMemo(
    () => filteredVehicles.filter((v) => !selectedVehicleIds.includes(v.id)),
    [filteredVehicles, selectedVehicleIds],
  );

  const isAssignedToOther = useCallback(
    (vehicle: VehicleItem) => {
      if (!vehicle.assignedInspectorId) return false;
      if (editingUserId && vehicle.assignedInspectorId === editingUserId)
        return false;
      return !selectedVehicleIds.includes(vehicle.id);
    },
    [editingUserId, selectedVehicleIds],
  );

  const handleSelect = useCallback(
    (vehicleId: string) => {
      if (selectedVehicleIds.length >= maxVehicles) return;
      onSelectionChange([...selectedVehicleIds, vehicleId]);
    },
    [selectedVehicleIds, maxVehicles, onSelectionChange],
  );

  const handleRemove = useCallback(
    (vehicleId: string) => {
      onSelectionChange(selectedVehicleIds.filter((id) => id !== vehicleId));
    },
    [selectedVehicleIds, onSelectionChange],
  );

  return (
    <div className={cn("w-full flex flex-col", className)}>
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Spinner variant="bars" size={12} />
          <span className="ml-2 text-sm text-muted-foreground animate-pulse">
            {t("users.form.vehicleAssignment.loading")}
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="py-2 mb-3">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="flex flex-col gap-3 max-h-[calc(100vh-400px)] sm:max-h-[350px] overflow-hidden">
          {/* SELLER limit warning */}
          {isSellOnly && selectedVehicleIds.length >= maxVehicles && (
            <Alert className="py-2 border-amber-200 dark:border-amber-800 bg-amber-500/10">
              <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-xs text-amber-600 dark:text-amber-400">
                {t("users.form.vehicleAssignment.sellerLimit")}
              </AlertDescription>
            </Alert>
          )}

          {/* Selected Vehicles Section */}
          <div className="border rounded-lg bg-primary/5 border-primary/20 overflow-hidden">
            <div className="flex items-center justify-between w-full px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">
                  {t("users.form.vehicleAssignment.assigned")}
                </span>
              </div>
              {selectedVehicles.length > 0 && (
                <Badge
                  variant="default"
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {selectedVehicles.length}
                </Badge>
              )}
            </div>

            <div className="px-2 pb-2">
              {selectedVehicles.length === 0 ? (
                <div className="text-center text-muted-foreground py-3 px-2">
                  <CarFront className="size-4 mx-auto mb-1 opacity-50" />
                  <p className="text-sm">
                    {t("users.form.vehicleAssignment.noAssigned")}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {t("users.form.vehicleAssignment.selectBelow")}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-background border"
                    >
                      <div className="flex items-center justify-center shrink-0 overflow-hidden">
                        <Avatar className="rounded-none size-16">
                          {vehicle.imageUrl ? (
                            <AvatarImage
                              src={vehicle.imageUrl}
                              alt={`${vehicle.model} ${vehicle.plate}`}
                              className="object-contain object-center"
                            />
                          ) : (
                            <AvatarFallback className="bg-muted/50 text-muted-foreground text-sm font-medium">
                              {getInitials(vehicle.model)}
                            </AvatarFallback>
                          )}{" "}
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate leading-tight">
                          {vehicle.model}
                        </p>
                        <p className="text-sm text-muted-foreground truncate leading-tight">
                          {vehicle.plate}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                        onClick={() => handleRemove(vehicle.id)}
                        title={t("users.form.vehicleAssignment.removeVehicle")}
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Vehicles Section */}
          <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between w-full px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">
                  {t("users.form.vehicleAssignment.available")}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 tabular-nums"
                >
                  {availableVehicles.length}
                </Badge>
              </div>
            </div>

            {/* Search */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder={t("users.form.vehicleAssignment.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            {/* Vehicle list */}
            <ScrollArea className="flex-1 min-h-0 max-h-40">
              <div className="p-1.5 space-y-0.5">
                {availableVehicles.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">
                      {searchQuery.trim()
                        ? t("users.form.vehicleAssignment.noResults")
                        : t("users.form.vehicleAssignment.noAvailable")}
                    </p>
                  </div>
                ) : (
                  availableVehicles.map((vehicle) => {
                    const assignedOther = isAssignedToOther(vehicle);
                    const atLimit = selectedVehicleIds.length >= maxVehicles;
                    const disabled = assignedOther || atLimit;

                    return (
                      <button
                        key={vehicle.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleSelect(vehicle.id)}
                        className={cn(
                          "w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-left transition-colors touch-manipulation",
                          disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-accent/50 cursor-pointer",
                        )}
                      >
                        <div className="flex items-center justify-center shrink-0 overflow-hidden">
                          <Avatar className="rounded-none size-16">
                            {vehicle.imageUrl ? (
                              <AvatarImage
                                src={vehicle.imageUrl}
                                alt={`${vehicle.model} ${vehicle.plate}`}
                                className="object-contain object-center"
                              />
                            ) : (
                              <AvatarFallback className="bg-muted/50 text-muted-foreground text-sm font-medium">
                                {getInitials(vehicle.model)}
                              </AvatarFallback>
                            )}{" "}
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate leading-tight">
                            {vehicle.model}
                          </p>
                          <p className="text-xs text-muted-foreground truncate leading-tight">
                            {vehicle.plate}
                            {assignedOther && vehicle.assignedInspector && (
                              <span className="ml-1 text-amber-500">
                                {" "}
                                &middot;{" "}
                                {t("users.form.vehicleAssignment.assignedTo", {
                                  name:
                                    vehicle.assignedInspector.name ||
                                    vehicle.assignedInspector.email,
                                })}
                              </span>
                            )}
                          </p>
                        </div>
                        {!disabled && (
                          <Check className="size-3.5 text-muted-foreground/40 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
