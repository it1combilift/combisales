"use client";

import { cn } from "@/lib/utils";
import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/context";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
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
    <div className="hidden md:flex items-center gap-1.5 pb-1.5 border-b border-border/40">
      <div className="size-5 rounded bg-primary/10 flex items-center justify-center">
        <Icon className="size-3 text-primary" />
      </div>
      <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wide text-balance">
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
              <Input
                type={type}
                placeholder={placeholder}
                className={cn("text-xs sm:text-sm h-8 sm:h-9")}
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
 * Optimized responsive grid layout - minimal vertical scrolling on large screens
 */
export function Step1Content({ form }: StepContentProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3 md:space-y-4">
      {/* ==================== EMPRESA Y CONTACTO ==================== */}
      <section>
        <SectionHeader
          icon={Building2}
          title={t("forms.clientData.sections.company")}
        />
        {/* Grid: 1 col mobile, 2 cols md, 3 cols xl - Optimized for large screens */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
          {/* Razón Social - Spans 2 cols on XL */}
          <TextInput
            control={form.control}
            name="razonSocial"
            label={t("forms.clientData.fields.companyName.label")}
            placeholder={t("forms.clientData.fields.companyName.placeholder")}
            icon={Building2}
            required
            className="xl:col-span-2"
          />

          {/* NIF */}
          <TextInput
            control={form.control}
            name="numeroIdentificacionFiscal"
            label={t("forms.clientData.fields.fiscalId.label")}
            placeholder={t("forms.clientData.fields.fiscalId.placeholder")}
            icon={Hash}
            required
          />

          {/* Persona Contacto */}
          <TextInput
            control={form.control}
            name="personaContacto"
            label={t("forms.clientData.fields.contactName.label")}
            placeholder={t("forms.clientData.fields.contactName.placeholder")}
            icon={User}
            required
          />

          {/* Email */}
          <TextInput
            control={form.control}
            name="email"
            label={t("forms.clientData.fields.email.label")}
            placeholder={t("forms.clientData.fields.email.placeholder")}
            icon={Mail}
            required
            type="email"
          />

          {/* Website */}
          <TextInput
            control={form.control}
            name="website"
            label={t("forms.clientData.fields.website.label")}
            placeholder={t("forms.clientData.fields.website.placeholder")}
            icon={Globe}
            type="url"
          />
        </div>
      </section>

      {/* ==================== UBICACIÓN ==================== */}
      <section>
        <SectionHeader
          icon={MapPin}
          title={t("forms.clientData.sections.location")}
        />
        <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 lg:gap-4">
          {/* Dirección - Spans 3 cols on XL */}
          <TextInput
            control={form.control}
            name="direccion"
            label={t("forms.clientData.fields.address.label")}
            placeholder={t("forms.clientData.fields.address.placeholder")}
            icon={MapPin}
            required
            className="xl:col-span-2"
          />

          {/* Localidad - Spans 2 cols on XL */}
          <TextInput
            control={form.control}
            name="localidad"
            label={t("forms.clientData.fields.city.label")}
            placeholder={t("forms.clientData.fields.city.placeholder")}
            required
            className="xl:col-span-2"
          />

          {/* Código Postal */}
          <TextInput
            control={form.control}
            name="codigoPostal"
            label={t("forms.clientData.fields.postalCode.label")}
            placeholder={t("forms.clientData.fields.postalCode.placeholder")}
            required
            className="xl:col-span-2"
          />

          {/* Provincia - Spans 3 cols on XL */}
          <TextInput
            control={form.control}
            name="provinciaEstado"
            label={t("forms.clientData.fields.province.label")}
            placeholder={t("forms.clientData.fields.province.placeholder")}
            required
            className="xl:col-span-3"
          />

          {/* País - Spans 3 cols on XL */}
          <TextInput
            control={form.control}
            name="pais"
            label={t("forms.clientData.fields.country.label")}
            placeholder={t("forms.clientData.fields.country.placeholder")}
            required
            className="xl:col-span-3"
          />
        </div>
      </section>

      {/* ==================== COMERCIAL ==================== */}
      <section>
        <SectionHeader
          icon={Users}
          title={t("forms.clientData.sections.commercial")}
        />
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {/* Distribuidor */}
          <TextInput
            control={form.control}
            name="distribuidor"
            label={t("forms.clientData.fields.distributor.label")}
            placeholder={t("forms.clientData.fields.distributor.placeholder")}
          />

          {/* Contacto Distribuidor */}
          <TextInput
            control={form.control}
            name="contactoDistribuidor"
            label={t("forms.clientData.fields.distributorContact.label")}
            placeholder={t(
              "forms.clientData.fields.distributorContact.placeholder",
            )}
          />
        </div>
      </section>
    </div>
  );
}
