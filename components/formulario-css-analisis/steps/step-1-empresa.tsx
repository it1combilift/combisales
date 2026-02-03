import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { StepContentProps } from "../types";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldWrapper } from "../ui/field-wrapper";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

/**
 * Step 1: Customer Data (Consolidated)
 * Contains: Company Info, Location, and Commercial details
 */
export function Step1Content({ form }: StepContentProps) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-3 sm:space-y-4 pb-2">
      {/* ==================== EMPRESA ==================== */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {/* Razón Social */}
          <FieldWrapper>
            <FormField
              control={form.control}
              name="razonSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.fields.legalName")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("forms.fields.legalNamePlaceholder")}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
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
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.fields.fiscalId")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("forms.fields.fiscalIdPlaceholder")}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
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
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.fields.contactPerson")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("forms.fields.fullNamePlaceholder")}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
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
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.fields.email")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("forms.fields.emailPlaceholder")}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
          </FieldWrapper>

          {/* Website */}
          <FieldWrapper className="md:col-span-2">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.fields.website")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder={t("forms.fields.websitePlaceholder")}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
          </FieldWrapper>
        </div>
      </section>

      {/* ==================== UBICACIÓN ==================== */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Dirección - Full width on mobile, 2 cols on md, 4 cols (full row) on lg? actually make it span 2 on lg */}
          <FieldWrapper className="lg:col-span-2">
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.clientData.fields.address.label")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.clientData.fields.address.placeholder",
                      )}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper>
            <FormField
              control={form.control}
              name="localidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.clientData.fields.city.label")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.clientData.fields.city.placeholder",
                      )}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper>
            <FormField
              control={form.control}
              name="codigoPostal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.clientData.fields.postalCode.label")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.clientData.fields.postalCode.placeholder",
                      )}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper>
            <FormField
              control={form.control}
              name="provinciaEstado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.clientData.fields.province.label")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.clientData.fields.province.placeholder",
                      )}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper>
            <FormField
              control={form.control}
              name="pais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.clientData.fields.country.label")}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.clientData.fields.country.placeholder",
                      )}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </FieldWrapper>
        </div>
      </section>

      {/* ==================== COMERCIAL ==================== */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <FieldWrapper>
            <FormField
              control={form.control}
              name="distribuidor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.fields.distributor")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("forms.fields.distributorPlaceholder")}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper>
            <FormField
              control={form.control}
              name="contactoDistribuidor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.fields.distributorContact")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "forms.fields.distributorContactPlaceholder",
                      )}
                      className="h-10 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper>
            <FormField
              control={form.control}
              name="fechaCierre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.fields.closingDate")}
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-sm rounded-lg border-input/80 h-10",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarDays className="size-4 mr-2" />
                          {field.value
                            ? format(field.value, "PPP", {
                                locale: locale === "en" ? undefined : es,
                              })
                            : t("forms.selectDate")}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={locale === "en" ? undefined : es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper>
            <FormField
              control={form.control}
              name="datosClienteUsuarioFinal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                    {t("forms.fields.clientEndUserData")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "forms.fields.clientEndUserDataPlaceholder",
                      )}
                      className="min-h-[80px] text-sm bg-background/50 resize-none border-input/80 focus:border-primary rounded-lg leading-relaxed"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
          </FieldWrapper>
        </div>
      </section>
    </div>
  );
}
