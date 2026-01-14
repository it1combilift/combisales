"use client";

import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createUserSchemaFactory } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { SellersSelection } from "./sellers-selection";
import { CreateUserFormProps } from "@/interfaces/user";
import { ProfileImageUpload } from "./profile-image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Loader2,
  Mail,
  User,
  Shield,
  Globe,
  CheckCircle2,
  Lock,
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

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  // Create schema with translations
  const createUserSchema = useMemo(() => createUserSchemaFactory(t), [t]);

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: Role.SELLER,
      country: "",
      isActive: true,
      image: null,
      assignedSellerIds: [] as string[],
    },
  });

  const selectedRole = form.watch("role");
  const isDealerRole = selectedRole === Role.DEALER;
  const assignedSellerIds = form.watch("assignedSellerIds");

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    const { name, email, password, confirmPassword, role } = form.getValues();
    const hasErrors = Object.keys(form.formState.errors).length > 0;

    // Basic validation
    if (!name || !email || !password || !confirmPassword || hasErrors) {
      return false;
    }

    // DEALER role requires sellers
    if (role === Role.DEALER) {
      return assignedSellerIds && assignedSellerIds.length > 0;
    }

    return true;
  }, [
    form.formState.errors,
    assignedSellerIds,
    form.watch("name"),
    form.watch("email"),
    form.watch("password"),
    form.watch("confirmPassword"),
    form.watch("role"),
  ]);

  const handleSellerSelectionChange = useCallback(
    (ids: string[]) => {
      form.setValue("assignedSellerIds", ids, { shouldValidate: true });
    },
    [form]
  );

  const handleImageChange = useCallback(
    (imageUrl: string | null) => {
      form.setValue("image", imageUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form]
  );

  // Trigger validation when role changes
  useEffect(() => {
    if (selectedRole) {
      form.trigger("assignedSellerIds");
    }
  }, [selectedRole, form]);

  async function onSubmit(values: z.infer<typeof createUserSchema>) {
    setIsLoading(true);
    try {
      await axios.post("/api/users/create", values);

      toast.success(t("users.userCreated"));

      form.reset();
      onSuccess?.();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || t("users.form.createError"));
      } else {
        toast.error(
          error instanceof Error ? error.message : t("users.form.createError")
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
              isDealerRole ? "grid-cols-4" : "grid-cols-3"
            } mb-4 h-auto bg-muted/30 dark:bg-muted/50 p-0.5 rounded-lg border border-border/40`}
          >
            <TabsTrigger
              value="personal"
              className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:shadow-black/5 dark:data-[state=active]:shadow-black/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
            >
              <User className="size-4" />
              <span className="hidden xs:inline">
                {t("users.form.tabs.personal")}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:shadow-black/5 dark:data-[state=active]:shadow-black/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
            >
              <Lock className="size-4" />
              <span className="hidden xs:inline">
                {t("users.form.tabs.security")}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:shadow-black/5 dark:data-[state=active]:shadow-black/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
            >
              <Settings className="size-4" />
              <span className="hidden xs:inline">
                {t("users.form.tabs.config")}
              </span>
            </TabsTrigger>
            {isDealerRole && (
              <TabsTrigger
                value="sellers"
                className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:shadow-black/5 dark:data-[state=active]:shadow-black/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
              >
                <Users className="size-4" />
                <span className="hidden xs:inline">
                  {t("users.form.tabs.sellers")}
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Personal Information Tab */}
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

            <div className="grid grid-cols-1 gap-4">
              {/* Name Field */}
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
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-3 mt-0">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.passwordLabel")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="**********"
                          className="h-11 transition-all focus-visible:ring-2 text-xs sm:text-sm"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.confirmPasswordLabel")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="**********"
                          className="h-11 transition-all focus-visible:ring-2 text-xs sm:text-sm"
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t("users.form.roleLabel")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                      <span className="text-muted-foreground">
                        ({t("forms.optional")})
                      </span>
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

            <div className="pt-2">
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
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 pt-4 mt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
            className="w-full sm:w-auto h-10 sm:h-11"
          >
            {t("users.form.clear")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full sm:w-auto h-10 sm:h-11 gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              <>{t("users.form.confirm")}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
