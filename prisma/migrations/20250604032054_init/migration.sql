-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "websites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_checks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_id" UUID NOT NULL,
    "check_id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "score" INTEGER,
    "details" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "title" VARCHAR(512),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_audit_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "check_id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "score" INTEGER,
    "details" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_audit_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_summaries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "audit_id" UUID NOT NULL,
    "overall_score" INTEGER,
    "summary_report" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "websites_user_id_idx" ON "websites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "websites_user_id_url_key" ON "websites"("user_id", "url");

-- CreateIndex
CREATE INDEX "audits_website_id_idx" ON "audits"("website_id");

-- CreateIndex
CREATE UNIQUE INDEX "audit_categories_name_key" ON "audit_categories"("name");

-- CreateIndex
CREATE INDEX "audit_checks_category_id_idx" ON "audit_checks"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "audit_checks_category_id_name_key" ON "audit_checks"("category_id", "name");

-- CreateIndex
CREATE INDEX "audit_results_audit_id_idx" ON "audit_results"("audit_id");

-- CreateIndex
CREATE INDEX "audit_results_check_id_idx" ON "audit_results"("check_id");

-- CreateIndex
CREATE UNIQUE INDEX "audit_results_audit_id_check_id_key" ON "audit_results"("audit_id", "check_id");

-- CreateIndex
CREATE INDEX "pages_website_id_idx" ON "pages"("website_id");

-- CreateIndex
CREATE UNIQUE INDEX "pages_website_id_url_key" ON "pages"("website_id", "url");

-- CreateIndex
CREATE INDEX "page_audit_results_audit_id_idx" ON "page_audit_results"("audit_id");

-- CreateIndex
CREATE INDEX "page_audit_results_page_id_idx" ON "page_audit_results"("page_id");

-- CreateIndex
CREATE INDEX "page_audit_results_check_id_idx" ON "page_audit_results"("check_id");

-- CreateIndex
CREATE UNIQUE INDEX "page_audit_results_audit_id_page_id_check_id_key" ON "page_audit_results"("audit_id", "page_id", "check_id");

-- CreateIndex
CREATE UNIQUE INDEX "audit_summaries_audit_id_key" ON "audit_summaries"("audit_id");

-- AddForeignKey
ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_checks" ADD CONSTRAINT "audit_checks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "audit_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_results" ADD CONSTRAINT "audit_results_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "audit_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_website_id_fkey" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_audit_results" ADD CONSTRAINT "page_audit_results_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_audit_results" ADD CONSTRAINT "page_audit_results_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_audit_results" ADD CONSTRAINT "page_audit_results_check_id_fkey" FOREIGN KEY ("check_id") REFERENCES "audit_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_summaries" ADD CONSTRAINT "audit_summaries_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
