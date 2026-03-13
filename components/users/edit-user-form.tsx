"use client";

import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import { Spinner } from "../ui/spinner";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RolesSelection } from "./roles-selection";
import { useForm, useWatch } from "react-hook-form";
import { SellerSelection } from "./seller-selection";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditUserFormProps } from "@/interfaces/user";
import { VehicleAssignment } from "./vehicle-assignment";
import { useState, useCallback, useEffect } from "react";
import { ProfileImageUpload } from "./profile-image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Mail,
  User,
  Lock,
  Globe,
  CheckCircle2,
  Settings,
  Users,
  CarFront,
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

const EDIT_TAB_TRIGGER_CLASS = cn(
  "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5",
  "py-2 px-1 sm:px-3 min-h-[52px] sm:min-h-[44px]",
  "text-[10px] sm:text-xs font-medium leading-tight",
  "data-[state=active]:bg-background data-[state=active]:text-foreground",
  "data-[state=active]:shadow-md data-[state=active]:shadow-black/5 dark:data-[state=active]:shadow-black/20",
  "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
  "data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md",
);

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const includesDealer = (roles: Role[]) =>
    roles?.includes(Role.DEALER) ?? false;

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

  const assignedSellerId = user.assignedSellers?.[0]?.seller?.id || null;
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

  const tabCount = 2 + (isDealerRole ? 1 : 0) + (isVehicleRole ? 1 : 0);
  const isFormValid =
    form.formState.isValid && (!isDealerRole || !!watchedAssignedSellerId);

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
  }, [user.id]);

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

  useEffect(() => {
    if (selectedRoles) form.trigger("assignedSellerId");
  }, [selectedRoles, form]);

  const handleSellerSelectionChange = useCallback(
    (id: string | null) => {
      form.setValue("assignedSellerId", id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.trigger("assignedSellerId");
    },
    [form],
  );

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

      if (values.name && values.name !== user.name)
        updateData.name = values.name;
      if (values.email && values.email !== user.email)
        updateData.email = values.email;

      const userRoles = user.roles || [];
      const newRoles = values.roles || [];
      const rolesChanged =
        userRoles.length !== newRoles.length ||
        !userRoles.every((r) => newRoles.includes(r));
      if (rolesChanged) updateData.roles = newRoles;

      if (values.country !== undefined && values.country !== user.country)
        updateData.country = values.country;
      if (values.isActive !== undefined && values.isActive !== user.isActive)
        updateData.isActive = values.isActive;
      if (values.password && values.password.trim().length > 0)
        updateData.password = values.password;
      if (values.image !== user.image) updateData.image = values.image;

      if (values.assignedSellerId !== undefined) {
        const currentSellerId = user.assignedSellers?.[0]?.seller?.id || null;
        if (currentSellerId !== values.assignedSellerId)
          updateData.assignedSellerId = values.assignedSellerId;
      }

      if (values.assignedVehicleIds !== undefined) {
        const currentVehicleIds = user.assignedVehicles?.map((v) => v.id) || [];
        const newVehicleIds = values.assignedVehicleIds || [];
        const vehiclesChanged =
          currentVehicleIds.length !== newVehicleIds.length ||
          !currentVehicleIds.every((id) => newVehicleIds.includes(id));
        if (vehiclesChanged) updateData.assignedVehicleIds = newVehicleIds;
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
      {/*
        Layout: flex column filling the dialog's available height.
        - TabsList: always visible, never scrolls
        - TabsContent wrapper: flex-1 + overflow-y-auto → internal scroll
        - Save button: always pinned at the bottom, never hidden
      */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <Tabs defaultValue="personal" className="flex flex-col flex-1 min-h-0">
          {/* ── Tab navigation — always visible, never scrolls ── */}
          <TabsList
            className={cn(
              "grid w-full mb-4 h-auto shrink-0",
              "bg-muted/30 dark:bg-muted/50 p-0.5 rounded-xl border border-border/40",
              tabCount === 2 && "grid-cols-2",
              tabCount === 3 && "grid-cols-3",
              tabCount === 4 && "grid-cols-4",
            )}
          >
            <TabsTrigger value="personal" className={EDIT_TAB_TRIGGER_CLASS}>
              <User className="size-4 shrink-0" />
              <span className="w-full text-center leading-tight line-clamp-2">
                {t("users.form.personal")}
              </span>
            </TabsTrigger>

            <TabsTrigger value="config" className={EDIT_TAB_TRIGGER_CLASS}>
              <Settings className="size-4 shrink-0" />
              <span className="w-full text-center leading-tight line-clamp-2">
                {t("users.form.config")}
              </span>
            </TabsTrigger>

            {isDealerRole && (
              <TabsTrigger value="sellers" className={EDIT_TAB_TRIGGER_CLASS}>
                <Users className="size-4 shrink-0" />
                <span className="w-full text-center leading-tight line-clamp-2">
                  {t("users.form.tabs.sellers")}
                </span>
              </TabsTrigger>
            )}

            {isVehicleRole && (
              <TabsTrigger value="vehicles" className={EDIT_TAB_TRIGGER_CLASS}>
                <CarFront className="size-4 shrink-0" />
                <span className="w-full text-center leading-tight line-clamp-2">
                  {t("users.form.tabs.vehicles")}
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── Scrollable tab content area ── */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* ── Personal & Security ── */}
            <TabsContent value="personal" className="space-y-4 mt-0 pb-1">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center pb-1">
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

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.fullNameLabel")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder={t("users.form.fullNamePlaceholder")}
                          className="pl-10 h-11 text-sm"
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
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.emailLabel")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="email"
                          placeholder={t("users.form.emailPlaceholder")}
                          className="pl-10 h-11 text-sm"
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

              <div className="h-px bg-border/50" />

              <div className="flex items-center gap-2">
                <Lock className="size-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">
                  {t("users.form.changePassword")}
                </p>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.newPassword")}{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        ({t("forms.optional")})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="password"
                          placeholder={t("users.form.leaveEmpty")}
                          className="pl-10 h-11 text-sm"
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
            </TabsContent>

            {/* ── Configuration ── */}
            <TabsContent value="config" className="space-y-4 mt-0 pb-1">
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
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

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.countryLabel")}{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        ({t("forms.optional")})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder={t("users.form.countryPlaceholder")}
                          className="pl-10 h-11 text-sm"
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

              <div className="h-px bg-border/50" />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/60 p-4 gap-4 bg-muted/20">
                    <div className="space-y-0.5 min-w-0">
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-muted-foreground shrink-0" />
                        {t("users.form.account")}
                      </FormLabel>
                      <FormDescription className="text-xs text-muted-foreground leading-relaxed">
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

            {/* ── Sellers (DEALER role only) ── */}
            {isDealerRole && (
              <TabsContent value="sellers" className="mt-0 pb-1">
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

            {/* ── Vehicles (INSPECTOR / SELLER roles only) ── */}
            {isVehicleRole && (
              <TabsContent value="vehicles" className="mt-0 pb-1">
                <FormField
                  control={form.control}
                  name="assignedVehicleIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <VehicleAssignment
                          key={`vehicles-${user.id}`}
                          selectedVehicleIds={field.value || []}
                          onSelectionChange={(ids) => field.onChange(ids)}
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
          </div>
        </Tabs>

        {/* ── Save button — always pinned, never scrolls away ── */}
        <div className="pt-4 mt-2 border-t border-border/60 shrink-0">
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isDirty || !isFormValid}
            className="w-full h-11 gap-2"
          >
            {isLoading ? (
              <>
                <Spinner variant="circle" className="size-4" />
                <span>{t("common.loading")}</span>
              </>
            ) : (
              t("users.form.save")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
 