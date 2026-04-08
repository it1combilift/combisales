import { prisma } from "@/lib/prisma";
import { getISOWeek } from "date-fns";
import {
  Prisma,
  InspectionReminderDispatchStatus,
  InspectionReminderFrequency,
} from "@prisma/client";
import { sendInspectionScheduledReminderEmail } from "@/lib/inspection-notifications";

const SETTINGS_KEY = "default";
const DEFAULT_TIMEZONE = "Europe/Madrid";
const DEFAULT_SEND_TIME = "09:00";
const DEFAULT_FREQUENCY = InspectionReminderFrequency.MONTHLY;
const DEFAULT_DAY_OF_MONTH = 10;
const DEFAULT_WEEKLY_DAY = 1;

export interface InspectionReminderSettingsInput {
  isEnabled: boolean;
  frequency: InspectionReminderFrequency;
  dayOfMonth: number;
  weeklyDay: number;
  sendTime: string;
  timezone: string;
}

export interface InspectionReminderRunResult {
  status: "sent" | "skipped" | "failed";
  frequency: InspectionReminderFrequency;
  reason:
    | "sent"
    | "disabled"
    | "not_due"
    | "already_sent"
    | "in_progress"
    | "failed_already"
    | "send_failed";
  year: number;
  month: number;
  recipientCount: number;
  successfulCount: number;
  failedCount: number;
  dispatchId: string | null;
  week: number | null;
}

function isValidTimeFormat(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function assertValidTimezone(timezone: string): void {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    throw new Error("Invalid timezone");
  }
}

function sanitizeSettingsInput(
  input: InspectionReminderSettingsInput,
): InspectionReminderSettingsInput {
  if (
    !Number.isInteger(input.dayOfMonth) ||
    input.dayOfMonth < 1 ||
    input.dayOfMonth > 31
  ) {
    throw new Error("Invalid dayOfMonth");
  }

  if (
    !Number.isInteger(input.weeklyDay) ||
    input.weeklyDay < 1 ||
    input.weeklyDay > 7
  ) {
    throw new Error("Invalid weeklyDay");
  }

  if (!isValidTimeFormat(input.sendTime)) {
    throw new Error("Invalid sendTime");
  }

  if (
    input.frequency !== InspectionReminderFrequency.MONTHLY &&
    input.frequency !== InspectionReminderFrequency.WEEKLY
  ) {
    throw new Error("Invalid frequency");
  }

  assertValidTimezone(input.timezone);

  return {
    isEnabled: Boolean(input.isEnabled),
    frequency: input.frequency,
    dayOfMonth: input.dayOfMonth,
    weeklyDay: input.weeklyDay,
    sendTime: input.sendTime,
    timezone: input.timezone,
  };
}

function parseSendTime(sendTime: string): { hour: number; minute: number } {
  const [hourText, minuteText] = sendTime.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return { hour: 9, minute: 0 };
  }

  return { hour, minute };
}

function getZonedDateParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const byType = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: Number(byType.year),
    month: Number(byType.month),
    day: Number(byType.day),
    weekDay:
      {
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
        Sun: 7,
      }[byType.weekday] ?? DEFAULT_WEEKLY_DAY,
    hour: Number(byType.hour),
    minute: Number(byType.minute),
  };
}

function getWeeklyPeriod(year: number, month: number, day: number) {
  const week = getISOWeek(new Date(Date.UTC(year, month - 1, day)));
  const periodKey = `WEEKLY-${year}-W${String(week).padStart(2, "0")}`;

  return { week, periodKey };
}

function getMonthlyPeriod(year: number, month: number) {
  return {
    week: null,
    periodKey: `MONTHLY-${year}-${String(month).padStart(2, "0")}`,
  };
}

