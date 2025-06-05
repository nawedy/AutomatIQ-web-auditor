-- Monitoring schema migration
-- Add monitoring configuration table

-- Create monitoring_config table
CREATE TABLE IF NOT EXISTS "MonitoringConfig" (
  "id" TEXT NOT NULL,
  "websiteId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "frequency" TEXT NOT NULL DEFAULT 'WEEKLY',
  "alertThreshold" INTEGER NOT NULL DEFAULT 10,
  "metrics" TEXT[] NOT NULL DEFAULT ARRAY['overallScore', 'seoScore', 'performanceScore']::TEXT[],
  "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
  "slackWebhook" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MonitoringConfig_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MonitoringConfig_websiteId_key" UNIQUE ("websiteId"),
  CONSTRAINT "MonitoringConfig_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create alerts table for monitoring notifications
CREATE TABLE IF NOT EXISTS "Alert" (
  "id" TEXT NOT NULL,
  "websiteId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'INFO',
  "message" TEXT NOT NULL,
  "metric" TEXT,
  "threshold" DOUBLE PRECISION,
  "value" DOUBLE PRECISION,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Alert_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Alert_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for faster alert queries
CREATE INDEX IF NOT EXISTS "Alert_websiteId_idx" ON "Alert"("websiteId");
CREATE INDEX IF NOT EXISTS "Alert_createdAt_idx" ON "Alert"("createdAt");

-- Add monitoring_enabled field to Website table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Website' AND column_name = 'monitoringEnabled'
  ) THEN
    ALTER TABLE "Website" ADD COLUMN "monitoringEnabled" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
