"use client";

import axios from "axios";
import { EmptyCard } from "../empty-card";
import { useState, useEffect } from "react";
import { Vehicle } from "@/interfaces/inspection";
import { useTranslation } from "@/lib/i18n/context";
import { Loader2, ClipboardCheck } from "lucide-react";
import { InspectionForm } from "./formulario-inspeccion";
import { InspectionFormSchema } from "@/schemas/inspections";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface InspectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedVehicleId?: string;
}

export function InspectionFormDialog({
  open,
  onOpenChange,
  onSuccess,
  preSelectedVehicleId,
}: InspectionFormDialogProps) {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchVehicles();
    }
  }, [open]);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const response = await axios.get("/api/vehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleSubmit = async (data: InspectionFormSchema) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/inspections", data);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create inspection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-[95vw] md:max-h-dvh p-0 flex flex-col overflow-hidden gap-0">
        {loadingVehicles ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyCard
            icon={<ClipboardCheck className="size-4" />}
            title={t("inspectionsPage.form.noVehiclesTitle")}
            description={t("inspectionsPage.form.noVehicles")}
          />
        ) : (
          <InspectionForm
            vehicles={vehicles}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onClose={() => onOpenChange(false)}
            preSelectedVehicleId={preSelectedVehicleId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