function isDueForExecution(
  settings: Pick<
    InspectionReminderSettingsInput,
    "frequency" | "dayOfMonth" | "weeklyDay" | "sendTime"
  >,
  sendTime: string,
  nowInTimezone: {
    year: number;
    month: number;
    day: number;
    weekDay: number;
    hour: number;
    minute: number;
  },
): boolean {
  const lastDayOfMonth = new Date(
    Date.UTC(nowInTimezone.year, nowInTimezone.month, 0),
  ).getUTCDate();
  const effectiveMonthlyDay = Math.min(settings.dayOfMonth, lastDayOfMonth);

  if (
    settings.frequency === InspectionReminderFrequency.MONTHLY &&
    nowInTimezone.day !== effectiveMonthlyDay
  ) {
    return false;
  }

  if (
    settings.frequency === InspectionReminderFrequency.WEEKLY &&
    nowInTimezone.weekDay !== settings.weeklyDay
  ) {
    return false;
  }

  const { hour, minute } = parseSendTime(sendTime);

  if (nowInTimezone.hour > hour) {
    return true;
  }

  if (nowInTimezone.hour === hour && nowInTimezone.minute >= minute) {
    return true;
  }

  return false;
}

function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function getInspectionReminderSettings() {
  const existing = await prisma.inspectionReminderSettings.findUnique({
    where: { key: SETTINGS_KEY },
  });

  if (existing) {
    return existing;
  }

  return prisma.inspectionReminderSettings.create({
    data: {
      key: SETTINGS_KEY,
      isEnabled: true,
      frequency: DEFAULT_FREQUENCY,
      dayOfMonth: DEFAULT_DAY_OF_MONTH,
      weeklyDay: DEFAULT_WEEKLY_DAY,
      sendTime: DEFAULT_SEND_TIME,
      timezone: DEFAULT_TIMEZONE,
    },
  });
}

export async function updateInspectionReminderSettings(
  input: InspectionReminderSettingsInput,
  updatedById?: string,
) {
  const safeInput = sanitizeSettingsInput(input);

  const settings = await getInspectionReminderSettings();

  return prisma.inspectionReminderSettings.update({
    where: { id: settings.id },
    data: {
      ...safeInput,
      updatedById: updatedById ?? null,
    },
  });
}

