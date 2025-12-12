import { StepContentProps } from "../types";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "../ui/field-wrapper";
import { Building2, User, Mail, Hash, Link2 } from "lucide-react";

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
  return (
    <div className="space-y-4 sm:space-y-5">
      <FieldWrapper icon={Building2}>
        <FormField
          control={form.control}
          name="razonSocial"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                Razón social
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre legal de la empresa"
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
                  Persona de contacto
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre completo"
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
                  Email
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="correo@empresa.com"
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
                  NIF/CIF
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Identificación fiscal"
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
                  Sitio web
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.ejemplo.com"
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
