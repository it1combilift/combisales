-- CreateEnum
CREATE TYPE "InspectionReminderDispatchStatus" AS ENUM ('PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "InspectionReminderSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'default',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dayOfMonth" INTEGER NOT NULL DEFAULT 10,
    "sendTime" TEXT NOT NULL DEFAULT '09:00',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "lastTriggeredAt" TIMESTAMP(3),
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionReminderSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionReminderDispatchLog" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" "InspectionReminderDispatchStatus" NOT NULL DEFAULT 'PROCESSING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "successfulCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "failureReason" TEXT,
    "triggeredBy" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionReminderDispatchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InspectionReminderSettings_key_key" ON "InspectionReminderSettings"("key");

-- CreateIndex
CREATE INDEX "InspectionReminderSettings_isEnabled_idx" ON "InspectionReminderSettings"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionReminderDispatchLog_year_month_key" ON "InspectionReminderDispatchLog"("year", "month");

-- CreateIndex
CREATE INDEX "InspectionReminderDispatchLog_status_idx" ON "InspectionReminderDispatchLog"("status");

-- CreateIndex
CREATE INDEX "InspectionReminderDispatchLog_scheduledFor_idx" ON "InspectionReminderDispatchLog"("scheduledFor");

-- CreateIndex
CREATE INDEX "InspectionReminderDispatchLog_sentAt_idx" ON "InspectionReminderDispatchLog"("sentAt");
