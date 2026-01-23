import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "../ui/field-wrapper";
import { useI18n } from "@/lib/i18n/context";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

/**
 * Step 1: Company Information
 * Fields: razonSocial, personaContacto, email, numeroIdentificacionFiscal, website
 * Optimized responsive grid layout - minimal vertical scrolling on large screens
 */
export function Step1Content({ form }: StepContentProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* Razón Social - Spans 2 cols on xl */}
        <FieldWrapper className="xl:col-span-2">
          <FormField
            control={form.control}
            name="razonSocial"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] sm:text-xs md:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.fields.legalName")}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("forms.fields.legalNamePlaceholder")}
                    className="h-10 text-[11px] sm:text-xs md:text-sm bg-background/50 border-input/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        {/* Número Identificación Fiscal */}
        <FieldWrapper>
          <FormField
            control={form.control}
            name="numeroIdentificacionFiscal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] sm:text-xs md:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.fields.fiscalId")}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("forms.fields.fiscalIdPlaceholder")}
                    className="h-10 text-[11px] sm:text-xs md:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        {/* Persona Contacto */}
        <FieldWrapper>
          <FormField
            control={form.control}
            name="personaContacto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] sm:text-xs md:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.fields.contactPerson")}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("forms.fields.fullNamePlaceholder")}
                    className="h-10 text-[11px] sm:text-xs md:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        {/* Email */}
        <FieldWrapper>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] sm:text-xs md:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.fields.email")}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("forms.fields.emailPlaceholder")}
                    className="h-10 text-[11px] sm:text-xs md:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        {/* Website */}
        <FieldWrapper>
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] sm:text-xs md:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.fields.website")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder={t("forms.fields.websitePlaceholder")}
                    className="h-10 text-[11px] sm:text-xs md:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>
    </div>
  );
}
