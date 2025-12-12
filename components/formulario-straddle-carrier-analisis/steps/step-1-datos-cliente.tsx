"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  CalendarIcon,
  Building2,
  User,
  Mail,
  MapPin,
  Globe,
  Users,
  Hash,
} from "lucide-react";

// ==================== SECTION HEADER ====================
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="hidden md:flex items-center gap-1.5 pb-1.5 border-b border-border/40 mb-3">
      <div className="size-5 rounded bg-primary/10 flex items-center justify-center">
        <Icon className="size-3 text-primary" />
      </div>
      <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

// ==================== TEXT INPUT FIELD ====================
interface TextInputProps {
  control: any;
  name: string;
  label: string;
  placeholder: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  type?: string;
  className?: string;
}

function TextInput({
  control,
  name,
  label,
  placeholder,
  icon: Icon,
  required = false,
  type = "text",
  className,
}: TextInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-[10px] sm:text-[11px] font-medium flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {Icon && (
                <Icon className="absolute left-2 top-1/2 -translate-y-1/2 size-3 sm:size-3.5 text-muted-foreground" />
              )}
              <Input
                type={type}
                placeholder={placeholder}
                className={cn(
                  "text-xs sm:text-sm h-8 sm:h-9",
                  Icon && "pl-7 sm:pl-8"
                )}
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage className="text-[10px]" />
        </FormItem>
      )}
    />
  );
}

/**
 * Step 1: Datos del Cliente
 * Company information, contact details, and commercial data
 */
export function Step1Content({ form }: StepContentProps) {
  return (
    <div className="space-y-4">
      {/* ==================== EMPRESA ==================== */}
      <section>
        <SectionHeader icon={Building2} title="Datos de la Empresa" />
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            control={form.control}
            name="razonSocial"
            label="Razón Social"
            placeholder="Nombre de la empresa"
            icon={Building2}
            required
          />
          <TextInput
            control={form.control}
            name="numeroIdentificacionFiscal"
            label="NIF"
            placeholder="B12345678"
            icon={Hash}
            required
          />
          <TextInput
            control={form.control}
            name="website"
            label="Website"
            placeholder="https://www.empresa.com"
            icon={Globe}
            type="url"
            className="col-span-2"
          />
        </div>
      </section>

      {/* ==================== CONTACTO ==================== */}
      <section>
        <SectionHeader icon={User} title="Persona de Contacto" />
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            control={form.control}
            name="personaContacto"
            label="Nombre completo"
            placeholder="Nombre y apellidos"
            icon={User}
            required
          />
          <TextInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="correo@empresa.com"
            icon={Mail}
            required
            type="email"
          />
        </div>
      </section>

      {/* ==================== UBICACIÓN ==================== */}
      <section>
        <SectionHeader icon={MapPin} title="Ubicación" />
        <div className="grid grid-cols-3 gap-2">
          <TextInput
            control={form.control}
            name="direccion"
            label="Dirección"
            placeholder="Calle, número, etc."
            icon={MapPin}
            required
            className="col-span-3"
          />
          <TextInput
            control={form.control}
            name="localidad"
            label="Localidad"
            placeholder="Ciudad"
            required
            className="col-span-2"
          />
          <TextInput
            control={form.control}
            name="provinciaEstado"
            label="Provincia"
            placeholder="Provincia/Estado"
            required
          />
          <TextInput
            control={form.control}
            name="codigoPostal"
            label="C.P."
            placeholder="12345"
            required
          />
          <TextInput
            control={form.control}
            name="pais"
            label="País"
            placeholder="País"
            required
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </section>

      {/* ==================== COMERCIAL ==================== */}
      <section>
        <SectionHeader icon={Users} title="Información Comercial" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <TextInput
            control={form.control}
            name="distribuidor"
            label="Distribuidor"
            placeholder="Nombre distribuidor"
          />
          <TextInput
            control={form.control}
            name="contactoDistribuidor"
            label="Contacto Dist."
            placeholder="Persona de contacto"
          />

          {/* Fecha de cierre - Special field */}
          <FormField
            control={form.control}
            name="fechaCierre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] sm:text-[11px] font-medium">
                  Fecha cierre
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-8 sm:h-9 text-xs sm:text-sm font-normal justify-start text-left",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1.5 size-3 sm:size-3.5" />
                        {field.value
                          ? format(field.value, "dd/MM/yyyy", { locale: es })
                          : "Seleccionar"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>
      </section>
    </div>
  );
}
