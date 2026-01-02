import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "../ui/field-wrapper";
import { Building2, User, Mail, Hash, Link2 } from "lucide-react";
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
 */
export function Step1Content({ form }: StepContentProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 sm:space-y-5">
      <FieldWrapper icon={Building2}>
        <FormField
          control={form.control}
          name="razonSocial"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                {t("forms.fields.legalName")}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("forms.fields.legalNamePlaceholder")}
                  className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <FieldWrapper icon={User}>
          <FormField
            control={form.control}
            name="personaContacto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.fields.contactPerson")}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("forms.fields.fullNamePlaceholder")}
                    className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        <FieldWrapper icon={Mail}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.fields.email")}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("forms.fields.emailPlaceholder")}
                    className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <FieldWrapper icon={Hash}>
          <FormField
            control={form.control}
            name="numeroIdentificacionFiscal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.fields.fiscalId")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("forms.fields.fiscalIdPlaceholder")}
                    className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        <FieldWrapper icon={Link2}>
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.fields.website")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder={t("forms.fields.websitePlaceholder")}
                    className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
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
