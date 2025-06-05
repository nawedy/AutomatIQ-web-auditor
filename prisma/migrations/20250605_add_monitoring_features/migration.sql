-- CreateEnum
CREATE TYPE IF NOT EXISTS "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- AlterTable
ALTER TABLE "websites" ADD COLUMN IF NOT EXISTS "monitoring_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "metric" TEXT,
    "threshold" DOUBLE PRECISION,
    "value" DOUBLE PRECISION,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "monitoring_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "ScheduleFrequency" NOT NULL DEFAULT 'WEEKLY',
    "alert_threshold" INTEGER NOT NULL DEFAULT 10,
    "metrics" TEXT[] DEFAULT ARRAY['overallScore', 'seoScore', 'performanceScore']::TEXT[],
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "slack_webhook" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitoring_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "alerts_website_id_idx" ON "alerts"("website_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "alerts_created_at_idx" ON "alerts"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "alerts_read_idx" ON "alerts"("read");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "monitoring_configs_website_id_idx" ON "monitoring_configs"("website_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "monitoring_configs_website_id_key" ON "monitoring_configs"("website_id");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_configs" ADD CONSTRAINT "monitoring_configs_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
