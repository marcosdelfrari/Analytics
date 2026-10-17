-- CreateTable
CREATE TABLE "tracking_event_daily_metrics" (
    "site_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "event_name" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tracking_event_daily_metrics_pkey" PRIMARY KEY ("site_id","day","event_name")
);

-- CreateTable
CREATE TABLE "tracking_campaign_daily_metrics" (
    "site_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "campaign" TEXT NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tracking_campaign_daily_metrics_pkey" PRIMARY KEY ("site_id","day","campaign")
);

-- AddForeignKey
ALTER TABLE "tracking_event_daily_metrics" ADD CONSTRAINT "tracking_event_daily_metrics_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_campaign_daily_metrics" ADD CONSTRAINT "tracking_campaign_daily_metrics_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill from hits already stored
INSERT INTO "tracking_event_daily_metrics" ("site_id", "day", "event_name", "count")
SELECT
  site_id,
  (created_at AT TIME ZONE 'UTC')::date,
  name,
  COUNT(*)::integer
FROM tracking_hits
WHERE kind = 'event'
GROUP BY site_id, (created_at AT TIME ZONE 'UTC')::date, name
ON CONFLICT ("site_id", "day", "event_name")
DO UPDATE SET "count" = EXCLUDED.count;

INSERT INTO "tracking_campaign_daily_metrics" ("site_id", "day", "campaign", "pageviews", "events")
SELECT
  site_id,
  (created_at AT TIME ZONE 'UTC')::date,
  COALESCE(NULLIF(TRIM(LEFT(params->>'utm_campaign', 200)), ''), '(sem campanha)'),
  COUNT(*) FILTER (WHERE kind = 'pageview')::integer,
  COUNT(*) FILTER (WHERE kind = 'event')::integer
FROM tracking_hits
GROUP BY site_id, (created_at AT TIME ZONE 'UTC')::date, COALESCE(NULLIF(TRIM(LEFT(params->>'utm_campaign', 200)), ''), '(sem campanha)')
ON CONFLICT ("site_id", "day", "campaign")
DO UPDATE SET
  pageviews = EXCLUDED.pageviews,
  events = EXCLUDED.events;
