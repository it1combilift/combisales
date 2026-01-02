import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "../ui/field-wrapper";
import { Home, Navigation, Hash, MapPinned, Flag } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

/**
 * Step 2: Location/Address Information
 * Fields: direccion, localidad, codigoPostal, provinciaEstado, pais
 */
export function Step2Content({ form }: StepContentProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 sm:space-y-5">
      <FieldWrapper icon={Home}>
        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                {t("forms.clientData.fields.address.label")}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("forms.clientData.fields.address.placeholder")}
                  className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="sm:col-span-2">
          <FieldWrapper icon={Navigation}>
            <FormField
              control={form.control}
              name="localidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    {t("forms.clientData.fields.city.label")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.clientData.fields.city.placeholder"
                      )}
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

        <FieldWrapper icon={Hash}>
          <FormField
            control={form.control}
            name="codigoPostal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.clientData.fields.postalCode.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      "forms.clientData.fields.postalCode.placeholder"
                    )}
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
        <FieldWrapper icon={MapPinned}>
          <FormField
            control={form.control}
            name="provinciaEstado"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.clientData.fields.province.label")}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      "forms.clientData.fields.province.placeholder"
                    )}
                    className="h-11 sm:h-12 text-xs sm:text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        <FieldWrapper icon={Flag}>
          <FormField
            control={form.control}
            name="pais"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  {t("forms.clientData.fields.country.label")}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      "forms.clientData.fields.country.placeholder"
                    )}
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
