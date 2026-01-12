"use client";

import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateUserSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditUserFormProps } from "@/interfaces/user";
import { SellersSelection } from "./sellers-selection";
import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Loader2,
  Mail,
  User,
  Shield,
  Lock,
  Globe,
  CheckCircle2,
  Settings,
  Users,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = updateUserSchema.omit({ id: true });

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  // Extract assigned seller IDs
  const assignedSellerIds = (user.assignedSellers?.map((as) => as.seller.id) ||
    []) as string[];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email,
      role: user.role,
      country: user.country || "",
      isActive: user.isActive,
      password: "",
      assignedSellerIds: assignedSellerIds,
    },
  });

  const selectedRole = form.watch("role");
  const isDealerRole = selectedRole === Role.DEALER;

  // Reset form when user changes (fixes assigned sellers not showing)
  useEffect(() => {
    const newAssignedSellerIds = (user.assignedSellers?.map(
      (as) => as.seller.id
    ) || []) as string[];

    form.reset({
      name: user.name || "",
      email: user.email,
      role: user.role,
      country: user.country || "",
      isActive: user.isActive,
      password: "",
      assignedSellerIds: newAssignedSellerIds,
    });
  }, [user.id]); // Only reset when user ID changes, not on every user object reference change

  // Clear seller IDs when role changes FROM DEALER to another role
  const handleRoleChange = useCallback(
    (newRole: Role) => {
      form.setValue("role", newRole, {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (newRole !== Role.DEALER) {
        form.setValue("assignedSellerIds", []);
      }
    },
    [form]
  );

  const handleSellerSelectionChange = useCallback(
    (ids: string[]) => {
      form.setValue("assignedSellerIds", ids, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form]
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
      if (values.role && values.role !== user.role) {
        updateData.role = values.role;
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

      // Handle DEALER sellers assignment
      if (values.assignedSellerIds !== undefined) {
        const currentSellerIds =
          user.assignedSellers?.map((as) => as.seller.id).sort() || [];
        const newSellerIds = [...values.assignedSellerIds].sort();

        // Only update if there's a change
        if (JSON.stringify(currentSellerIds) !== JSON.stringify(newSellerIds)) {
          updateData.assignedSellerIds = values.assignedSellerIds;
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
          error instanceof Error ? error.message : t("users.form.updateError")
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
              isDealerRole ? "grid-cols-3" : "grid-cols-2"
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
          </TabsList>

          {/* Personal & Security Tab */}
          <TabsContent value="personal" className="space-y-3 mt-0">
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
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-2 ">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.roleLabel")}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => handleRoleChange(value as Role)}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="min-h-full transition-all focus:ring-2 text-xs sm:text-sm w-full">
                          <div className="flex items-center gap-2">
                            <Shield className="size-4 text-muted-foreground" />
                            <SelectValue
                              placeholder={t("users.form.rolePlaceholder")}
                            />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value={Role.ADMIN}
                          className="cursor-pointer text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-blue-500" />
                            <span className="font-medium">
                              {t("users.roles.admin")}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value={Role.DEALER}
                          className="cursor-pointer text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-amber-500" />
                            <span className="font-medium">
                              {t("users.roles.dealer")}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value={Role.SELLER}
                          className="cursor-pointer text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-emerald-500" />
                            <span className="font-medium">
                              {t("users.roles.seller")}
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

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
                name="assignedSellerIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SellersSelection
                        key={`sellers-${user.id}`}
                        selectedSellerIds={field.value ?? []}
                        onSelectionChange={handleSellerSelectionChange}
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
            disabled={isLoading || !form.formState.isDirty}
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
