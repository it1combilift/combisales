"use client";

import Image from "next/image";
import { Spinner } from "../ui/spinner";
import { cn, getInitials } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/interfaces/inspection";
import { Role, VehicleStatus } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, X, AlertTriangle, CarFront, Plus } from "lucide-react";

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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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
        setVehicles(
          (data as Vehicle[]).filter((v) => v.status === VehicleStatus.ACTIVE),
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

  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    const query = searchQuery.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.model.toLowerCase().includes(query) ||
        v.plate.toLowerCase().includes(query),
    );
  }, [vehicles, searchQuery]);

  const selectedVehicles = useMemo(
    () => vehicles.filter((v) => selectedVehicleIds.includes(v.id)),
    [vehicles, selectedVehicleIds],
  );

  const availableVehicles = useMemo(
    () => filteredVehicles.filter((v) => !selectedVehicleIds.includes(v.id)),
    [filteredVehicles, selectedVehicleIds],
  );

  const isAssignedToOther = useCallback(
    (vehicle: Vehicle) => {
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
    <div className={cn("w-full flex flex-col gap-3", className)}>
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Spinner variant="bars" size={12} />
          <span className="ml-2 text-sm text-muted-foreground animate-pulse">
            {t("users.form.vehicleAssignment.loading")}
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* SELLER limit warning */}
          {isSellOnly && selectedVehicleIds.length >= maxVehicles && (
            <Alert className="py-2 border-amber-200 dark:border-amber-800 bg-amber-500/10">
              <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-xs text-amber-600 dark:text-amber-400">
                {t("users.form.vehicleAssignment.sellerLimit")}
              </AlertDescription>
            </Alert>
          )}

          {/* ── Assigned Vehicles ── */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-primary/10">
              <span className="text-xs font-semibold">
                {t("users.form.vehicleAssignment.assigned")}
              </span>
              {selectedVehicles.length > 0 && (
                <Badge
                  variant="default"
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {selectedVehicles.length}
                </Badge>
              )}
            </div>

            <div className="p-2">
              {selectedVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 gap-1 text-muted-foreground">
                  <CarFront className="size-5 opacity-40" />
                  <p className="text-xs font-medium">
                    {t("users.form.vehicleAssignment.noAssigned")}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60">
                    {t("users.form.vehicleAssignment.selectBelow")}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                  {selectedVehicles.map((vehicle) => (
                    <VehicleRow
                      key={vehicle.id}
                      vehicle={vehicle}
                      trailing={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                          onClick={() => handleRemove(vehicle.id)}
                          title={t(
                            "users.form.vehicleAssignment.removeVehicle",
                          )}
                        >
                          <X className="size-3" />
                        </Button>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Available Vehicles ── */}
          <div className="rounded-lg border border-border/60 overflow-hidden flex flex-col">
            {/* Section header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
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

            {/* Search */}
            <div className="p-2 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t("users.form.vehicleAssignment.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Vehicle list */}
            <ScrollArea className="max-h-48">
              <div className="p-2 space-y-0.5">
                {availableVehicles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-1 text-muted-foreground">
                    {searchQuery.trim() ? (
                      <>
                        <Search className="size-4 opacity-40" />
                        <p className="text-xs">
                          {t("users.form.vehicleAssignment.noResults")}
                        </p>
                      </>
                    ) : (
                      <>
                        <CarFront className="size-4 opacity-40" />
                        <p className="text-xs">
                          {t("users.form.vehicleAssignment.noAvailable")}
                        </p>
                      </>
                    )}
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
                          "w-full rounded-md text-left transition-colors touch-manipulation",
                          disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-accent/60 cursor-pointer",
                        )}
                      >
                        <VehicleRow
                          vehicle={vehicle}
                          subLabel={
                            assignedOther && vehicle.assignedInspector
                              ? t("users.form.vehicleAssignment.assignedTo", {
                                  name:
                                    vehicle.assignedInspector.name ||
                                    vehicle.assignedInspector.email,
                                })
                              : undefined
                          }
                          subLabelVariant="warning"
                          trailing={
                            !disabled ? (
                              <Plus className="size-3.5 text-muted-foreground/50 shrink-0" />
                            ) : undefined
                          }
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared vehicle row — thumbnail + model + plate
   ───────────────────────────────────────────── */
function VehicleRow({
  vehicle,
  subLabel,
  subLabelVariant = "muted",
  trailing,
}: {
  vehicle: Vehicle;
  subLabel?: string;
  subLabelVariant?: "muted" | "warning";
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 px-2 rounded-md bg-background/60 border border-border/40">
      {/* Thumbnail */}
      <div className="relative size-10 shrink-0 rounded-md overflow-hidden bg-muted/60 flex items-center justify-center">
        {vehicle.imageUrl ? (
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.model} ${vehicle.plate}`}
            fill
            className="object-cover object-center"
            sizes="40px"
          />
        ) : (
          <span className="text-[11px] font-bold text-muted-foreground select-none">
            {getInitials(vehicle.model)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold text-foreground leading-tight truncate"
          title={vehicle.model}
        >
          {vehicle.model}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {vehicle.plate}
          </span>
          {vehicle.year && (
            <>
              <span className="text-border/60 select-none text-[10px]">·</span>
              <span className="text-[10px] text-muted-foreground">
                {vehicle.year}
              </span>
            </>
          )}
          {subLabel && (
            <>
              <span className="text-border/60 select-none text-[10px]">·</span>
              <span
                className={cn(
                  "text-[10px]",
                  subLabelVariant === "warning"
                    ? "text-amber-500"
                    : "text-muted-foreground",
                )}
              >
                {subLabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Trailing action */}
      {trailing}
    </div>
  );
}
