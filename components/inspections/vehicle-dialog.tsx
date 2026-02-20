"use client";

import axios from "axios";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { useState, useEffect, useRef } from "react";
import { InspectorDialog } from "./inspector-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { hasRole } from "@/lib/roles";
import { Loader2, ImagePlus, X } from "lucide-react";
import { VehicleStatus } from "@/interfaces/inspection";

import {
  createVehicleSchema,
  CreateVehicleSchema,
} from "@/schemas/inspections";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Assignee {
  id: string;
  name: string | null;
  email: string;
  roles: Role[];
  _count?: {
    assignedVehicles: number;
  };
}

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editVehicle?: {
    id: string;
    model: string;
    plate: string;
    status?: string;
    assignedInspectorId: string | null;
    imageUrl?: string | null;
    imageCloudinaryId?: string | null;
  } | null;
}

export function VehicleDialog({
  open,
  onOpenChange,
  onSuccess,
  editVehicle,
}: VehicleDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);
  const [inspectorDialogOpen, setInspectorDialogOpen] = useState(false);

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCloudinaryId, setImageCloudinaryId] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editVehicle;

  const schema = createVehicleSchema(t);

  const form = useForm<CreateVehicleSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      model: editVehicle?.model || "",
      plate: editVehicle?.plate || "",
      status: (editVehicle?.status as VehicleStatus) || "ACTIVE",
      assignedInspectorId: editVehicle?.assignedInspectorId || undefined,
      imageUrl: editVehicle?.imageUrl || "",
      imageCloudinaryId: editVehicle?.imageCloudinaryId || "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchAssignees();
      if (editVehicle) {
        form.reset({
          model: editVehicle.model,
          plate: editVehicle.plate,
          status: (editVehicle.status as VehicleStatus) || "ACTIVE",
          assignedInspectorId: editVehicle.assignedInspectorId || undefined,
          imageUrl: editVehicle.imageUrl || "",
          imageCloudinaryId: editVehicle.imageCloudinaryId || "",
        });
        setImagePreview(editVehicle.imageUrl || null);
        setImageCloudinaryId(editVehicle.imageCloudinaryId || null);
      } else {
        form.reset({
          model: "",
          plate: "",
          status: "ACTIVE",
          assignedInspectorId: undefined,
          imageUrl: "",
          imageCloudinaryId: "",
        });
        setImagePreview(null);
        setImageCloudinaryId(null);
      }
    }
  }, [open, editVehicle]);

  const fetchAssignees = async () => {
    setLoadingAssignees(true);
    try {
      const response = await axios.get("/api/users?roles=INSPECTOR,SELLER");
      setAssignees(response.data || []);
    } catch (error) {
      console.error("Failed to fetch assignees:", error);
      setAssignees([]);
    } finally {
      setLoadingAssignees(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "combisales/vehicles");

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = res.data?.files?.[0];
      if (uploaded) {
        setImagePreview(uploaded.cloudinaryUrl);
        setImageCloudinaryId(uploaded.cloudinaryId);
        form.setValue("imageUrl", uploaded.cloudinaryUrl);
        form.setValue("imageCloudinaryId", uploaded.cloudinaryId);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageCloudinaryId(null);
    form.setValue("imageUrl", "");
    form.setValue("imageCloudinaryId", "");
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditing && editVehicle) {
        await axios.put(`/api/vehicles/${editVehicle.id}`, data);
      } else {
        await axios.post("/api/vehicles", data);
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.error;
      if (msg) {
        form.setError("plate", { message: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing
                ? t("inspectionsPage.vehicles.editVehicle")
                : t("inspectionsPage.vehicles.addVehicle")}
            </DialogTitle>
            <DialogDescription className="text-pretty text-left">
              {t("inspectionsPage.vehicles.dialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vehicle Information Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                {t("inspectionsPage.vehicles.vehicleInfo")}
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="model" className="text-xs">
                    {t("inspectionsPage.vehicles.modelo")}
                  </Label>
                  <Input
                    id="model"
                    placeholder={t("inspectionsPage.vehicles.modelPlaceholder")}
                    {...form.register("model")}
                    className="h-9"
                  />
                  {form.formState.errors.model && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.model.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="plate" className="text-xs">
                    {t("inspectionsPage.vehicles.matricula")}
                  </Label>
                  <Input
                    id="plate"
                    placeholder={t("inspectionsPage.vehicles.platePlaceholder")}
                    {...form.register("plate")}
                    className="uppercase h-9"
                  />
                  {form.formState.errors.plate && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.plate.message}
                    </p>
                  )}
                </div>

                {/* Vehicle Status */}
                {isEditing && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      {t("inspectionsPage.vehicles.status")}
                    </Label>
                    <Select
                      value={form.watch("status") || "ACTIVE"}
                      onValueChange={(value) =>
                        form.setValue("status", value as VehicleStatus)
                      }
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">
                          {t("inspectionsPage.vehicles.active")}
                        </SelectItem>
                        <SelectItem value="INACTIVE">
                          {t("inspectionsPage.vehicles.inactive")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Image Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ImagePlus className="size-3" />
                {t("inspectionsPage.vehicles.vehicleImage") || "Vehicle Image"}
              </h4>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {imagePreview ? (
                <div className="relative group rounded-lg overflow-hidden border">
                  <Image
                    src={imagePreview}
                    alt="Vehicle"
                    width={200}
                    height={200}
                    className="w-full object-cover object-center"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 text-muted-foreground hover:border-muted-foreground/40 hover:bg-muted/30 transition-colors"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="size-6 animate-spin" />
                      <span className="text-xs">
                        {t("common.loading") || "Uploading..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="size-6" />
                      <span className="text-xs">
                        {t("inspectionsPage.vehicles.uploadImage") ||
                          "Click to upload image"}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Person Assignment Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                {t("inspectionsPage.vehicles.assignedPerson") ||
                  t("inspectionsPage.vehicles.assignedInspector")}
              </h4>

              <div className="space-y-2">
                <Select
                  value={form.watch("assignedInspectorId") || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      form.setValue("assignedInspectorId", undefined);
                      return;
                    }
                    // Check SELLER 1-vehicle limit on client side
                    const selected = assignees.find((a) => a.id === value);
                    if (selected) {
                      const isSELLEROnly =
                        hasRole(selected.roles, Role.SELLER) &&
                        !hasRole(selected.roles, Role.INSPECTOR);
                      const alreadyHasVehicle =
                        (selected._count?.assignedVehicles ?? 0) > 0;
                      const isCurrentAssignee =
                        editVehicle?.assignedInspectorId === value;
                      if (
                        isSELLEROnly &&
                        alreadyHasVehicle &&
                        !isCurrentAssignee
                      ) {
                        form.setError("assignedInspectorId", {
                          message:
                            t("inspectionsPage.vehicles.sellerLimitError") ||
                            "This Seller already has a vehicle assigned",
                        });
                        return;
                      }
                    }
                    form.clearErrors("assignedInspectorId");
                    form.setValue("assignedInspectorId", value);
                  }}
                  disabled={loadingAssignees}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue
                      placeholder={
                        loadingAssignees
                          ? t("common.loading")
                          : t("inspectionsPage.vehicles.selectAssignee") ||
                            t("inspectionsPage.vehicles.selectInspector")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("inspectionsPage.vehicles.noAssignee") ||
                        t("inspectionsPage.vehicles.noInspector")}
                    </SelectItem>
                    {assignees.map((assignee) => {
                      const isInspectorRole = hasRole(
                        assignee.roles,
                        Role.INSPECTOR,
                      );
                      const isSellerRole = hasRole(assignee.roles, Role.SELLER);
                      const isSELLEROnly = isSellerRole && !isInspectorRole;
                      const alreadyHasVehicle =
                        (assignee._count?.assignedVehicles ?? 0) > 0;
                      const isCurrentAssignee =
                        editVehicle?.assignedInspectorId === assignee.id;
                      const isDisabled =
                        isSELLEROnly && alreadyHasVehicle && !isCurrentAssignee;

                      return (
                        <SelectItem
                          key={assignee.id}
                          value={assignee.id}
                          disabled={isDisabled}
                        >
                          <span className="flex items-center gap-2">
                            <span>{assignee.name || assignee.email}</span>
                            {isInspectorRole && isSellerRole ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium">
                                {t(
                                  "inspectionsPage.vehicles.roleInspectorSeller",
                                ) || "Insp + Seller"}
                              </span>
                            ) : isInspectorRole ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                                {t("inspectionsPage.vehicles.roleInspector") ||
                                  "Inspector"}
                              </span>
                            ) : isSellerRole ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                                {t("inspectionsPage.vehicles.roleSeller") ||
                                  "P. Manager"}
                              </span>
                            ) : null}
                            {isDisabled && (
                              <span className="text-[10px] text-muted-foreground">
                                (
                                {t(
                                  "inspectionsPage.vehicles.vehicleAssigned",
                                ) || "vehicle assigned"}
                                )
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {form.formState.errors.assignedInspectorId && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.assignedInspectorId.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing
                  ? t("inspectionsPage.vehicles.saveChanges")
                  : t("inspectionsPage.vehicles.addVehicle")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inline Inspector Creation Dialog */}
      <InspectorDialog
        open={inspectorDialogOpen}
        onOpenChange={setInspectorDialogOpen}
        onSuccess={() => fetchAssignees()}
      />
    </>
  );
}
