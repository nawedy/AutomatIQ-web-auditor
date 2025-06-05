-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateTable
CREATE TABLE "audit_schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "ScheduleFrequency" NOT NULL DEFAULT 'WEEKLY',
    "categories" TEXT[] NOT NULL DEFAULT ARRAY['SEO', 'PERFORMANCE', 'ACCESSIBILITY', 'SECURITY', 'MOBILE', 'CONTENT']::TEXT[],
    "last_run_at" TIMESTAMPTZ,
    "next_scheduled_at" TIMESTAMPTZ,
    "day_of_week" INTEGER,
    "day_of_month" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "audit_schedules_website_id_key" ON "audit_schedules"("website_id");

-- CreateIndex
CREATE INDEX "audit_schedules_website_id_idx" ON "audit_schedules"("website_id");

-- CreateIndex
CREATE INDEX "audit_schedules_enabled_idx" ON "audit_schedules"("enabled");

-- CreateIndex
CREATE INDEX "audit_schedules_next_scheduled_at_idx" ON "audit_schedules"("next_scheduled_at");

-- AddForeignKey
ALTER TABLE "audit_schedules" ADD CONSTRAINT "audit_schedules_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
