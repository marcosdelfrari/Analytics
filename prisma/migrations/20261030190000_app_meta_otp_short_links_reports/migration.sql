CREATE TABLE IF NOT EXISTS "app_meta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "app_meta_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "login_otps" ADD COLUMN IF NOT EXISTS "attempt_count" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "short_links" (
    "id" TEXT NOT NULL,
    "company_id" TEXT,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "short_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "short_links_code_key" ON "short_links"("code");
CREATE INDEX IF NOT EXISTS "short_links_company_id_created_at_idx" ON "short_links"("company_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "short_links" ADD CONSTRAINT "short_links_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "published_reports" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "spend" DOUBLE PRECISION NOT NULL,
    "spend_change" DOUBLE PRECISION,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "conversions" INTEGER NOT NULL,
    "active_campaigns" INTEGER,
    "total_campaigns" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    "file_name" TEXT,
    "stored_file" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "published_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "published_reports_company_id_published_at_idx"
  ON "published_reports"("company_id", "published_at");

DO $$ BEGIN
  ALTER TABLE "published_reports" ADD CONSTRAINT "published_reports_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
