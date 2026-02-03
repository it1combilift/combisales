"use client";

import { cn } from "@/lib/utils";
import { StepContentProps } from "../types";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Building2, User, Mail, MapPin, Globe, Hash } from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

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
          <FormLabel className="text-sm font-medium flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={type}
                placeholder={placeholder}
                className={cn("text-sm h-8 sm:h-9")}
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage className="text-sm" />
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
    <div className="space-y-3 md:space-y-4 min-h-full pb-2">
      {/* ==================== EMPRESA Y CONTACTO ==================== */}
      <section>
        {/* Grid: 1 col mobile, 2 cols md, 3 cols xl - Optimized for large screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
          {/* Razón Social - Spans 2 cols on XL */}
          <TextInput
            control={form.control}
            name="razonSocial"
            label={t("forms.clientData.fields.companyName.label")}
            placeholder={t("forms.clientData.fields.companyName.placeholder")}
            icon={Building2}
            required
            className="md:col-span-2"
          />
          {/* Persona Contacto */}
          <TextInput
            control={form.control}
            name="personaContacto"
            label={t("forms.clientData.fields.contactName.label")}
            placeholder={t("forms.clientData.fields.contactName.placeholder")}
            icon={User}
            required
            className="md:col-span-2"
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
            className="md:col-span-2"
          />
        </div>
      </section>

      {/* ==================== UBICACIÓN ==================== */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
          <TextInput
            control={form.control}
            name="direccion"
            label={t("forms.clientData.fields.address.label")}
            placeholder={t("forms.clientData.fields.address.placeholder")}
            icon={MapPin}
            required
            className="md:col-span-2"
          />

          <TextInput
            control={form.control}
            name="localidad"
            label={t("forms.clientData.fields.city.label")}
            placeholder={t("forms.clientData.fields.city.placeholder")}
            required
            className="md:col-span-2"
          />

          {/* Código Postal */}
          <TextInput
            control={form.control}
            name="codigoPostal"
            label={t("forms.clientData.fields.postalCode.label")}
            placeholder={t("forms.clientData.fields.postalCode.placeholder")}
            required
          />

          {/* Provincia - Spans 3 cols on XL */}
          <TextInput
            control={form.control}
            name="provinciaEstado"
            label={t("forms.clientData.fields.province.label")}
            placeholder={t("forms.clientData.fields.province.placeholder")}
            required
          />

          {/* País - Spans 3 cols on XL */}
          <TextInput
            control={form.control}
            name="pais"
            label={t("forms.clientData.fields.country.label")}
            placeholder={t("forms.clientData.fields.country.placeholder")}
            required
            className="md:col-span-2"
          />
        </div>
      </section>

      {/* ==================== COMERCIAL ==================== */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
