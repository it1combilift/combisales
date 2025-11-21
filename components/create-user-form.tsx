"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Role } from "@prisma/client";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createUserSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Loader2,
  Mail,
  User,
  Shield,
  Globe,
  CheckCircle2,
  Lock,
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

interface CreateUserFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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
    },
  });

  async function onSubmit(values: z.infer<typeof createUserSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear usuario");
      }

      toast.success("Usuario creado exitosamente");

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Hubo un problema al crear el usuario. Por favor, intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold">
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="**********"
                        className="h-11 transition-all focus-visible:ring-2"
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

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold">
                    Confirmar contraseña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="**********"
                        className="h-11 transition-all focus-visible:ring-2"
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
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
            className="w-full sm:w-auto h-11"
          >
            Limpiar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            className="w-full sm:w-auto h-11 gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              <>Confirmar</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
