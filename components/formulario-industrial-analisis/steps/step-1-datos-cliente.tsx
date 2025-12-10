import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Building2,
  User,
  Mail,
  Home,
  MapPin,
  Globe,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { StepContentProps } from "../types";

// ==================== SECTION HEADER ====================
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/40 mb-2">
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
 * Optimized layout with clear sections
 */
export function Step1Content({ form }: StepContentProps) {
  return (
    <div className="space-y-4">
      {/* ==================== EMPRESA ==================== */}
      <section>
        <SectionHeader icon={Building2} title="Datos de la Empresa" />
        <div className="space-y-2">
          {/* Razón Social + NIF + Website en una fila */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            <div className="col-span-2 sm:col-span-3">
              <FormField
                control={form.control}
                name="razonSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                      Razón Social <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre de la empresa"
                        className="text-sm h-8"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-1">
              <FormField
                control={form.control}
                name="numeroIdentificacionFiscal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                      NIF <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="B12345678"
                        className="text-sm h-8"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 sm:col-span-2">
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
                        <Globe className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                        <Input
                          type="url"
                          placeholder="www.empresa.com"
                          className="text-sm h-8 pl-7"
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
        </div>
      </section>

      {/* ==================== CONTACTO ==================== */}
      <section>
        <SectionHeader icon={User} title="Persona de Contacto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="personaContacto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                  Nombre <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                      placeholder="Nombre completo"
                      className="text-sm h-8 pl-7"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
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
                    <Mail className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="correo@empresa.com"
                      className="text-sm h-8 pl-7"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* ==================== UBICACIÓN ==================== */}
      <section>
        <SectionHeader icon={MapPin} title="Ubicación" />
        <div className="space-y-2">
          {/* Dirección completa en una fila compacta */}
          <div className="grid grid-cols-4 sm:grid-cols-12 gap-2">
            <div className="col-span-4 sm:col-span-5">
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
                        <Home className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                        <Input
                          placeholder="Calle, número"
                          className="text-sm h-8 pl-7"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 sm:col-span-3">
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
                        className="text-sm h-8"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <FormField
                control={form.control}
                name="codigoPostal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                      C.P. <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000"
                        className="text-sm h-8"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <FormField
                control={form.control}
                name="provinciaEstado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                      Prov. <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Provincia"
                        className="text-sm h-8"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {/* País en fila separada pero compacta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <FormField
              control={form.control}
              name="pais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    País <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="País"
                      className="text-sm h-8"
                      {...field}
                    />
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="distribuidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium">
                  Distribuidor
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre"
                    className="text-sm h-8"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactoDistribuidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium">
                  Contacto
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contacto"
                    className="text-sm h-8"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaCierre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium">
                  Fecha Cierre
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-8 text-left text-sm font-normal justify-start",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1.5 size-3" />
                        {field.value ? (
                          format(field.value, "dd/MM/yy", { locale: es })
                        ) : (
                          <span className="text-xs">Seleccionar</span>
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
      </section>
    </div>
  );
}