export async function runInspectionMonthlyReminders(options?: {
  force?: boolean;
  triggeredBy?: string;
}): Promise<InspectionReminderRunResult> {
  const now = new Date();
  const force = Boolean(options?.force);
  const settings = await getInspectionReminderSettings();

  const timezone = settings.timezone || DEFAULT_TIMEZONE;
  const nowInTimezone = getZonedDateParts(now, timezone);
  const frequency = settings.frequency ?? DEFAULT_FREQUENCY;

  const year = nowInTimezone.year;
  const month = nowInTimezone.month;
  const { periodKey, week } =
    frequency === InspectionReminderFrequency.WEEKLY
      ? getWeeklyPeriod(year, month, nowInTimezone.day)
      : getMonthlyPeriod(year, month);

  if (!force && !settings.isEnabled) {
    return {
      status: "skipped",
      frequency,
      reason: "disabled",
      year,
      month,
      recipientCount: 0,
      successfulCount: 0,
      failedCount: 0,
      dispatchId: null,
      week,
    };
  }

  const due = isDueForExecution(
    {
      frequency,
      dayOfMonth: settings.dayOfMonth,
      weeklyDay: settings.weeklyDay,
      sendTime: settings.sendTime,
    },
    settings.sendTime,
    nowInTimezone,
  );
  if (!force && !due) {
    return {
      status: "skipped",
      frequency,
      reason: "not_due",
      year,
      month,
      recipientCount: 0,
      successfulCount: 0,
      failedCount: 0,
      dispatchId: null,
      week,
    };
  }

  let dispatch = await prisma.inspectionReminderDispatchLog.findUnique({
    where: {
      periodKey,
    },
  });

  if (dispatch) {
    if (dispatch.status === InspectionReminderDispatchStatus.SENT) {
      return {
        status: "skipped",
        frequency,
        reason: "already_sent",
        year,
        month,
        recipientCount: dispatch.recipientCount,
        successfulCount: dispatch.successfulCount,
        failedCount: dispatch.failedCount,
        dispatchId: dispatch.id,
        week,
      };
    }

    if (dispatch.status === InspectionReminderDispatchStatus.PROCESSING) {
      return {
        status: "skipped",
        frequency,
        reason: "in_progress",
        year,
        month,
        recipientCount: dispatch.recipientCount,
        successfulCount: dispatch.successfulCount,
        failedCount: dispatch.failedCount,
        dispatchId: dispatch.id,
        week,
      };
    }

    if (!force) {
      return {
        status: "skipped",
        frequency,
        reason: "failed_already",
        year,
        month,
        recipientCount: dispatch.recipientCount,
        successfulCount: dispatch.successfulCount,
        failedCount: dispatch.failedCount,
        dispatchId: dispatch.id,
        week,
      };
    }

    dispatch = await prisma.inspectionReminderDispatchLog.update({
      where: { id: dispatch.id },
      data: {
        periodKey,
        frequency,
        year,
        month,
        week,
        status: InspectionReminderDispatchStatus.PROCESSING,
        scheduledFor: now,
        recipientCount: 0,
        successfulCount: 0,
        failedCount: 0,
        failureReason: null,
        startedAt: now,
        sentAt: null,
        triggeredBy: options?.triggeredBy ?? null,
      },
    });
  } else {
    try {
      dispatch = await prisma.inspectionReminderDispatchLog.create({
        data: {
          periodKey,
          frequency,
          year,
          month,
          week,
          status: InspectionReminderDispatchStatus.PROCESSING,
          scheduledFor: now,
          triggeredBy: options?.triggeredBy ?? null,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const existing = await prisma.inspectionReminderDispatchLog.findUnique({
          where: {
            periodKey,
          },
        });

        return {
          status: "skipped",
          frequency,
          reason:
            existing?.status === InspectionReminderDispatchStatus.SENT
              ? "already_sent"
              : "in_progress",
          year,
          month,
          recipientCount: existing?.recipientCount ?? 0,
          successfulCount: existing?.successfulCount ?? 0,
          failedCount: existing?.failedCount ?? 0,
          dispatchId: existing?.id ?? null,
          week: existing?.week ?? week,
        };
      }

      throw error;
    }
  }

  const recipients = await prisma.user.findMany({
    where: {
      isActive: true,
      assignedVehicles: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      assignedVehicles: {
        select: {
          id: true,
          model: true,
          plate: true,
        },
      },
    },
  });

  const validRecipients = recipients.filter(
    (recipient) => recipient.email && recipient.email.trim().length > 0,
  );

  let successfulCount = 0;
  let failedCount = 0;

  for (const recipient of validRecipients) {
    const success = await sendInspectionScheduledReminderEmail({
      recipientName: recipient.name || recipient.email,
      recipientEmail: recipient.email,
      frequency,
      month,
      year,
      week,
      assignedVehicles: recipient.assignedVehicles,
    });

    if (success) {
      successfulCount += 1;
    } else {
      failedCount += 1;
    }
  }

  const finalStatus =
    validRecipients.length > 0 && successfulCount === 0
      ? InspectionReminderDispatchStatus.FAILED
      : InspectionReminderDispatchStatus.SENT;

  const failureReason =
    finalStatus === InspectionReminderDispatchStatus.FAILED
      ? "No se pudo enviar ningún recordatorio"
      : failedCount > 0
        ? `${failedCount} recordatorio(s) no se pudieron enviar`
        : null;

  const [updatedDispatch] = await prisma.$transaction([
    prisma.inspectionReminderDispatchLog.update({
      where: { id: dispatch.id },
      data: {
        status: finalStatus,
        recipientCount: validRecipients.length,
        successfulCount,
        failedCount,
        failureReason,
        sentAt:
          finalStatus === InspectionReminderDispatchStatus.SENT ? now : null,
      },
    }),
    prisma.inspectionReminderSettings.update({
      where: { id: settings.id },
      data: {
        lastTriggeredAt: now,
      },
    }),
  ]);

  return {
    status:
      finalStatus === InspectionReminderDispatchStatus.SENT ? "sent" : "failed",
    frequency,
    reason:
      finalStatus === InspectionReminderDispatchStatus.SENT
        ? "sent"
        : "send_failed",
    year,
    month,
    recipientCount: updatedDispatch.recipientCount,
    successfulCount: updatedDispatch.successfulCount,
    failedCount: updatedDispatch.failedCount,
    dispatchId: updatedDispatch.id,
    week: updatedDispatch.week,
  };
}
