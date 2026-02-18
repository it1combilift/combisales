"use client";

import axios from "axios";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Inspection } from "@/interfaces/inspection";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

interface DeleteInspectionDialogProps {
  inspection: Inspection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteInspectionDialog({
  inspection,
  open,
  onOpenChange,
  onSuccess,
}: DeleteInspectionDialogProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!inspection) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/api/inspections/${inspection.id}`);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to delete inspection:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm text-left">
            {t("inspectionsPage.delete.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-pretty text-sm">
            {t("inspectionsPage.delete.description")}
            {inspection && (
              <div className="block mt-2">
                {inspection.vehicle.imageUrl && (
                  <Image
                    src={inspection.vehicle.imageUrl}
                    alt={inspection.vehicle.model}
                    className="w-full h-40 object-contain object-center rounded mb-2"
                    width={400}
                    height={100}
                  />
                )}
                <span className="block font-medium text-muted-foreground text-center text-sm mt-1 truncate ">
                  {inspection.vehicle.model} — {inspection.vehicle.plate}
                </span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2">
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
