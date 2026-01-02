"use client";

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
  const { t, locale } = useI18n();

  return (
    <div className="space-y-4">
      {/* ==================== EMPRESA ==================== */}
      <section>
        <SectionHeader
          icon={Building2}
          title={t("forms.clientData.sections.company")}
        />
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            control={form.control}
            name="razonSocial"
            label={t("forms.clientData.fields.companyName.label")}
            placeholder={t("forms.clientData.fields.companyName.placeholder")}
            icon={Building2}
            required
          />
          <TextInput
            control={form.control}
            name="numeroIdentificacionFiscal"
            label={t("forms.clientData.fields.fiscalId.label")}
            placeholder={t("forms.clientData.fields.fiscalId.placeholder")}
            icon={Hash}
            required
          />
          <TextInput
            control={form.control}
            name="website"
            label={t("forms.clientData.fields.website.label")}
            placeholder={t("forms.clientData.fields.website.placeholder")}
            icon={Globe}
            type="url"
            className="col-span-2"
          />
        </div>
      </section>

      {/* ==================== CONTACTO ==================== */}
      <section>
        <SectionHeader
          icon={User}
          title={t("forms.clientData.sections.contact")}
        />
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            control={form.control}
            name="personaContacto"
            label={t("forms.clientData.fields.contactName.label")}
            placeholder={t("forms.clientData.fields.contactName.placeholder")}
            icon={User}
            required
          />
          <TextInput
            control={form.control}
            name="email"
            label={t("forms.clientData.fields.email.label")}
            placeholder={t("forms.clientData.fields.email.placeholder")}
            icon={Mail}
            required
            type="email"
          />
        </div>
      </section>

      {/* ==================== UBICACIÓN ==================== */}
      <section>
        <SectionHeader
          icon={MapPin}
          title={t("forms.clientData.sections.location")}
        />
        <div className="grid grid-cols-3 gap-2">
          <TextInput
            control={form.control}
            name="direccion"
            label={t("forms.clientData.fields.address.label")}
            placeholder={t("forms.clientData.fields.address.placeholder")}
            icon={MapPin}
            required
            className="col-span-3"
          />
          <TextInput
            control={form.control}
            name="localidad"
            label={t("forms.clientData.fields.city.label")}
            placeholder={t("forms.clientData.fields.city.placeholder")}
            required
            className="col-span-2"
          />
          <TextInput
            control={form.control}
            name="provinciaEstado"
            label={t("forms.clientData.fields.province.label")}
            placeholder={t("forms.clientData.fields.province.placeholder")}
            required
          />
          <TextInput
            control={form.control}
            name="codigoPostal"
            label={t("forms.clientData.fields.postalCode.label")}
            placeholder={t("forms.clientData.fields.postalCode.placeholder")}
            required
          />
          <TextInput
            control={form.control}
            name="pais"
            label={t("forms.clientData.fields.country.label")}
            placeholder={t("forms.clientData.fields.country.placeholder")}
            required
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </section>

      {/* ==================== COMERCIAL ==================== */}
      <section>
        <SectionHeader
          icon={Users}
          title={t("forms.clientData.sections.commercial")}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <TextInput
            control={form.control}
            name="distribuidor"
            label={t("forms.clientData.fields.distributor.label")}
            placeholder={t("forms.clientData.fields.distributor.placeholder")}
          />
          <TextInput
            control={form.control}
            name="contactoDistribuidor"
            label={t("forms.clientData.fields.distributorContact.label")}
            placeholder={t(
              "forms.clientData.fields.distributorContact.placeholder"
            )}
          />

          {/* Fecha de cierre - Special field */}
          <FormField
            control={form.control}
            name="fechaCierre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] sm:text-[11px] font-medium">
                  {t("forms.clientData.fields.closingDate.label")}
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
                          ? format(field.value, "dd/MM/yyyy", {
                              locale: locale === "en" ? undefined : es,
                            })
                          : t(
                              "forms.clientData.fields.closingDate.placeholder"
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
