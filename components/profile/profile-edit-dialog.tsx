"use client";

import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useI18n } from "@/lib/i18n/context";
import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { ProfileImageUpload } from "@/components/users/profile-image-upload";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Profile user data interface
export interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  country: string | null;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  hasPassword: boolean;
  accounts: Array<{ provider: string; type: string }>;
}

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ProfileUser;
  onSuccess: () => void;
}

// Dynamic form schema that accepts translation function
const createProfileEditSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(2, t("profile.edit.nameMinLength")),
      image: z.string().url().nullable().optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.newPassword && data.newPassword.length > 0) {
          return data.currentPassword && data.currentPassword.length > 0;
        }
        return true;
      },
      {
        message: t("profile.edit.currentPasswordRequired"),
        path: ["currentPassword"],
      }
    )
    .refine(
      (data) => {
        if (data.newPassword && data.newPassword.length > 0) {
          return data.newPassword.length >= 6;
        }
        return true;
      },
      {
        message: t("profile.edit.passwordMinLength"),
        path: ["newPassword"],
      }
    );

type ProfileEditFormData = z.infer<ReturnType<typeof createProfileEditSchema>>;

export function ProfileEditDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ProfileEditDialogProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  // Create schema with translations
  const profileEditSchema = createProfileEditSchema(t);

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: user.name || "",
      image: user.image || null,
      currentPassword: "",
      newPassword: "",
    },
  });

  // Handle image change
  const handleImageChange = useCallback(
    (imageUrl: string | null) => {
      form.setValue("image", imageUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form]
  );

  // Handle form submission
  async function onSubmit(values: ProfileEditFormData) {
    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: values.name,
      };

      // Only include image if it changed
      if (form.formState.dirtyFields.image) {
        payload.image = values.image;
      }

      // Include password fields if newPassword is provided
      if (values.newPassword && values.newPassword.length > 0) {
        payload.currentPassword = values.currentPassword;
        payload.newPassword = values.newPassword;
      }

      await axios.patch("/api/auth/update", payload);

      toast.success(t("profile.edit.success"));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error;
        if (errorMessage?.includes("incorrecta")) {
          toast.error(t("profile.edit.invalidCurrentPassword"));
        } else if (errorMessage?.includes("configurada")) {
          toast.error(t("profile.edit.noPasswordConfigured"));
        } else {
          toast.error(t("profile.edit.error"));
        }
      } else {
        toast.error(t("profile.edit.error"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>{t("profile.edit.title")}</DialogTitle>
          <DialogDescription>{t("profile.edit.description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Profile Image */}
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>{t("profile.edit.image")}</FormLabel>
                  <FormControl>
                    <ProfileImageUpload
                      currentImage={form.watch("image")}
                      userName={form.watch("name")}
                      onImageChange={handleImageChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.edit.name")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("profile.edit.namePlaceholder")}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email (read-only) */}
            <div className="space-y-2">
              <FormLabel>{t("profile.email")}</FormLabel>
              <Input value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                {t("profile.info.authMethods")}:{" "}
                {user.accounts.length > 0
                  ? user.accounts
                      .map((a) => t(`profile.info.${a.provider}`))
                      .join(", ")
                  : t("profile.info.credentials")}
              </p>
            </div>

            {/* Password Section - Only show if user has password */}
            {user.hasPassword && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium">
                        {t("profile.edit.passwordSection")}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {t("profile.edit.passwordSectionDescription")}
                      </p>
                    </div>
                  </div>

                  {/* Current Password */}
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("profile.edit.currentPassword")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder={t(
                              "profile.edit.currentPasswordPlaceholder"
                            )}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* New Password */}
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.edit.newPassword")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder={t(
                              "profile.edit.newPasswordPlaceholder"
                            )}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("profile.edit.newPasswordHint")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("profile.edit.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="size-3" variant="bars" />
                    {t("profile.edit.saving")}
                  </>
                ) : (
                  t("profile.edit.save")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
