"use client";

import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RolesSelection } from "./roles-selection";
import { useForm, useWatch } from "react-hook-form";
import { SellerSelection } from "./seller-selection";
import { VehicleAssignment } from "./vehicle-assignment";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditUserFormProps } from "@/interfaces/user";
import { useState, useCallback, useEffect } from "react";
import { ProfileImageUpload } from "./profile-image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Loader2,
  Mail,
  User,
  Lock,
  Globe,
  CheckCircle2,
  Settings,
  Users,
  Car,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  // Helper function to check if roles include DEALER
  const includesDealer = (roles: Role[]) =>
    roles?.includes(Role.DEALER) ?? false;

  // Create form schema
  const formSchema = z
    .object({
      name: z.string().min(2, t("validation.nameMinLength")).optional(),
      email: z.string().email(t("validation.invalidEmail")).optional(),
      roles: z
        .array(
          z.nativeEnum(Role, {
            errorMap: () => ({ message: t("validation.invalidRole") }),
          }),
        )
        .min(1, t("validation.atLeastOneRole"))
        .optional(),
      country: z
        .string()
        .optional()
        .or(z.literal(""))
        .transform((val) => (val === "" ? undefined : val)),
      isActive: z.boolean().optional(),
      password: z
        .string()
        .min(8, t("validation.passwordMinLength8"))
        .optional()
        .or(z.literal(""))
        .transform((val) => (val === "" ? undefined : val)),
      image: z
        .string()
        .url(t("validation.invalidImageUrl"))
        .optional()
        .nullable()
        .or(z.literal(""))
        .transform((val) => (val === "" ? null : val)),
      assignedSellerId: z.string().cuid().optional().nullable(),
      assignedVehicleIds: z.array(z.string().cuid()).optional(),
    })
    .refine(
      (data) => {
        // DEALER role requires exactly one seller
        if (data.roles && includesDealer(data.roles)) {
          return !!data.assignedSellerId;
        }
        return true;
      },
      {
        message: t("validation.dealerRequiresSeller"),
        path: ["assignedSellerId"],
      },
    );

  // Extract assigned seller ID (first one, since now only one is allowed)
  const assignedSellerId = user.assignedSellers?.[0]?.seller?.id || null;
  // Extract assigned vehicle IDs
  const initialVehicleIds = user.assignedVehicles?.map((v) => v.id) || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: user.name || "",
      email: user.email,
      roles: user.roles || [Role.SELLER],
      country: user.country || "",
      isActive: user.isActive,
      password: "",
      image: user.image || null,
      assignedSellerId: assignedSellerId,
      assignedVehicleIds: initialVehicleIds,
    },
  });

  // Watch form values using useWatch for proper reactivity
  const selectedRoles = useWatch({ control: form.control, name: "roles" });
  const isDealerRole = selectedRoles?.includes(Role.DEALER) ?? false;
  const isVehicleRole =
    (selectedRoles?.includes(Role.INSPECTOR) ||
      selectedRoles?.includes(Role.SELLER)) ??
    false;
  const watchedAssignedSellerId = useWatch({
    control: form.control,
    name: "assignedSellerId",
  });
  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedEmail = useWatch({ control: form.control, name: "email" });

  // Check if form is valid for submission
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  const isFormValid =
    !!watchedName &&
    !!watchedEmail &&
    !hasErrors &&
    (!isDealerRole || !!watchedAssignedSellerId);

  // Reset form when user changes (fixes assigned seller not showing)
  useEffect(() => {
    const newAssignedSellerId = user.assignedSellers?.[0]?.seller?.id || null;
    const newVehicleIds = user.assignedVehicles?.map((v) => v.id) || [];

    form.reset({
      name: user.name || "",
      email: user.email,
      roles: user.roles || [Role.SELLER],
      country: user.country || "",
      isActive: user.isActive,
      password: "",
      image: user.image || null,
      assignedSellerId: newAssignedSellerId,
      assignedVehicleIds: newVehicleIds,
    });
  }, [user.id]); // Only reset when user ID changes, not on every user object reference change

  // Handle roles change - clear seller ID when DEALER is removed from roles
  const handleRolesChange = useCallback(
    (newRoles: Role[]) => {
      form.setValue("roles", newRoles, {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (!newRoles.includes(Role.DEALER)) {
        form.setValue("assignedSellerId", null, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [form],
  );

  // Trigger validation when roles change
  useEffect(() => {
    if (selectedRoles) {
      form.trigger("assignedSellerId");
    }
  }, [selectedRoles, form]);

  const handleSellerSelectionChange = useCallback(
    (id: string | null) => {
      console.log("🔄 Seller selection changed (Edit):", id);
      form.setValue("assignedSellerId", id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      // Force trigger validation to ensure form state updates
      form.trigger("assignedSellerId");
    },
    [form],
  );

  // Debug logging
  useEffect(() => {
    console.log("📊 EditUserForm State:", {
      selectedRoles,
      isDealerRole,
      watchedAssignedSellerId,
      watchedName,
      watchedEmail,
      hasErrors,
      isFormValid,
      isDirty: form.formState.isDirty,
    });
  }, [
    selectedRoles,
    isDealerRole,
    watchedAssignedSellerId,
    watchedName,
    watchedEmail,
    hasErrors,
    isFormValid,
    form.formState.isDirty,
  ]);

  const handleImageChange = useCallback(
    (imageUrl: string | null) => {
      form.setValue("image", imageUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form],
  );

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const updateData: Record<
        string,
        z.infer<typeof formSchema>[keyof z.infer<typeof formSchema>]
      > = {};

      if (values.name && values.name !== user.name) {
        updateData.name = values.name;
      }
      if (values.email && values.email !== user.email) {
        updateData.email = values.email;
      }
      // Compare roles arrays
      const userRoles = user.roles || [];
      const newRoles = values.roles || [];
      const rolesChanged =
        userRoles.length !== newRoles.length ||
        !userRoles.every((r) => newRoles.includes(r));
      if (rolesChanged) {
        updateData.roles = newRoles;
      }
      if (values.country !== undefined && values.country !== user.country) {
        updateData.country = values.country;
      }
      if (values.isActive !== undefined && values.isActive !== user.isActive) {
        updateData.isActive = values.isActive;
      }
      if (values.password && values.password.trim().length > 0) {
        updateData.password = values.password;
      }

      // Handle image update (including removal with null)
      if (values.image !== user.image) {
        updateData.image = values.image;
      }

      // Handle DEALER seller assignment (single seller)
      if (values.assignedSellerId !== undefined) {
        const currentSellerId = user.assignedSellers?.[0]?.seller?.id || null;

        // Only update if there's a change
        if (currentSellerId !== values.assignedSellerId) {
          updateData.assignedSellerId = values.assignedSellerId;
        }
      }

      // Handle vehicle assignment for INSPECTOR/SELLER roles
      if (values.assignedVehicleIds !== undefined) {
        const currentVehicleIds = user.assignedVehicles?.map((v) => v.id) || [];
        const newVehicleIds = values.assignedVehicleIds || [];

        const vehiclesChanged =
          currentVehicleIds.length !== newVehicleIds.length ||
          !currentVehicleIds.every((id) => newVehicleIds.includes(id));

        if (vehiclesChanged) {
          updateData.assignedVehicleIds = newVehicleIds;
        }
      }

      if (Object.keys(updateData).length === 0) {
        toast.info(t("users.form.noChanges"));
        setIsLoading(false);
        return;
      }

      await axios.patch(`/api/users/${user.id}`, updateData);

      toast.success(t("users.form.updateSuccess"));

      onSuccess?.();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || t("users.form.updateError"));
      } else {
        toast.error(
          error instanceof Error ? error.message : t("users.form.updateError"),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList
            className={`grid w-full ${
              isDealerRole && isVehicleRole
                ? "grid-cols-4"
                : isDealerRole || isVehicleRole
                  ? "grid-cols-3"
                  : "grid-cols-2"
            } mb-4 h-auto bg-muted/30 dark:bg-muted/50 p-0.5 rounded-lg border border-border/40`}
          >
            <TabsTrigger
              value="personal"
              className="text-xs sm:text-sm py-2 px-3 gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
            >
              <User className="size-4" />
              <span className="hidden xs:inline">
                {t("users.form.personal")}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="text-xs sm:text-sm py-2 px-3 gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
            >
              <Settings className="size-4" />
              <span className="hidden xs:inline">{t("users.form.config")}</span>
            </TabsTrigger>
            {isDealerRole && (
              <TabsTrigger
                value="sellers"
                className="text-xs sm:text-sm py-2 px-3 gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
              >
                <Users className="size-4" />
                <span className="hidden xs:inline">
                  {t("users.form.tabs.sellers")}
                </span>
              </TabsTrigger>
            )}
            {isVehicleRole && (
              <TabsTrigger
                value="vehicles"
                className="text-xs sm:text-sm py-2 px-3 gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
              >
                <Car className="size-4" />
                <span className="hidden xs:inline">
                  {t("users.form.tabs.vehicles")}
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Personal & Security Tab */}
          <TabsContent value="personal" className="space-y-3 mt-0">
            {/* Profile Image */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormControl>
                    <ProfileImageUpload
                      currentImage={field.value}
                      userName={form.watch("name")}
                      onImageChange={handleImageChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.fullNameLabel")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder={t("users.form.fullNamePlaceholder")}
                          className="pl-10 h-11 transition-all focus-visible:ring-2 text-xs sm:text-sm"
                          disabled={isLoading}
                          autoComplete="name"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.emailLabel")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder={t("users.form.emailPlaceholder")}
                          className="pl-10 h-11 transition-all focus-visible:ring-2 text-xs sm:text-sm"
                          disabled={isLoading}
                          autoComplete="email"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <div className="flex items-center gap-2 pb-3 mb-1">
                  <Lock className="size-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-medium text-muted-foreground">
                    {t("users.form.changePassword")}
                  </h4>
                </div>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.newPassword")} (optional)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder={t("users.form.leaveEmpty")}
                          className="pl-10 h-11 transition-all focus-visible:ring-2 text-xs sm:text-sm"
                          disabled={isLoading}
                          autoComplete="new-password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-3 mt-0">
            <div className="grid grid-cols-1 gap-3">
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.roleLabel")}
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground">
                      {t("users.form.rolesDescription")}
                    </FormDescription>
                    <FormControl>
                      <RolesSelection
                        selectedRoles={field.value || []}
                        onSelectionChange={handleRolesChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.countryLabel")}{" "}
                      <span className="text-muted-foreground">(Opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder={t("users.form.countryPlaceholder")}
                          className="pl-10 h-11 transition-all focus-visible:ring-2 text-xs sm:text-sm"
                          disabled={isLoading}
                          autoComplete="country"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-muted-foreground" />
                <h4 className="text-xs font-medium text-muted-foreground">
                  {t("users.form.accountState")}
                </h4>
              </div>
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-muted-foreground" />
                      {t("users.form.account")}
                    </FormLabel>
                    <FormDescription className="text-xs text-muted-foreground text-pretty">
                      {t("users.form.inactiveDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Sellers Tab (only for DEALER role) */}
          {isDealerRole && (
            <TabsContent value="sellers" className="mt-0">
              <FormField
                control={form.control}
                name="assignedSellerId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SellerSelection
                        key={`seller-${user.id}`}
                        selectedSellerId={field.value}
                        onSelectionChange={handleSellerSelectionChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          )}

          {/* Vehicles Tab (only for INSPECTOR/SELLER roles) */}
          {isVehicleRole && (
            <TabsContent value="vehicles" className="mt-0">
              <FormField
                control={form.control}
                name="assignedVehicleIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <VehicleAssignment
                        key={`vehicles-${user.id}`}
                        selectedVehicleIds={field.value || []}
                        onSelectionChange={(ids) => {
                          field.onChange(ids);
                        }}
                        editingUserId={user.id}
                        userRoles={selectedRoles || []}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 sm:gap-3 pt-4 mt-4 border-t">
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isDirty || !isFormValid}
            className="w-full sm:w-auto h-10 sm:h-11 gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              <>{t("users.form.save")}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
