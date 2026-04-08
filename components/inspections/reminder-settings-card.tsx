"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/lib/i18n/context";
import { useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BellRing,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  Clock3,
  Globe2,
  Loader2,
  Play,
  Save,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  InspectionReminderFrequency,
  InspectionReminderDispatchLog,
  InspectionReminderSettings,
  UpdateInspectionReminderSettingsPayload,
} from "@/interfaces/inspection";

const TIMEZONE_OPTIONS = ["Europe/Madrid", "America/Panama", "UTC"] as const;

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

function toMeridiemTime(sendTime: string): {
  hour: string;
  minute: string;
  meridiem: "AM" | "PM";
} {
  const [hourText, minuteText] = sendTime.split(":");
  const hour24 = Number(hourText);
  const minute = Number(minuteText);

  if (
    Number.isNaN(hour24) ||
    Number.isNaN(minute) ||
    hour24 < 0 ||
    hour24 > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return { hour: "09", minute: "00", meridiem: "AM" };
  }

  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const normalizedHour = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return {
    hour: String(normalizedHour).padStart(2, "0"),
    minute: String(minute).padStart(2, "0"),
    meridiem,
  };
}

function to24HourTime(
  hour: string,
  minute: string,
  meridiem: "AM" | "PM",
): string {
  const parsedHour = Number(hour);
  const parsedMinute = Number(minute);

  if (
    Number.isNaN(parsedHour) ||
    parsedHour < 1 ||
    parsedHour > 12 ||
    Number.isNaN(parsedMinute) ||
    parsedMinute < 0 ||
    parsedMinute > 59
  ) {
    return "09:00";
  }

  let hour24 = parsedHour % 12;
  if (meridiem === "PM") {
    hour24 += 12;
  }

  return `${String(hour24).padStart(2, "0")}:${String(parsedMinute).padStart(2, "0")}`;
}

interface ReminderSettingsCardProps {
  settings: InspectionReminderSettings | null;
  lastDispatch: InspectionReminderDispatchLog | null;
  isLoading: boolean;
  isSaving: boolean;
  isRunning: boolean;
  onSave: (payload: UpdateInspectionReminderSettingsPayload) => Promise<void>;
  onRunNow: () => Promise<void>;
}

