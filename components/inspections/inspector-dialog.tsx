"use client";

import { z } from "zod";
import axios from "axios";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getAllRoles, hasRole } from "@/lib/roles";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Role, VehicleStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, getInitials, getRoleBadge } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Loader2,
  Eye,
  EyeOff,
  ImagePlus,
  X,
  Car,
  Search,
  Users,
  UserPlus,
  Lock,
  CarFront,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SimpleVehicle {
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

export interface EditInspectorData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  assignedVehicles?: {
    id: string;
    model: string;
    plate: string;
    status: string;
    imageUrl?: string | null;
  }[];
  _count?: {
    inspections: number;
    assignedVehicles: number;
  };
}

interface InspectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editInspector?: EditInspectorData | null;
}

/* Schema for CREATE mode — password required */
const getCreateSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(2, t("inspectionsPage.inspectors.validation.nameRequired")),
    email: z
      .string()
      .email(t("inspectionsPage.inspectors.validation.emailInvalid")),
    password: z
      .string()
      .min(8, t("inspectionsPage.inspectors.validation.passwordMin")),
  });

/* Schema for EDIT mode — password optional */
const getEditSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(2, t("inspectionsPage.inspectors.validation.nameRequired")),
    email: z
      .string()
      .email(t("inspectionsPage.inspectors.validation.emailInvalid")),
    password: z
      .string()
      .min(8, t("inspectionsPage.inspectors.validation.passwordMin"))
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? undefined : val)),
  });

type InspectorFormValues = {
  name: string;
  email: string;
  password?: string;
};

