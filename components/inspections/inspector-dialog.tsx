"use client";

import { z } from "zod";
import axios from "axios";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Eye, EyeOff, ImagePlus, X, Car, Search } from "lucide-react";

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
  imageUrl?: string | null;
  assignedInspectorId?: string | null;
}

interface InspectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const getInspectorSchema = (t: (key: string) => string) =>
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

type InspectorFormValues = z.infer<ReturnType<typeof getInspectorSchema>>;

export function InspectorDialog({
  open,
  onOpenChange,
  onSuccess,
}: InspectorDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
  const [vehicleSearch, setVehicleSearch] = useState("");

  const schema = getInspectorSchema(t);

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
      form.reset({ name: "", email: "", password: "" });
      setImagePreview(null);
      setImageCloudinaryId(null);
      setSelectedVehicleIds([]);
      setVehicleSearch("");
      setShowPassword(false);
      fetchVehicles();
    }
  }, [open]);

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

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId],
    );
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
      // Create the inspector user
      const createRes = await axios.post("/api/users/create", {
        ...data,
        confirmPassword: data.password,
        roles: ["INSPECTOR"],
        isActive: true,
        image: imagePreview || undefined,
      });

      const newUserId = createRes.data?.user?.id || createRes.data?.id;

      // Assign vehicles if any selected and we have the user ID
      if (newUserId && selectedVehicleIds.length > 0) {
        await Promise.all(
          selectedVehicleIds.map((vehicleId) =>
            axios
              .put(`/api/vehicles/${vehicleId}`, {
                assignedInspectorId: newUserId,
              })
              .catch((err) =>
                console.error(`Failed to assign vehicle ${vehicleId}:`, err),
              ),
          ),
        );
      }

      form.reset();
      setImagePreview(null);
      setImageCloudinaryId(null);
      setSelectedVehicleIds([]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("inspectionsPage.inspectors.createTitle")}
          </DialogTitle>
          <DialogDescription className="text-pretty text-left">
            {t("inspectionsPage.inspectors.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="inspector-name" className="text-xs">
                  {t("inspectionsPage.inspectors.name")}
                </Label>
                <Input
                  id="inspector-name"
                  placeholder={t("inspectionsPage.inspectors.namePlaceholder")}
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
                  placeholder={t("inspectionsPage.inspectors.emailPlaceholder")}
                  {...form.register("email")}
                  className="h-9"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
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
                  {t("inspectionsPage.inspectors.passwordHint")}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Assignment Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              {t("inspectionsPage.inspectors.assignVehicles")}
              {selectedVehicleIds.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  {selectedVehicleIds.length}
                </Badge>
              )}
            </h4>

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
                    placeholder={t("inspectionsPage.inspectors.searchVehicles")}
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <ScrollArea className="max-h-36">
                  <div className="p-1.5 space-y-0.5">
                    {filteredVehicles.map((vehicle) => {
                      const isAssigned =
                        vehicle.assignedInspectorId &&
                        !selectedVehicleIds.includes(vehicle.id);
                      return (
                        <Label
                          key={vehicle.id}
                          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-colors ${
                            selectedVehicleIds.includes(vehicle.id)
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted/50 border border-transparent"
                          } ${isAssigned ? "opacity-50" : ""}`}
                        >
                          <Checkbox
                            checked={selectedVehicleIds.includes(vehicle.id)}
                            onCheckedChange={() => toggleVehicle(vehicle.id)}
                          />
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {vehicle.imageUrl ? (
                              <Image
                                src={vehicle.imageUrl}
                                alt={vehicle.model}
                                width={65}
                                height={65}
                                className="rounded object-contain object-center"
                              />
                            ) : (
                              <div className="size-7 rounded bg-muted flex items-center justify-center">
                                <Car className="size-3.5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">
                                {vehicle.model}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {vehicle.plate}
                                {isAssigned && (
                                  <span className="ml-1 text-amber-500">
                                    (
                                    {t(
                                      "inspectionsPage.inspectors.alreadyAssigned",
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
                </ScrollArea>
              </div>
            )}
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
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {t("inspectionsPage.inspectors.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