export function ReminderSettingsCard({
  settings,
  lastDispatch,
  isLoading,
  isSaving,
  isRunning,
  onSave,
  onRunNow,
}: ReminderSettingsCardProps) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [frequency, setFrequency] =
    useState<InspectionReminderFrequency>("MONTHLY");
  const [dayOfMonthInput, setDayOfMonthInput] = useState("10");
  const [weeklyDay, setWeeklyDay] = useState("1");
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [meridiem, setMeridiem] = useState<"AM" | "PM">("AM");
  const [timezone, setTimezone] = useState("Europe/Madrid");

  const applySettings = (nextSettings: InspectionReminderSettings) => {
    const normalizedDay = Math.min(Math.max(nextSettings.dayOfMonth, 1), 31);
    const parsedTime = toMeridiemTime(nextSettings.sendTime);

    setIsEnabled(nextSettings.isEnabled);
    setFrequency(nextSettings.frequency ?? "MONTHLY");
    setDayOfMonthInput(String(normalizedDay));
    setWeeklyDay(String(nextSettings.weeklyDay ?? 1));
    setHour(parsedTime.hour);
    setMinute(parsedTime.minute);
    setMeridiem(parsedTime.meridiem);
    setTimezone(nextSettings.timezone || "Europe/Madrid");
  };

  useEffect(() => {
    if (!settings) {
      return;
    }

    applySettings(settings);
  }, [settings]);

  const dayOfMonth = Number(dayOfMonthInput);
  const isValidDayOfMonth = useMemo(() => {
    const parsed = Number(dayOfMonth);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 31;
  }, [dayOfMonth]);

  const parsedWeeklyDay = Number(weeklyDay);
  const isValidWeeklyDay = useMemo(() => {
    return (
      Number.isInteger(parsedWeeklyDay) &&
      parsedWeeklyDay >= 1 &&
      parsedWeeklyDay <= 7
    );
  }, [parsedWeeklyDay]);

  const isValidTimezone = timezone.trim().length > 0;

  const sendTime = useMemo(
    () => to24HourTime(hour, minute, meridiem),
    [hour, meridiem, minute],
  );

  const formattedTime12h = useMemo(
    () => `${hour}:${minute} ${meridiem}`,
    [hour, meridiem, minute],
  );

  const canSave =
    !isSaving &&
    !isLoading &&
    Boolean(settings) &&
    isValidDayOfMonth &&
    isValidWeeklyDay &&
    isValidTimezone;

  const timezonePreset = useMemo(() => {
    return TIMEZONE_OPTIONS.includes(
      timezone as (typeof TIMEZONE_OPTIONS)[number],
    )
      ? timezone
      : "custom";
  }, [timezone]);

  const weekdayOptions = useMemo(
    () => [
      { value: "1", label: t("inspectionsPage.reminders.weekdayMonday") },
      { value: "2", label: t("inspectionsPage.reminders.weekdayTuesday") },
      { value: "3", label: t("inspectionsPage.reminders.weekdayWednesday") },
      { value: "4", label: t("inspectionsPage.reminders.weekdayThursday") },
      { value: "5", label: t("inspectionsPage.reminders.weekdayFriday") },
      { value: "6", label: t("inspectionsPage.reminders.weekdaySaturday") },
      { value: "7", label: t("inspectionsPage.reminders.weekdaySunday") },
    ],
    [t],
  );

  const selectedWeekdayLabel =
    weekdayOptions.find((option) => option.value === weeklyDay)?.label ??
    t("inspectionsPage.reminders.weekdayMonday");

  const scheduleSummary =
    frequency === "MONTHLY"
      ? t("inspectionsPage.reminders.previewMonthly", {
          day: Number.isFinite(dayOfMonth) ? dayOfMonth : "--",
          time: formattedTime12h,
          timezone,
        })
      : t("inspectionsPage.reminders.previewWeekly", {
          weekday: selectedWeekdayLabel,
          time: formattedTime12h,
          timezone,
        });

  const statusVariant = useMemo(() => {
    if (!lastDispatch?.status) return "secondary" as const;
    if (lastDispatch.status === "SENT") return "default" as const;
    if (lastDispatch.status === "FAILED") return "destructive" as const;
    return "secondary" as const;
  }, [lastDispatch?.status]);

  const dispatchStatusLabel = useMemo(() => {
    if (!lastDispatch?.status) {
      return t("inspectionsPage.reminders.noStatus");
    }

    switch (lastDispatch.status) {
      case "SENT":
        return t("inspectionsPage.reminders.statusSent");
      case "FAILED":
        return t("inspectionsPage.reminders.statusFailed");
      default:
        return t("inspectionsPage.reminders.statusProcessing");
    }
  }, [lastDispatch?.status, t]);

  const formattedLastDispatch = useMemo(() => {
    if (!lastDispatch?.startedAt) {
      return t("inspectionsPage.reminders.neverExecuted");
    }

    try {
      const fmtLocale = locale === "en" ? "en-US" : "es-ES";
      return new Intl.DateTimeFormat(fmtLocale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(lastDispatch.startedAt));
    } catch {
      return lastDispatch.startedAt;
    }
  }, [lastDispatch, locale, t]);

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    await onSave({
      isEnabled,
      frequency,
      dayOfMonth: Number(dayOfMonth),
      weeklyDay: Number(weeklyDay),
      sendTime,
      timezone: timezone.trim() || "Europe/Madrid",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen && settings) {
          applySettings(settings);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading && !settings}
          title={t("inspectionsPage.reminders.openSettings")}
        >
          {isLoading && !settings ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <BellRing className="size-4" />
          )}
          <span className="hidden md:inline">
            {t("inspectionsPage.reminders.openSettings")}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col p-0 overflow-hidden md:max-w-2xl max-h-[90vh] gap-0">
        <DialogHeader className="shrink-0 px-3 py-3 border-b bg-linear-to-r from-primary/10 via-primary/5 to-transparent w-full">
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="space-y-1 text-left w-full">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <BellRing className="size-4 text-primary" />
                </div>
                {t("inspectionsPage.reminders.title")}
                <Badge
                  variant={isEnabled ? "default" : "secondary"}
                  className="mr-8"
                >
                  {isEnabled
                    ? t("inspectionsPage.reminders.enabled")
                    : t("inspectionsPage.reminders.disabled")}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-pretty">
                {t("inspectionsPage.reminders.dialogDescription")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 overflow-y-auto h-full">
          <div className="p-2 space-y-3">
            <Card className="gap-0 border-border/70 py-0">
              <CardHeader className="px-3 py-3 border-b bg-muted/20">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarCheck2 className="size-4 text-primary" />
                  {t("inspectionsPage.reminders.generalSection")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-3 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border/70 p-3 bg-background">
                  <div className="space-y-1 pr-3">
                    <p className="text-sm font-medium">
                      {t("inspectionsPage.reminders.enableLabel")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("inspectionsPage.reminders.enableHint")}
                    </p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                    aria-label={t("inspectionsPage.reminders.enableLabel")}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {t("inspectionsPage.reminders.frequencyLabel")}
                  </Label>
                  <ToggleGroup
                    type="single"
                    value={frequency}
                    onValueChange={(value) => {
                      if (value === "MONTHLY" || value === "WEEKLY") {
                        setFrequency(value);
                      }
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <ToggleGroupItem
                      value="MONTHLY"
                      className="w-full gap-2 h-10"
                      aria-label={t("inspectionsPage.reminders.monthlyOption")}
                    >
                      <CalendarDays className="size-4" />
                      {t("inspectionsPage.reminders.monthlyOption")}
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="WEEKLY"
                      className="w-full gap-2 h-10"
                      aria-label={t("inspectionsPage.reminders.weeklyOption")}
                    >
                      <CalendarRange className="size-4" />
                      {t("inspectionsPage.reminders.weeklyOption")}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 border-border/70 py-0">
              <CardHeader className="px-3 py-3 border-b bg-muted/20">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" />
                  {t("inspectionsPage.reminders.scheduleSection")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-3 space-y-2.5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {frequency === "MONTHLY" ? (
                      <>
                        <Label className="text-xs text-muted-foreground">
                          {t("inspectionsPage.reminders.dayLabel")}
                        </Label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={31}
                          value={dayOfMonthInput}
                          onChange={(event) => {
                            const nextValue = event.target.value.replace(
                              /[^0-9]/g,
                              "",
                            );
                            setDayOfMonthInput(nextValue);
                          }}
                          onBlur={() => {
                            const parsed = Number(dayOfMonthInput);

                            if (!Number.isFinite(parsed)) {
                              setDayOfMonthInput("1");
                              return;
                            }

                            const clamped = Math.min(
                              Math.max(Math.trunc(parsed), 1),
                              31,
                            );
                            setDayOfMonthInput(String(clamped));
                          }}
                          placeholder="1-31"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t("inspectionsPage.reminders.dayMonthlyHint")}
                        </p>
                        {!isValidDayOfMonth && (
                          <p className="text-xs text-destructive">
                            {t("inspectionsPage.reminders.dayValidation")}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <Label className="text-xs text-muted-foreground">
                          {t("inspectionsPage.reminders.weeklyDayLabel")}
                        </Label>
                        <Select value={weeklyDay} onValueChange={setWeeklyDay}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {weekdayOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {t("inspectionsPage.reminders.timeLabel")}
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={hour} onValueChange={setHour}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOUR_OPTIONS.map((hourOption) => (
                            <SelectItem key={hourOption} value={hourOption}>
                              {hourOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={minute} onValueChange={setMinute}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {MINUTE_OPTIONS.map((minuteOption) => (
                            <SelectItem key={minuteOption} value={minuteOption}>
                              {minuteOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <ToggleGroup
                        type="single"
                        value={meridiem}
                        onValueChange={(value) => {
                          if (value === "AM" || value === "PM") {
                            setMeridiem(value);
                          }
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <ToggleGroupItem value="AM" className="w-full">
                          {t("inspectionsPage.reminders.am")}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="PM" className="w-full">
                          {t("inspectionsPage.reminders.pm")}
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end">
                  <div className="space-y-2 lg:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      {t("inspectionsPage.reminders.timezonePresetLabel")}
                    </Label>
                    <Select
                      value={timezonePreset}
                      onValueChange={(value) => {
                        if (value !== "custom") {
                          setTimezone(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONE_OPTIONS.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">
                          {t("inspectionsPage.reminders.timezoneCustom")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 lg:col-span-3">
                    <Label
                      htmlFor="inspection-reminder-timezone"
                      className="text-xs text-muted-foreground"
                    >
                      {t("inspectionsPage.reminders.timezoneLabel")}
                    </Label>
                    <div className="relative">
                      <Globe2 className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        id="inspection-reminder-timezone"
                        value={timezone}
                        onChange={(event) => setTimezone(event.target.value)}
                        placeholder="Europe/Madrid"
                        className={cn(
                          "pl-9",
                          !isValidTimezone && "border-destructive",
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary">
                    {t("inspectionsPage.reminders.schedulePreviewLabel")}
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {scheduleSummary}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 border-border/70 py-0">
              <CardHeader className="px-3 py-4 border-b bg-muted/20">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" />
                  {t("inspectionsPage.reminders.executionSection")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/70 p-3 bg-card">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("inspectionsPage.reminders.lastExecution")}
                  </p>
                  <p className="text-sm font-medium">{formattedLastDispatch}</p>
                </div>

                <div className="rounded-lg border border-border/70 p-3 bg-card">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("inspectionsPage.reminders.lastStatus")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant}>{dispatchStatusLabel}</Badge>
                    {lastDispatch?.failedCount ? (
                      <span className="text-xs text-muted-foreground">
                        {lastDispatch.failedCount}{" "}
                        {t("inspectionsPage.reminders.failedSuffix")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t bg-background px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-4 sm:pt-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="outline"
              size="default"
              onClick={onRunNow}
              disabled={isRunning || isLoading}
              className="h-10 w-full"
            >
              {isRunning ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )}
              {t("inspectionsPage.reminders.runNow")}
            </Button>

            <Button
              size="default"
              onClick={handleSave}
              disabled={!canSave}
              className="h-10 w-full"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {t("inspectionsPage.reminders.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
