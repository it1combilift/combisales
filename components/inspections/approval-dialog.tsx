"use client";

import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n/context";
import { Inspection } from "@/interfaces/inspection";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import {
  approveInspectionSchema,
  ApproveInspectionSchema,
} from "@/schemas/inspections";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ApprovalDialogProps {
  inspection: Inspection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApprovalDialog({
  inspection,
  open,
  onOpenChange,
  onSuccess,
}: ApprovalDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const schema = approveInspectionSchema(t);

  const form = useForm<ApproveInspectionSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      approved: true,
      comments: "",
    },
  });

  const handleAction = async (approved: boolean) => {
    setAction(approved ? "approve" : "reject");
    form.setValue("approved", approved);

    if (approved) {
      // Approve without needing comments
      await submitApproval(approved, form.getValues("comments") || "");
    }
  };

  const handleRejectSubmit = async () => {
    const isValid = await form.trigger("comments");
    if (!isValid) return;

    await submitApproval(false, form.getValues("comments") || "");
  };

  const submitApproval = async (approved: boolean, comments: string) => {
    if (!inspection) return;

    setIsSubmitting(true);
    try {
      await axios.post(`/api/inspections/${inspection.id}/approve`, {
        approved,
        comments,
      });
      onOpenChange(false);
      onSuccess();
      form.reset();
      setAction(null);
    } catch (error) {
      console.error("Failed to approve/reject inspection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setAction(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] md:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left text-sm text-balance md:text-base">
            {t("inspectionsPage.approval.title")}
          </DialogTitle>
          <DialogDescription className="text-left text-pretty text-xs md:text-sm">
            {inspection && (
              <span>
                {inspection.vehicle.model} — {inspection.vehicle.plate}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {action === "reject" ? (
            <div className="space-y-3">
              <Label htmlFor="comments" className="text-xs md:text-sm">
                {t("inspectionsPage.approval.commentsLabel")}
              </Label>
              <Textarea
                id="comments"
                placeholder={t("inspectionsPage.approval.commentsPlaceholder")}
                {...form.register("comments")}
                className="text-xs md:text-sm text-pretty h-40 overflow-y-auto"
              />
              {form.formState.errors.comments && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.comments.message}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAction(null)}
                  disabled={isSubmitting}
                >
                  {t("common.back")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRejectSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  {t("inspectionsPage.approval.confirmReject")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleAction(true)}
                disabled={isSubmitting}
              >
                {isSubmitting && action === "approve" ? (
                  <Loader2 className="size-4 animate-spin mr-1" />
                ) : (
                  <CheckCircle className="size-4 mr-1 text-emerald-600" />
                )}
                {t("inspectionsPage.approval.approve")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setAction("reject")}
                disabled={isSubmitting}
              >
                <XCircle className="size-4 text-red-600 mr-1" />
                {t("inspectionsPage.approval.reject")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
