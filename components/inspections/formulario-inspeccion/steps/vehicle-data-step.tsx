"use client";

import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "@/lib/i18n/context";
import { InspectionFormSchema } from "@/schemas/inspections";
import { Vehicle } from "@/interfaces/inspection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, Gauge, CheckCircle2 } from "lucide-react";

interface VehicleDataStepProps {
  form: UseFormReturn<InspectionFormSchema>;
  vehicles: Vehicle[];
}

export function VehicleDataStep({ form, vehicles }: VehicleDataStepProps) {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedVehicleId = watch("vehicleId");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="space-y-5">
      {/* Vehicle Selector */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          {t("inspectionsPage.form.vehicle.selectVehicle")}
        </h4>
        <Select
          value={selectedVehicleId}
          onValueChange={(value) =>
            setValue("vehicleId", value, { shouldValidate: true })
          }
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue
              placeholder={t("inspectionsPage.form.vehicle.selectPlaceholder")}
            />
          </SelectTrigger>
          <SelectContent>
            {vehicles
              .filter((v) => v.status === "ACTIVE")
              .map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.model} — {vehicle.plate}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.vehicleId && (
          <p className="text-xs text-destructive">{errors.vehicleId.message}</p>
        )}
      </div>

      {/* Selected Vehicle Info Card */}
      {selectedVehicle && (
        <div className="rounded-lg border bg-muted/30 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
          {selectedVehicle.imageUrl ? (
            <div className="relative w-full overflow-hidden">
              <Image
                src={selectedVehicle.imageUrl}
                alt={selectedVehicle.model}
                height={100}
                width={300}
                className="object-cover object-center mx-auto"
                sizes="(max-width: 640px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400" />
                <span className="text-xs font-medium text-white">
                  {selectedVehicle.model}
                </span>
              </div>
            </div>
          ) : null}
          <div className="p-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground text-xs">
                {t("inspectionsPage.vehicles.modelo")}
              </span>
              <span className="font-medium text-xs">
                {selectedVehicle.model}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground text-xs">
                {t("inspectionsPage.vehicles.matricula")}
              </span>
              <span className="font-mono font-medium text-xs">
                {selectedVehicle.plate}
              </span>
            </div>
            {selectedVehicle.assignedInspector && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground text-xs">
                  {t("inspectionsPage.vehicles.assignedInspector")}
                </span>
                <span className="font-medium text-xs">
                  {selectedVehicle.assignedInspector.name ||
                    selectedVehicle.assignedInspector.email}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mileage */}
      <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
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
