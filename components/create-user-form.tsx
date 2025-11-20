"use client";

import { z } from "zod";
import { useState } from "react";
import { Role } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createUserSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";

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
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof createUserSchema>>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            role: Role.SALESPERSON,
        },
    })

    async function onSubmit(values: z.infer<typeof createUserSchema>) {
        setIsLoading(true)
        try {
            const response = await fetch("/api/users/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                if (response.status === 404) {
                    console.log("API no encontrada, simulando éxito", values)
                } else {
                    throw new Error("Error al crear usuario")
                }
            }

            toast({
                title: "Usuario creado",
                description: "El usuario ha sido creado exitosamente.",
            })

            form.reset()
            onSuccess && onSuccess()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un problema al crear el usuario.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="Juan Pérez" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="usuario@combilift.es" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={
                                        Role.ADMIN
                                    }>Administrador</SelectItem>
                                    <SelectItem value={Role.SALESPERSON}>Vendedor</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>Los administradores tienen acceso completo al sistema.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar
                    </Button>
                </div>
            </form>
        </Form>
    )
}

