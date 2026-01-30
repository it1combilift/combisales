"use client";

import { useI18n } from "@/lib/i18n/context";

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

interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog for unsaved changes.
 * Shows when user attempts to close a form with unsaved data.
 */
export function UnsavedChangesDialog({
  open,
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  const { t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="w-full sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm md:text-base text-left">
            {t("common.unsavedChanges.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-pretty text-left">
            {t("common.unsavedChanges.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 md:gap-x-4 flex-wrap flex-row justify-center">
          <AlertDialogCancel onClick={onCancel} className="text-sm w-fit">
            {t("common.unsavedChanges.continue")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="text-sm w-fit">
            {t("common.unsavedChanges.discard")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
