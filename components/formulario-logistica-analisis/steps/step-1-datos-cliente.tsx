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
  Phone,
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
    <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/40 mb-3">
      <div className="size-5 rounded bg-primary/10 flex items-center justify-center">
        <Icon className="size-3 text-primary" />
      </div>
      <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

/**
 * Step 1: Datos del Cliente
 * Company information, contact details, and commercial data
 */
export function Step1Content({ form }: StepContentProps) {
  return (
    <div className="space-y-5">
      {/* ==================== EMPRESA ==================== */}
      <section>
        <SectionHeader icon={Building2} title="Datos de la Empresa" />
        <div className="grid grid-cols-12 gap-x-2 gap-y-3">
          {/* Razón Social */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-5">
            <FormField
              control={form.control}
              name="razonSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    Razón Social <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Nombre de la empresa"
                        className="text-sm h-9 pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* NIF */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-3">
            <FormField
              control={form.control}
              name="numeroIdentificacionFiscal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    NIF <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="B12345678"
                        className="text-sm h-9 pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Website */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-4">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    Website
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://www.empresa.com"
                        className="text-sm h-9 pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>

      {/* ==================== CONTACTO ==================== */}
      <section>
        <SectionHeader icon={User} title="Persona de Contacto" />
        <div className="grid grid-cols-12 gap-x-2 gap-y-3">
          {/* Nombre */}
          <div className="col-span-12 sm:col-span-5">
            <FormField
              control={form.control}
              name="personaContacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    Nombre completo <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Nombre y apellidos"
                        className="text-sm h-9 pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <div className="col-span-12 sm:col-span-7">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="correo@empresa.com"
                        className="text-sm h-9 pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>

      {/* ==================== UBICACIÓN ==================== */}
      <section>
        <SectionHeader icon={MapPin} title="Ubicación" />
        <div className="grid grid-cols-12 gap-x-2 gap-y-3">
          {/* Dirección */}
          <div className="col-span-12 sm:col-span-8 lg:col-span-6">
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    Dirección <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Calle, número, piso..."
                        className="text-sm h-9 pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Localidad */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-3">
            <FormField
              control={form.control}
              name="localidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    Localidad <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ciudad"
                      className="text-sm h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Código Postal */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-3">
            <FormField
              control={form.control}
              name="codigoPostal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    C. Postal <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000"
                      className="text-sm h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Provincia */}
          <div className="col-span-6 sm:col-span-4 lg:col-span-4">
            <FormField
              control={form.control}
              name="provinciaEstado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    Provincia <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Provincia / Estado"
                      className="text-sm h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* País */}
          <div className="col-span-6 sm:col-span-5 lg:col-span-4">
            <FormField
              control={form.control}
              name="pais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    País <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="País"
                        className="text-sm h-9 pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>

      {/* ==================== COMERCIAL ==================== */}
      <section>
        <SectionHeader icon={Users} title="Información Comercial" />
        <div className="grid grid-cols-12 gap-x-2 gap-y-3">
          {/* Distribuidor */}
          <div className="col-span-6 sm:col-span-4">
            <FormField
              control={form.control}
              name="distribuidor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    Distribuidor
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Nombre distribuidor"
                        className="text-sm h-9 pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Contacto Distribuidor */}
          <div className="col-span-6 sm:col-span-4">
            <FormField
              control={form.control}
              name="contactoDistribuidor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    Contacto
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Teléfono o email"
                        className="text-sm h-9 pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Fecha Cierre */}
          <div className="col-span-12 sm:col-span-4">
            <FormField
              control={form.control}
              name="fechaCierre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    Fecha Cierre Estimada
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-9 text-left text-sm font-normal justify-start gap-2",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="size-3.5" />
                          {field.value ? (
                            format(field.value, "dd MMM yyyy", { locale: es })
                          ) : (
                            <span className="text-xs">Seleccionar fecha</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        locale={es}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
