"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "@/lib/i18n/context";
import { InspectionFormSchema } from "@/schemas/inspections";
import { Vehicle, VehicleStatus } from "@/interfaces/inspection";

import { Gauge, CheckCircle2, Car, Search, User } from "lucide-react";

interface VehicleDataStepProps {
  form: UseFormReturn<InspectionFormSchema>;
  vehicles: Vehicle[];
  preSelectedVehicleId?: string;
}

export function VehicleDataStep({
  form,
  vehicles,
  preSelectedVehicleId,
}: VehicleDataStepProps) {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter active vehicles and by search
  const activeVehicles = vehicles.filter(
    (v) => v.status === VehicleStatus.ACTIVE,
  );
  const filteredVehicles = activeVehicles.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.model.toLowerCase().includes(q) ||
      v.plate.toLowerCase().includes(q) ||
      (v.assignedInspector?.name || "").toLowerCase().includes(q)
    );
  });

  const handleSelectVehicle = (vehicleId: string) => {
    setValue("vehicleId", vehicleId, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      {/* Header + Search */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          {t("inspectionsPage.form.vehicle.selectVehicle")}
        </h4>

        {activeVehicles.length > 4 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder={t("inspectionsPage.form.vehicle.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        )}

        {errors.vehicleId && (
          <p className="text-xs text-destructive">{errors.vehicleId.message}</p>
        )}
      </div>

      {/* Compact Selected Vehicle Card — shown above list when selected */}
      {/* {selectedVehicle && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5 animate-in fade-in-50 duration-200">
          <div className="size-12 shrink-0 rounded-lg overflow-hidden bg-secondary/40">
            {selectedVehicle.imageUrl ? (
              <Image
                src={selectedVehicle.imageUrl}
                alt={selectedVehicle.model}
                width={48}
                height={48}
                className="size-12 object-cover object-center"
              />
            ) : (
              <div className="size-12 flex items-center justify-center">
                <Car className="size-5 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate leading-tight">
              {selectedVehicle.model}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[11px] text-muted-foreground">
                {selectedVehicle.plate}
              </span>
              {selectedVehicle.assignedInspector && (
                <>
                  <span className="text-border">·</span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {selectedVehicle.assignedInspector.name ||
                      selectedVehicle.assignedInspector.email}
                  </span>
                </>
              )}
            </div>
          </div>
          <CheckCircle2 className="size-5 text-primary shrink-0" />
        </div>
      )} */}

      {/* Vehicle List — compact vertical rows, no inner scroll */}
      <div className="space-y-1">
        {filteredVehicles.map((vehicle) => {
          const isSelected = selectedVehicleId === vehicle.id;
          return (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => handleSelectVehicle(vehicle.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all duration-150",
                isSelected
                  ? "border-primary/30 bg-primary/5 shadow-sm"
                  : "border-border/50 bg-card hover:bg-accent/50 hover:border-border",
              )}
            >
              {/* Thumbnail */}
              <div className="shrink-0 overflow-hidden bg-secondary/40 size-12">
                {vehicle.imageUrl ? (
                  <Image
                    src={vehicle.imageUrl}
                    alt={`${vehicle.model} - ${vehicle.plate}`}
                    width={40}
                    height={40}
                    className="object-cover object-center h-full w-full rounded-xs"
                  />
                ) : (
                  <div className="size-10 flex items-center justify-center">
                    <Car className="size-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate leading-tight">
                  {vehicle.model}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {vehicle.plate}
                  </span>
                  {vehicle.assignedInspector ? (
                    <>
                      <span className="text-border">·</span>
                      <span className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <User className="size-2.5 shrink-0" />
                        {vehicle.assignedInspector.name ||
                          vehicle.assignedInspector.email}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-border">·</span>
                      <span className="text-[11px] text-muted-foreground/50 italic">
                        {t("inspectionsPage.vehicleCard.noInspector")}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}

        {filteredVehicles.length === 0 && (
          <div className="text-center py-8">
            <Car className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? t("inspectionsPage.form.vehicle.noVehiclesMatch")
                : t("inspectionsPage.form.noVehicles")}
            </p>
          </div>
        )}
      </div>

      {/* Mileage */}
      <div className="space-y-2.5 rounded-lg border p-3 bg-muted/30">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Gauge className="size-3" />
          {t("inspectionsPage.form.vehicle.mileage")}
        </h4>
        <Input
          id="mileage"
          type="number"
          min={0}
          placeholder={t("inspectionsPage.form.vehicle.mileagePlaceholder")}
          {...register("mileage", { valueAsNumber: true })}
          className="h-9"
        />
        {errors.mileage && (
          <p className="text-xs text-destructive">{errors.mileage.message}</p>
        )}
      </div>
    </div>
  );
}
