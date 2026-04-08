-- CreateEnum
CREATE TYPE "InspectionReminderFrequency" AS ENUM ('MONTHLY', 'WEEKLY');

-- AlterTable
ALTER TABLE "InspectionReminderSettings"
ADD COLUMN "frequency" "InspectionReminderFrequency" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN "weeklyDay" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "InspectionReminderDispatchLog"
ADD COLUMN "frequency" "InspectionReminderFrequency" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN "periodKey" TEXT,
ADD COLUMN "week" INTEGER;

-- Backfill period key for existing monthly records
UPDATE "InspectionReminderDispatchLog"
SET "periodKey" = 'MONTHLY-' || "year"::text || '-' || LPAD("month"::text, 2, '0')
WHERE "periodKey" IS NULL;

-- Drop old monthly-only unique index
DROP INDEX IF EXISTS "InspectionReminderDispatchLog_year_month_key";

-- Enforce new unique idempotency key
ALTER TABLE "InspectionReminderDispatchLog"
ALTER COLUMN "periodKey" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InspectionReminderDispatchLog_periodKey_key" ON "InspectionReminderDispatchLog"("periodKey");

-- CreateIndex
CREATE INDEX "InspectionReminderDispatchLog_frequency_idx" ON "InspectionReminderDispatchLog"("frequency");

-- CreateIndex
CREATE INDEX "InspectionReminderDispatchLog_year_month_idx" ON "InspectionReminderDispatchLog"("year", "month");

-- CreateIndex
CREATE INDEX "InspectionReminderDispatchLog_week_idx" ON "InspectionReminderDispatchLog"("week");
