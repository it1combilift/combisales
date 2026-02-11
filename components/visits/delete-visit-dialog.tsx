"use client";

import { Trash2 } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Visit, VisitStatus } from "@/interfaces/visits";

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

interface DeleteVisitDialogProps {
  visit: Visit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

/**
 * Dialog for confirming visit deletion.
 * Shows a cascade warning when the visit has an associated clone.
 */
export function DeleteVisitDialog({
  visit,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteVisitDialogProps) {
  const { t } = useI18n();

  if (!visit) return null;

  const hasClone = visit.clones && visit.clones.length > 0;
  const clone = hasClone ? visit.clones![0] : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-left">
            {hasClone
              ? t("dealerPage.admin.deleteCascadeTitle")
              : t("messages.confirmDelete")}
          </AlertDialogTitle>
          <AlertDialogDescription asChild className="text-left">
            <div className="space-y-4">
              {hasClone ? (
                <>
                  <p className="text-left text-pretty">
                    {t("dealerPage.admin.deleteCascadeDescription")}
                  </p>
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50 border">
                    {/* Original visit info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {t("dealerPage.seller.originalBadge")}
                        </Badge>
                        <span className="text-sm font-medium">
                          {visit.user?.name || visit.user?.email || "-"}
                        </span>
                      </div>
                      <Badge
                        variant={
                          visit.status === VisitStatus.COMPLETADA
                            ? "outline-success"
                            : "outline-warning"
                        }
                        className="text-xs"
                      >
                        {t(
                          `visits.visitStatuses.${visit.status.toLowerCase()}`,
                        )}
                      </Badge>
                    </div>
                    {/* Clone info */}
                    {clone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {t("dealerPage.seller.clonedBadge")}
                          </Badge>
                          <span className="text-sm font-medium">
                            {clone.user?.name || clone.user?.email || "-"}
                          </span>
                        </div>
                        <Badge
                          variant={
                            clone.status === VisitStatus.COMPLETADA
                              ? "outline-success"
                              : "outline-warning"
                          }
                          className="text-xs"
                        >
                          {t(
                            `visits.visitStatuses.${clone.status.toLowerCase()}`,
                          )}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-destructive font-medium text-sm text-left w-full">
                    {t("dealerPage.admin.deleteCascadeWarning")}
                  </p>
                </>
              ) : (
                <p>{t("messages.confirmDeleteDescription")}</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2 gap-2">
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner variant="bars" className="size-4" />
                <span className="animate-pulse">{t("common.deleting")}</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                {hasClone
                  ? t("dealerPage.admin.deleteAll")
                  : t("common.delete")}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
