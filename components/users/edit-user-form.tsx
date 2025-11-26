"use client";

import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Role } from "@prisma/client";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateUserSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditUserFormProps } from "@/interfaces/user";
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

      await axios.patch(`/api/users/${user.id}`, updateData);

      toast.success("Usuario actualizado exitosamente");

      onSuccess?.();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ||
            "Hubo un problema al actualizar el usuario. Por favor, intenta nuevamente."
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Hubo un problema al actualizar el usuario. Por favor, intenta nuevamente."
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
          <TabsList className="grid w-full grid-cols-2 mb-6 h-auto bg-muted/30 dark:bg-muted/50 p-1 rounded-lg border border-border/40">
            <TabsTrigger
              value="personal"
              className="text-xs sm:text-sm py-2.5 sm:py-3 px-4 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:shadow-black/5 dark:data-[state=active]:shadow-black/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
            >
              <User className="size-4" />
              <span className="hidden xs:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="text-xs sm:text-sm py-2.5 sm:py-3 px-4 gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:shadow-black/5 dark:data-[state=active]:shadow-black/20 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50 transition-all duration-200 rounded-md font-medium"
            >
              <Settings className="size-4" />
              <span className="hidden xs:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal & Security Tab */}
          <TabsContent value="personal" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 gap-4">
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
                      Correo electrónico
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="usuario@combilift.es"
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
                    Cambiar contraseña
                  </h4>
                </div>
              </div>

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
          <TabsContent value="config" className="space-y-4 mt-0">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-2 ">
                    <FormLabel className="text-sm font-semibold">
                      Rol del usuario
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
                            <SelectValue placeholder="Selecciona un rol" />
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
                            <span className="font-medium">Administrador</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value={Role.SELLER}
                          className="cursor-pointer text-xs sm:text-sm"
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
                  Estado de la cuenta
                </h4>
              </div>
            </div>

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
                    <FormDescription className="text-xs text-muted-foreground text-pretty">
                      Los usuarios con cuenta inactiva no podrán acceder al
                      sistema.
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
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 sm:gap-3 pt-6 mt-6 border-t">
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isDirty}
            variant="success"
            className="w-full sm:w-auto h-10 sm:h-11 gap-2 shadow-sm"
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
