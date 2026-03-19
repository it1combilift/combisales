"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StepContentProps } from "../types";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";

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

export function Step1Content({ form, enableSubjectMail }: StepContentProps) {
  const { t, locale } = useI18n();

  return (
    <div className="flex flex-col h-full space-y-3 sm:space-y-4">
      {enableSubjectMail && (
        <FormField
          control={form.control}
          name="subjectMail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("forms.clientData.fields.subjectMail.label")}
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    "forms.clientData.fields.subjectMail.placeholder",
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="notasOperacion"
        render={({ field }) => (
          <FormItem className="flex-1 flex flex-col min-h-0">
            <FormLabel className="text-sm flex items-center gap-1 shrink-0">
              {t("forms.industrial.fields.operationNotes.label")}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={t(
                  "forms.industrial.fields.operationNotes.placeholder",
                )}
                className="flex-1 text-sm bg-background/50 resize-none leading-relaxed text-pretty"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm shrink-0" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fechaCierre"
        render={({ field }) => (
          <FormItem className="shrink-0">
            <FormLabel className="text-sm flex items-center gap-1">
              {t("forms.industrial.fields.closingDate.label")}
              <span className="text-muted-foreground text-[10px] ml-1">
                {t("forms.industrial.fields.closingDate.optional")}
              </span>
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-10 w-full sm:w-auto min-w-[220px] justify-start text-left font-normal text-sm rounded-lg border-input/80",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <CalendarDays className="size-4" />
                    {field.value
                      ? format(field.value, "PPP", {
                          locale: locale === "en" ? undefined : es,
                        })
                      : t("forms.industrial.fields.closingDate.placeholder")}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ?? undefined}
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
    </div>
  );
}

export { Step1Content as Step2Content };
