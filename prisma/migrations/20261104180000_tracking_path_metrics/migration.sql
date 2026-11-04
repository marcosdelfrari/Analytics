-- CreateTable
CREATE TABLE "tracking_path_daily_metrics" (
    "site_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "path" TEXT NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,
    "landings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tracking_path_daily_metrics_pkey" PRIMARY KEY ("site_id","day","path")
);

-- CreateTable
CREATE TABLE "tracking_path_flow_daily_metrics" (
    "site_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "from_path" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tracking_path_flow_daily_metrics_pkey" PRIMARY KEY ("site_id","day","from_path","path")
);

-- AddForeignKey
ALTER TABLE "tracking_path_daily_metrics" ADD CONSTRAINT "tracking_path_daily_metrics_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_path_flow_daily_metrics" ADD CONSTRAINT "tracking_path_flow_daily_metrics_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill page metrics (fuso America/Sao_Paulo, igual ao worker)
INSERT INTO "tracking_path_daily_metrics" ("site_id", "day", "path", "pageviews", "events", "landings")
SELECT
  site_id,
  (timezone('America/Sao_Paulo', created_at))::date,
  COALESCE(NULLIF(TRIM(LEFT(path, 500)), ''), '/'),
  COUNT(*) FILTER (WHERE kind = 'pageview')::integer,
  COUNT(*) FILTER (WHERE kind = 'event')::integer,
  COUNT(*) FILTER (
    WHERE kind = 'pageview'
      AND COALESCE(NULLIF(TRIM(properties->>'from'), ''), '') = ''
      AND (
        referrer = ''
        OR lower(split_part(split_part(referrer, '/', 3), ':', 1))
           IS DISTINCT FROM lower(split_part(split_part(url, '/', 3), ':', 1))
      )
  )::integer
FROM tracking_hits
GROUP BY 1, 2, 3
ON CONFLICT ("site_id", "day", "path")
DO UPDATE SET
  pageviews = EXCLUDED.pageviews,
  events = EXCLUDED.events,
  landings = EXCLUDED.landings;

-- Backfill entry → next page (from vazio = entrada do site)
INSERT INTO "tracking_path_flow_daily_metrics" ("site_id", "day", "from_path", "path", "count")
SELECT
  site_id,
  (timezone('America/Sao_Paulo', created_at))::date,
  COALESCE(NULLIF(TRIM(LEFT(properties->>'from', 500)), ''), ''),
  COALESCE(NULLIF(TRIM(LEFT(path, 500)), ''), '/'),
  COUNT(*)::integer
FROM tracking_hits
WHERE kind = 'pageview'
GROUP BY 1, 2, 3, 4
ON CONFLICT ("site_id", "day", "from_path", "path")
DO UPDATE SET "count" = EXCLUDED.count;
