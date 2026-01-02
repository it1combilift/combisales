import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useI18n } from "@/lib/i18n/context";

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

/**
 * Step 1: Datos del Cliente
 * Company information, contact details, and commercial data
 */
export function Step1Content({ form }: StepContentProps) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-5">
      {/* ==================== EMPRESA ==================== */}
      <section>
        <SectionHeader
          icon={Building2}
          title={t("forms.clientData.sections.company")}
        />
        <div className="grid grid-cols-12 gap-x-2 gap-y-3">
          {/* Razón Social */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-5">
            <FormField
              control={form.control}
              name="razonSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    {t("forms.clientData.fields.companyName.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          "forms.clientData.fields.companyName.placeholder"
                        )}
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
                    {t("forms.clientData.fields.fiscalId.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          "forms.clientData.fields.fiscalId.placeholder"
                        )}
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
                    {t("forms.clientData.fields.website.label")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder={t(
                          "forms.clientData.fields.website.placeholder"
                        )}
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
        <SectionHeader
          icon={User}
          title={t("forms.clientData.sections.contact")}
        />
        <div className="grid grid-cols-12 gap-x-2 gap-y-3">
          {/* Nombre */}
          <div className="col-span-12 sm:col-span-5">
            <FormField
              control={form.control}
              name="personaContacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    {t("forms.clientData.fields.contactName.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          "forms.clientData.fields.contactName.placeholder"
                        )}
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
                    {t("forms.clientData.fields.email.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder={t(
                          "forms.clientData.fields.email.placeholder"
                        )}
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
        <SectionHeader
          icon={MapPin}
          title={t("forms.clientData.sections.location")}
        />
        <div className="grid grid-cols-12 gap-x-2 gap-y-3">
          {/* Dirección */}
          <div className="col-span-12 sm:col-span-8 lg:col-span-6">
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium flex items-center gap-1">
                    {t("forms.clientData.fields.address.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          "forms.clientData.fields.address.placeholder"
                        )}
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
                    {t("forms.clientData.fields.city.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.clientData.fields.city.placeholder"
                      )}
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
                    {t("forms.clientData.fields.postalCode.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.clientData.fields.postalCode.placeholder"
                      )}
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
                    {t("forms.clientData.fields.province.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.clientData.fields.province.placeholder"
                      )}
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
                    {t("forms.clientData.fields.country.label")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          "forms.clientData.fields.country.placeholder"
                        )}
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
        <SectionHeader
          icon={Users}
          title={t("forms.clientData.sections.commercial")}
        />
        <div className="grid grid-cols-12 gap-x-2 gap-y-3">
          {/* Distribuidor */}
          <div className="col-span-6 sm:col-span-4">
            <FormField
              control={form.control}
              name="distribuidor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-medium">
                    {t("forms.clientData.fields.distributor.label")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          "forms.clientData.fields.distributor.placeholder"
                        )}
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
                    {t("forms.clientData.fields.distributorContact.label")}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          "forms.clientData.fields.distributorContact.placeholder"
                        )}
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
                    {t("forms.clientData.fields.closingDate.label")}
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
                            format(field.value, "dd MMM yyyy", {
                              locale: locale === "en" ? undefined : es,
                            })
                          ) : (
                            <span className="text-xs">
                              {t(
                                "forms.clientData.fields.closingDate.placeholder"
                              )}
                            </span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        locale={locale === "en" ? undefined : es}
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
