-- Create monitoring_configs table
CREATE TABLE "monitoring_configs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "website_id" UUID NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "frequency" TEXT NOT NULL DEFAULT 'WEEKLY',
  "alert_threshold" INTEGER NOT NULL DEFAULT 10,
  "metrics" TEXT[] NOT NULL DEFAULT ARRAY['overallScore', 'seoScore', 'performanceScore']::TEXT[],
  "email_notifications" BOOLEAN NOT NULL DEFAULT true,
  "slack_webhook" TEXT,
  "next_check_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "monitoring_configs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "monitoring_configs_website_id_key" UNIQUE ("website_id"),
  CONSTRAINT "monitoring_configs_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index on website_id
CREATE INDEX "monitoring_configs_website_id_idx" ON "monitoring_configs"("website_id");

-- Create monitoring_alerts table
CREATE TABLE "monitoring_alerts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "website_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "threshold" DOUBLE PRECISION NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "monitoring_alerts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "monitoring_alerts_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "monitoring_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for monitoring_alerts
CREATE INDEX "monitoring_alerts_website_id_idx" ON "monitoring_alerts"("website_id");
CREATE INDEX "monitoring_alerts_user_id_idx" ON "monitoring_alerts"("user_id");
CREATE INDEX "monitoring_alerts_read_idx" ON "monitoring_alerts"("read");
CREATE INDEX "monitoring_alerts_severity_idx" ON "monitoring_alerts"("severity");

-- Create monitoring_checks table
CREATE TABLE "monitoring_checks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "website_id" UUID NOT NULL,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMPTZ,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "results" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "monitoring_checks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "monitoring_checks_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index on website_id for monitoring_checks
CREATE INDEX "monitoring_checks_website_id_idx" ON "monitoring_checks"("website_id");
