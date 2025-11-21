"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Role } from "@prisma/client";
import { useForm } from "react-hook-form";
import { UserListItem } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, User, Shield, Lock } from "lucide-react";

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
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
            <FormItem>
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

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
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
              <FormDescription className="text-xs text-muted-foreground text-pretty">
                Solo ingresa una contraseña si deseas cambiarla (mínimo 8
                caracteres).
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Role Field */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
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
                    value={Role.SALESPERSON}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <span className="font-medium">Vendedor</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs text-muted-foreground text-pretty">
                Los administradores tienen acceso completo al sistema y pueden
                gestionar usuarios.
              </FormDescription>
              <FormMessage className="text-xs" />
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
