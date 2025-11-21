"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Role } from "@prisma/client";
import { useForm } from "react-hook-form";
import { UserListItem } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateUserSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Loader2,
  Mail,
  User,
  Shield,
  Lock,
  Globe,
  CheckCircle2,
  Settings,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditUserFormProps {
  user: UserListItem;
  onSuccess?: () => void;
  className?: string;
}

const formSchema = updateUserSchema.omit({ id: true });

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email,
      role: user.role,
      country: user.country || "",
      isActive: user.isActive,
      password: "",
    },
  });

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

      if (Object.keys(updateData).length === 0) {
        toast.info("No hay cambios para actualizar");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar usuario");
      }

      toast.success("Usuario actualizado exitosamente");

      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Hubo un problema al actualizar el usuario. Por favor, intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <User className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Información Personal</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold">
                    Nombre completo
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Ej: Juan Pérez García"
                        className="pl-10 h-11 transition-all focus-visible:ring-2"
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

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold">
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="usuario@combilift.es"
                        className="pl-10 h-11 transition-all focus-visible:ring-2"
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
        </div>

        {/* Security Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Lock className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Seguridad</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold">
                    Nueva contraseña (opcional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Dejar vacío para no cambiar"
                        className="pl-10 h-11 transition-all focus-visible:ring-2"
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
        </div>

        {/* Configuration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Settings className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Configuración</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Field */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold">
                    Rol del usuario
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 transition-all focus:ring-2">
                        <div className="flex items-center gap-2">
                          <Shield className="size-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecciona un rol" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Role.ADMIN} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-blue-500" />
                          <span className="font-medium">Administrador</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value={Role.SELLER}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-emerald-500" />
                          <span className="font-medium">Vendedor</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Country Field */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold">
                    País{" "}
                    <span className="text-muted-foreground">(Opcional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Ej: España"
                        className="pl-10 h-11 transition-all focus-visible:ring-2"
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
        </div>

        {/* Status Section */}
        {/* IsActive Field */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-muted-foreground" />
                  Cuenta
                </FormLabel>
                <FormDescription className="text-xs text-muted-foreground">
                  Los usuarios con cuenta inactiva no podrán acceder al sistema.
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

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isDirty}
            variant="default"
            className="w-full sm:w-auto h-11 gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              <>Guardar</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
