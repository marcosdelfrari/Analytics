-- CreateTable
CREATE TABLE "tracking_attribution_daily_metrics" (
    "site_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "source" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tracking_attribution_daily_metrics_pkey" PRIMARY KEY ("site_id","day","source","medium","campaign")
);

-- CreateTable
CREATE TABLE "tracking_event_platform_daily_metrics" (
    "site_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "event_name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tracking_event_platform_daily_metrics_pkey" PRIMARY KEY ("site_id","day","event_name","platform")
);

-- CreateTable
CREATE TABLE "lead_submissions" (
    "id" UUID NOT NULL,
    "organization_id" TEXT NOT NULL,
    "company_id" TEXT,
    "form_id" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "page_url" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_submissions_organization_id_created_at_idx" ON "lead_submissions"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "lead_submissions_form_id_created_at_idx" ON "lead_submissions"("form_id", "created_at");

-- AddForeignKey
ALTER TABLE "tracking_attribution_daily_metrics" ADD CONSTRAINT "tracking_attribution_daily_metrics_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_event_platform_daily_metrics" ADD CONSTRAINT "tracking_event_platform_daily_metrics_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_submissions" ADD CONSTRAINT "lead_submissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_submissions" ADD CONSTRAINT "lead_submissions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_submissions" ADD CONSTRAINT "lead_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "lead_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill attribution aggregates (fuso America/Sao_Paulo, igual ao worker)
INSERT INTO "tracking_attribution_daily_metrics" ("site_id", "day", "source", "medium", "campaign", "pageviews", "events")
SELECT
  site_id,
  (timezone('America/Sao_Paulo', created_at))::date,
  COALESCE(NULLIF(TRIM(LEFT(params->>'utm_source', 200)), ''), '(sem origem)'),
  COALESCE(NULLIF(TRIM(LEFT(params->>'utm_medium', 200)), ''), '(sem meio)'),
  COALESCE(NULLIF(TRIM(LEFT(params->>'utm_campaign', 200)), ''), '(sem campanha)'),
  COUNT(*) FILTER (WHERE kind = 'pageview')::integer,
  COUNT(*) FILTER (WHERE kind = 'event')::integer
FROM tracking_hits
GROUP BY 1, 2, 3, 4, 5
ON CONFLICT ("site_id", "day", "source", "medium", "campaign")
DO UPDATE SET
  pageviews = EXCLUDED.pageviews,
  events = EXCLUDED.events;

-- Backfill event counts by platform (google / meta / other)
INSERT INTO "tracking_event_platform_daily_metrics" ("site_id", "day", "event_name", "platform", "count")
SELECT
  site_id,
  (timezone('America/Sao_Paulo', created_at))::date,
  name,
  CASE
    WHEN COALESCE(params->>'utm_source', '') ~* 'google|adwords|googleads' THEN 'google'
    WHEN COALESCE(params->>'utm_source', '') ~* 'facebook|meta|instagram|^fb$|^ig$' THEN 'meta'
    ELSE 'other'
  END,
  COUNT(*)::integer
FROM tracking_hits
WHERE kind = 'event'
GROUP BY 1, 2, 3, 4
ON CONFLICT ("site_id", "day", "event_name", "platform")
DO UPDATE SET "count" = EXCLUDED.count;