export function InspectorDialog({
  open,
  onOpenChange,
  onSuccess,
  editInspector,
}: InspectorDialogProps) {
  const { t } = useTranslation();
  const isEditing = !!editInspector;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Mode — "create" = create new user, "select" = pick existing user (only for non-edit)
  const [mode, setMode] = useState<"create" | "select">("create");

  // Select-existing-user state
  const [existingUsers, setExistingUsers] = useState<EditInspectorData[]>([]);
  const [loadingExistingUsers, setLoadingExistingUsers] = useState(false);
  const [existingUserSearch, setExistingUserSearch] = useState("");
  const [selectedExistingUserId, setSelectedExistingUserId] = useState<
    string | null
  >(null);

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCloudinaryId, setImageCloudinaryId] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vehicle assignment state
  const [vehicles, setVehicles] = useState<SimpleVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [initialVehicleIds, setInitialVehicleIds] = useState<string[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");

  const schema = isEditing ? getEditSchema(t) : getCreateSchema(t);

  const form = useForm<InspectorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      setVehicleSearch("");
      setShowPassword(false);
      fetchVehicles();

      if (editInspector) {
        // Populate form with existing inspector data
        setMode("create"); // edit mode always uses "create" form layout
        form.reset({
          name: editInspector.name || "",
          email: editInspector.email,
          password: "",
        });
        setImagePreview(editInspector.image || null);
        setImageCloudinaryId(null);
        setIsActive(editInspector.isActive);
        const assignedIds =
          editInspector.assignedVehicles?.map((v) => v.id) || [];
        setSelectedVehicleIds(assignedIds);
        setInitialVehicleIds(assignedIds);
        setSelectedExistingUserId(null);
        setExistingUserSearch("");
      } else {
        // Reset form for create mode
        form.reset({ name: "", email: "", password: "" });
        setImagePreview(null);
        setImageCloudinaryId(null);
        setIsActive(true);
        setSelectedVehicleIds([]);
        setInitialVehicleIds([]);
        setMode("create");
        setSelectedExistingUserId(null);
        setExistingUserSearch("");
        fetchExistingUsers();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editInspector]);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const response = await axios.get("/api/vehicles");
      setVehicles(response.data || []);
    } catch {
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchExistingUsers = async () => {
    setLoadingExistingUsers(true);
    try {
      const response = await axios.get(`/api/users?roles=INSPECTOR,SELLER`);
      setExistingUsers(response.data || []);
    } catch {
      setExistingUsers([]);
    } finally {
      setLoadingExistingUsers(false);
    }
  };

  const filteredExistingUsers = existingUsers.filter((u) => {
    if (!existingUserSearch) return true;
    const q = existingUserSearch.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const selectedExistingUser = existingUsers.find(
    (u) => u.id === selectedExistingUserId,
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "combisales/inspectors");

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploaded = res.data?.files?.[0];
      if (uploaded) {
        setImagePreview(uploaded.cloudinaryUrl);
        setImageCloudinaryId(uploaded.cloudinaryId);
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
  };

  // Determine if the current target user has SELLER role
  const selectedExistingUserIsSeller = (() => {
    if (mode === "select" && selectedExistingUserId) {
      const user = existingUsers.find((u) => u.id === selectedExistingUserId);
      return user ? hasRole(user.roles as Role[], Role.SELLER) : false;
    }
    return false;
  })();

  const editingUserIsSeller = (() => {
    if (isEditing && editInspector) {
      return hasRole(editInspector.roles as Role[], Role.SELLER);
    }
    return false;
  })();

  const currentUserIsSeller =
    mode === "select" ? selectedExistingUserIsSeller : editingUserIsSeller;

  // SELLER users who already have a vehicle assigned (from DB) cannot change
  // vehicle assignments from the SELECT EXISTING flow — they must use the edit flow.
  const sellerAlreadyHasVehicle =
    selectedExistingUserIsSeller && initialVehicleIds.length > 0;

  const toggleVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    // Prevent toggling inactive vehicles
    if (vehicle?.status === "INACTIVE") return;
    // Prevent toggling vehicles assigned to other users
    const currentUserId =
      mode === "select" ? selectedExistingUserId : editInspector?.id;
    if (
      vehicle?.assignedInspectorId &&
      vehicle.assignedInspectorId !== currentUserId &&
      !selectedVehicleIds.includes(vehicleId)
    ) {
      return;
    }

    setSelectedVehicleIds((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      }
      // SELLER role: max 1 vehicle — replace instead of adding
      if (currentUserIsSeller) {
        return [vehicleId];
      }
      return [...prev, vehicleId];
    });
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!vehicleSearch) return true;
    const q = vehicleSearch.toLowerCase();
    return (
      v.model.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q)
    );
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditing && editInspector) {
        // ── EDIT MODE ──
        const updatePayload: Record<string, unknown> = {
          name: data.name,
          email: data.email,
          isActive,
          roles: [Role.INSPECTOR],
          image: imagePreview || null,
        };
        if (data.password) {
          updatePayload.password = data.password;
        }

        await axios.patch(`/api/users/${editInspector.id}`, updatePayload);

        // Handle vehicle reassignment
        const toUnassign = initialVehicleIds.filter(
          (id) => !selectedVehicleIds.includes(id),
        );
        const toAssign = selectedVehicleIds.filter(
          (id) => !initialVehicleIds.includes(id),
        );

        const vehicleOps = [
          ...toUnassign.map((vehicleId) =>
            axios
              .put(`/api/vehicles/${vehicleId}`, {
                assignedInspectorId: null,
                force: true,
              })
              .catch((err) =>
                console.error(`Failed to unassign vehicle ${vehicleId}:`, err),
              ),
          ),
          ...toAssign.map((vehicleId) =>
            axios
              .put(`/api/vehicles/${vehicleId}`, {
                assignedInspectorId: editInspector.id,
                force: true,
              })
              .catch((err) =>
                console.error(`Failed to assign vehicle ${vehicleId}:`, err),
              ),
          ),
        ];

        if (vehicleOps.length > 0) {
          await Promise.all(vehicleOps);
        }
      } else {
        // ── CREATE MODE ──
        const createRes = await axios.post("/api/users/create", {
          ...data,
          confirmPassword: data.password,
          roles: [Role.INSPECTOR],
          isActive: true,
          image: imagePreview || undefined,
        });

        const newUserId = createRes.data?.user?.id || createRes.data?.id;

        if (newUserId && selectedVehicleIds.length > 0) {
          await Promise.all(
            selectedVehicleIds.map((vehicleId) =>
              axios
                .put(`/api/vehicles/${vehicleId}`, {
                  assignedInspectorId: newUserId,
                  force: true,
                })
                .catch((err) =>
                  console.error(`Failed to assign vehicle ${vehicleId}:`, err),
                ),
            ),
          );
        }
      }

      form.reset();
      setImagePreview(null);
      setImageCloudinaryId(null);
      setSelectedVehicleIds([]);
      setInitialVehicleIds([]);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.error;
      if (msg) {
        form.setError("email", { message: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  // Submit handler for "Select Existing" mode
  // Vehicle assignment is OPTIONAL — user can be confirmed without vehicles
  const handleSelectExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExistingUserId) return;

    setIsSubmitting(true);
    try {
      // SELLER with existing vehicle — skip all vehicle operations
      if (!sellerAlreadyHasVehicle) {
        // Get the currently assigned vehicles for the selected user
        const user = existingUsers.find((u) => u.id === selectedExistingUserId);
        const userCurrentVehicleIds =
          user?.assignedVehicles?.map((v) => v.id) || [];

        // Only assign NEW vehicles (not already assigned to this user)
        const toAssign = selectedVehicleIds.filter(
          (id) => !userCurrentVehicleIds.includes(id),
        );

        // Unassign vehicles that were removed
        const toUnassign = initialVehicleIds.filter(
          (id) => !selectedVehicleIds.includes(id),
        );

        const vehicleOps = [
          ...toUnassign.map((vehicleId) =>
            axios
              .put(`/api/vehicles/${vehicleId}`, {
                assignedInspectorId: null,
                force: true,
              })
              .catch((err) =>
                console.error(`Failed to unassign vehicle ${vehicleId}:`, err),
              ),
          ),
          ...toAssign.map((vehicleId) =>
            axios
              .put(`/api/vehicles/${vehicleId}`, {
                assignedInspectorId: selectedExistingUserId,
                force: true,
              })
              .catch((err) =>
                console.error(`Failed to assign vehicle ${vehicleId}:`, err),
              ),
          ),
        ];

        if (vehicleOps.length > 0) {
          await Promise.all(vehicleOps);
        }
      }

      setSelectedVehicleIds([]);
      setSelectedExistingUserId(null);
      setExistingUserSearch("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to assign vehicles:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-lg h-[90vh] max-h-[90vh] overflow-hidden p-0 m-0 gap-0 grid-rows-[1fr]">
        <div className="flex flex-col h-full overflow-hidden bg-background relative">
          {/* ── Fixed Header ── */}
          <div className="shrink-0 px-6 pt-6 pb-3 space-y-3">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditing
                  ? t("inspectionsPage.inspectors.editTitle")
                  : t("inspectionsPage.inspectors.createTitle")}
              </DialogTitle>
              <DialogDescription className="text-pretty text-left">
                {isEditing
                  ? t("inspectionsPage.inspectors.editDescription")
                  : t("inspectionsPage.inspectors.createDescription")}
              </DialogDescription>
            </DialogHeader>

            {/* Mode tabs — only in create (non-edit) mode */}
            {!isEditing && (
              <div className="flex rounded-lg border border-border/60 p-0.5 bg-muted/30">
                <button
                  type="button"
                  onClick={() => {
                    setMode("create");
                    setSelectedVehicleIds([]);
                    setSelectedExistingUserId(null);
                    setExistingUserSearch("");
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md transition-all",
                    mode === "create"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <UserPlus className="size-3.5" />
                  {t("inspectionsPage.inspectors.createNew")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("select");
                    setSelectedVehicleIds([]);
                    form.reset({ name: "", email: "", password: "" });
                    setImagePreview(null);
                    setImageCloudinaryId(null);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md transition-all",
                    mode === "select"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Users className="size-3.5" />
                  {t("inspectionsPage.inspectors.selectExisting")}
                </button>
              </div>
            )}
          </div>

          {/* ── SELECT EXISTING USER MODE ── */}
          {!isEditing && mode === "select" ? (
            <form
              onSubmit={handleSelectExistingSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4 space-y-3">
                {/* ── User Search & Selection ── */}
                <div>
                  <h4 className="shrink-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    {t("inspectionsPage.inspectors.selectUser")}
                  </h4>

                  <div className="shrink-0 relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder={t("inspectionsPage.inspectors.searchUsers")}
                      value={existingUserSearch}
                      onChange={(e) => setExistingUserSearch(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>

                  {loadingExistingUsers ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredExistingUsers.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {t("inspectionsPage.inspectors.noUsersMatch")}
                    </p>
                  ) : (
                    <div>
                      <div className="p-1.5 space-y-0.5">
                        {filteredExistingUsers.map((user) => {
                          const isSelected = selectedExistingUserId === user.id;
                          const userIsSeller = hasRole(
                            user.roles as Role[],
                            Role.SELLER,
                          );
                          const userIsInspector = hasRole(
                            user.roles as Role[],
                            Role.INSPECTOR,
                          );
                          const userVehicleCount =
                            user._count?.assignedVehicles ??
                            user.assignedVehicles?.length ??
                            0;
                          // SELLER-only users who already have a vehicle are locked
                          const isSellerLocked =
                            userIsSeller &&
                            !userIsInspector &&
                            userVehicleCount >= 1;

                          return (
                            <button
                              key={user.id}
                              type="button"
                              disabled={isSellerLocked}
                              onClick={() => {
                                if (isSellerLocked) return;
                                setSelectedExistingUserId(
                                  isSelected ? null : user.id,
                                );
                                // Pre-load their assigned vehicles
                                if (!isSelected) {
                                  const userVehicleIds =
                                    user.assignedVehicles?.map((v) => v.id) ||
                                    [];
                                  setSelectedVehicleIds(userVehicleIds);
                                  setInitialVehicleIds(userVehicleIds);
                                } else {
                                  setSelectedVehicleIds([]);
                                  setInitialVehicleIds([]);
                                }
                              }}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-left mb-1.5",
                                isSellerLocked
                                  ? "opacity-50 cursor-not-allowed bg-muted/20 border border-border/30"
                                  : isSelected
                                    ? "bg-primary/10 border border-primary/20"
                                    : "hover:bg-muted/50 border border-transparent bg-muted/30",
                              )}
                            >
                              <Avatar className="size-10 shrink-0 ring-1 ring-border/40">
                                <AvatarImage
                                  src={user.image || undefined}
                                  alt={user.name || user.email}
                                  className="object-cover object-center"
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                                  {getInitials(user.name || user.email)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {user.name || user.email}
                                </p>
                                {user.name && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {getAllRoles(user.roles as Role[]).map(
                                    (role) => getRoleBadge(role),
                                  )}
                                </div>

                                {/* SELLER locked feedback */}
                                {isSellerLocked && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Lock className="size-2.5 text-amber-500 shrink-0" />
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 leading-tight">
                                      {t(
                                        "inspectionsPage.inspectors.sellerAlreadyAssigned",
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {isSelected && !isSellerLocked && (
                                <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <svg
                                    className="size-3 text-primary-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              )}
                              {isSellerLocked && (
                                <Lock className="size-4 text-amber-500/70 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Vehicle Assignment — only when a user is selected ── */}
                {selectedExistingUserId && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        {t("inspectionsPage.inspectors.assignVehicles")}
                        {selectedVehicleIds.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 px-1.5"
                          >
                            {selectedVehicleIds.length}
                          </Badge>
                        )}
                      </h4>
                      {!sellerAlreadyHasVehicle && (
                        <span className="text-[10px] text-muted-foreground italic">
                          {t("inspectionsPage.inspectors.vehiclesOptional")}
                        </span>
                      )}
                    </div>

                    {/* SELLER already has vehicle — LOCKED */}
                    {sellerAlreadyHasVehicle ? (
                      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-3 space-y-1.5">
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          {t("inspectionsPage.inspectors.sellerVehicleLocked")}
                        </p>
                        <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
                          {t(
                            "inspectionsPage.inspectors.sellerVehicleLockedHint",
                          )}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* SELLER max 1 vehicle warning */}
                        {selectedExistingUserIsSeller && (
                          <p className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-2.5 py-1.5">
                            {t(
                              "inspectionsPage.inspectors.sellerMaxOneVehicle",
                            )}
                          </p>
                        )}

                        {loadingVehicles ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : vehicles.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            {t(
                              "inspectionsPage.inspectors.noVehiclesAvailable",
                            )}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                              <Input
                                placeholder={t(
                                  "inspectionsPage.inspectors.searchVehicles",
                                )}
                                value={vehicleSearch}
                                onChange={(e) =>
                                  setVehicleSearch(e.target.value)
                                }
                                className="h-8 pl-8 text-xs"
                              />
                            </div>

                            <div>
                              <div className="p-1.5 space-y-0.5">
                                {filteredVehicles.map((vehicle) => {
                                  const isSelected =
                                    selectedVehicleIds.includes(vehicle.id);
                                  const isInactive =
                                    vehicle.status === "INACTIVE";
                                  const isAssignedToOther =
                                    vehicle.assignedInspectorId &&
                                    vehicle.assignedInspectorId !==
                                      selectedExistingUserId &&
                                    !isSelected;
                                  const isDisabled =
                                    !!isAssignedToOther || isInactive;
                                  return (
                                    <Label
                                      key={vehicle.id}
                                      className={cn(
                                        "flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors",
                                        isDisabled
                                          ? "opacity-50 cursor-not-allowed"
                                          : "cursor-pointer",
                                        isSelected && !isDisabled
                                          ? "bg-primary/10 border border-primary/20"
                                          : "hover:bg-muted/50 border border-transparent",
                                      )}
                                    >
                                      <Checkbox
                                        checked={isSelected && !isInactive}
                                        onCheckedChange={() =>
                                          toggleVehicle(vehicle.id)
                                        }
                                        disabled={isDisabled}
                                      />
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {vehicle.imageUrl ? (
                                          <Image
                                            src={vehicle.imageUrl}
                                            alt={vehicle.model}
                                            width={48}
                                            height={48}
                                            className={cn(
                                              "rounded object-contain object-center size-12 shrink-0",
                                              isInactive && "grayscale",
                                            )}
                                          />
                                        ) : (
                                          <div className="size-7 rounded bg-muted flex items-center justify-center shrink-0">
                                            <Car className="size-3.5 text-muted-foreground" />
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <p className="text-xs font-medium truncate">
                                            {vehicle.model}
                                          </p>
                                          <p className="text-[10px] text-muted-foreground font-mono">
                                            {vehicle.plate}
                                            {isInactive && (
                                              <span className="ml-1 text-rose-500">
                                                (
                                                {t(
                                                  "inspectionsPage.inspectors.vehicleInactive",
                                                )}
                                                )
                                              </span>
                                            )}
                                            {!isInactive &&
                                              isAssignedToOther &&
                                              vehicle.assignedInspector && (
                                                <span className="ml-1 text-amber-500">
                                                  (
                                                  {t(
                                                    "users.form.vehicleAssignment.assignedTo",
                                                    {
                                                      name:
                                                        vehicle
                                                          .assignedInspector
                                                          .name ||
                                                        vehicle
                                                          .assignedInspector
                                                          .email,
                                                    },
                                                  )}
                                                  )
                                                </span>
                                              )}
                                          </p>
                                        </div>
                                      </div>
                                    </Label>
                                  );
                                })}
                                {filteredVehicles.length === 0 && (
                                  <p className="text-xs text-muted-foreground text-center py-3">
                                    {t(
                                      "inspectionsPage.inspectors.noVehiclesMatch",
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="shrink-0 border-t px-6 py-4">
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedExistingUserId}
                  >
                    {isSubmitting && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {selectedVehicleIds.length > 0
                      ? t("inspectionsPage.inspectors.assignVehicles")
                      : t("inspectionsPage.inspectors.confirmSelection")}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          ) : (
            /* ── CREATE / EDIT MODE ── */
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 min-h-0 overflow-y-auto px-6 space-y-5 m-0">
                {/* Inspector Details Section */}
                <div className="space-y-3">
                  {/* Profile Image Section */}
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    {imagePreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative group">
                          <Image
                            src={imagePreview}
                            alt="Inspector"
                            width={20}
                            height={20}
                            className="rounded-full object-cover border-2 border-border size-24 object-center"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-1 -right-1 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {t("inspectionsPage.inspectors.changeImage")}
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 text-muted-foreground hover:border-muted-foreground/40 hover:bg-muted/30 transition-colors"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="size-5 animate-spin" />
                            <span className="text-xs">
                              {t("common.loading") || "Uploading..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="size-5" />
                            <span className="text-xs">
                              {t("inspectionsPage.inspectors.uploadImage")}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 grid grid-cols-2 gap-x-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="inspector-name" className="text-xs">
                        {t("inspectionsPage.inspectors.name")}
                      </Label>
                      <Input
                        id="inspector-name"
                        placeholder={t(
                          "inspectionsPage.inspectors.namePlaceholder",
                        )}
                        {...form.register("name")}
                        className="h-9"
                      />
                      {form.formState.errors.name && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="inspector-email" className="text-xs">
                        {t("inspectionsPage.inspectors.email")}
                      </Label>
                      <Input
                        id="inspector-email"
                        type="email"
                        placeholder={t(
                          "inspectionsPage.inspectors.emailPlaceholder",
                        )}
                        {...form.register("email")}
                        className="h-9"
                      />
                      {form.formState.errors.email && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="inspector-password" className="text-xs">
                        {t("inspectionsPage.inspectors.password")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="inspector-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t(
                            "inspectionsPage.inspectors.passwordPlaceholder",
                          )}
                          {...form.register("password")}
                          className="pr-10 h-9"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4 text-muted-foreground" />
                          ) : (
                            <Eye className="size-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {isEditing
                          ? t("inspectionsPage.inspectors.passwordEditHint")
                          : t("inspectionsPage.inspectors.passwordHint")}
                      </p>
                    </div>

                    {/* Status toggle — only in edit mode */}
                    {isEditing && (
                      <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 col-span-2">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">
                            {t("inspectionsPage.inspectors.statusLabel")}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {isActive
                              ? t("inspectionsPage.inspectors.active")
                              : t("inspectionsPage.inspectors.inactive")}
                          </p>
                        </div>
                        <Switch
                          checked={isActive}
                          onCheckedChange={setIsActive}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Assignment Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      {t("inspectionsPage.inspectors.assignVehicles")}
                      {selectedVehicleIds.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {selectedVehicleIds.length}
                        </Badge>
                      )}
                    </h4>
                    <span className="text-[10px] text-muted-foreground italic">
                      {t("inspectionsPage.inspectors.vehiclesOptional")}
                    </span>
                  </div>

                  {/* SELLER max 1 vehicle warning */}
                  {editingUserIsSeller && (
                    <p className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-2.5 py-1.5">
                      {t("inspectionsPage.inspectors.sellerMaxOneVehicle")}
                    </p>
                  )}

                  {loadingVehicles ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : vehicles.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {t("inspectionsPage.inspectors.noVehiclesAvailable")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Vehicle search */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                          placeholder={t(
                            "inspectionsPage.inspectors.searchVehicles",
                          )}
                          value={vehicleSearch}
                          onChange={(e) => setVehicleSearch(e.target.value)}
                          className="h-8 pl-8 text-xs"
                        />
                      </div>

                      <div>
                        <div className="p-1.5 space-y-0.5">
                          {filteredVehicles.map((vehicle) => {
                            const isSelected = selectedVehicleIds.includes(
                              vehicle.id,
                            );
                            const isInactive = vehicle.status === "INACTIVE";
                            const isAssignedToOther =
                              vehicle.assignedInspectorId &&
                              vehicle.assignedInspectorId !==
                                editInspector?.id &&
                              !isSelected;
                            const isDisabled =
                              !!isAssignedToOther || isInactive;
                            return (
                              <Label
                                key={vehicle.id}
                                className={cn(
                                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors",
                                  isDisabled
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer",
                                  isSelected && !isDisabled
                                    ? "bg-primary/10 border border-primary/20"
                                    : "hover:bg-muted/50 border border-transparent",
                                )}
                              >
                                <Checkbox
                                  checked={isSelected && !isInactive}
                                  onCheckedChange={() =>
                                    toggleVehicle(vehicle.id)
                                  }
                                  disabled={isDisabled}
                                />
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {vehicle.imageUrl ? (
                                    <Image
                                      src={vehicle.imageUrl}
                                      alt={vehicle.model}
                                      width={65}
                                      height={65}
                                      className={cn(
                                        "rounded object-contain object-center",
                                        isInactive && "grayscale",
                                      )}
                                    />
                                  ) : (
                                    <div className="size-7 rounded bg-muted flex items-center justify-center">
                                      <CarFront className="size-3.5 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">
                                      {vehicle.model}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-mono">
                                      {vehicle.plate}
                                      {isInactive && (
                                        <span className="ml-1 text-rose-500">
                                          (
                                          {t(
                                            "inspectionsPage.inspectors.vehicleInactive",
                                          )}
                                          )
                                        </span>
                                      )}
                                      {!isInactive &&
                                        isAssignedToOther &&
                                        vehicle.assignedInspector && (
                                          <span className="ml-1 text-amber-500">
                                            (
                                            {t(
                                              "users.form.vehicleAssignment.assignedTo",
                                              {
                                                name:
                                                  vehicle.assignedInspector
                                                    .name ||
                                                  vehicle.assignedInspector
                                                    .email,
                                              },
                                            )}
                                            )
                                          </span>
                                        )}
                                    </p>
                                  </div>
                                </div>
                              </Label>
                            );
                          })}
                          {filteredVehicles.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-3">
                              {t("inspectionsPage.inspectors.noVehiclesMatch")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="shrink-0 grid grid-cols-2 gap-x-3 py-5 px-3 border-t m-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  {isEditing
                    ? t("inspectionsPage.inspectors.saveChanges")
                    : t("inspectionsPage.inspectors.create")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
