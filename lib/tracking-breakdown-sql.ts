import type { Platform } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { sqlUtmSourceMatchesPlatform } from "@/lib/utm-platform";

export function trackingSince(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);
  return since;
}

type EventRow = { name: string; count: bigint };
type AttributionRow = {
  source: string;
  medium: string;
  campaign: string;
  pageviews: bigint;
  events: bigint;
};

export async function listEventBreakdownFromHits(siteId: string, days = 14) {
  const since = trackingSince(days);
  const rows = await prisma.$queryRaw<EventRow[]>`
    SELECT name, COUNT(*)::bigint AS count
    FROM tracking_hits
    WHERE site_id = ${siteId}
      AND kind = 'event'
      AND created_at >= ${since}
    GROUP BY name
    ORDER BY count DESC
    LIMIT 20
  `;
  return rows.map((row) => ({
    name: row.name,
    count: Number(row.count),
  }));
}

function attributionQuery(siteId: string, since: Date, platform?: Platform) {
  const platformSql = platform
    ? prisma.$queryRawUnsafe<AttributionRow[]>(
        `SELECT
          COALESCE(NULLIF(TRIM(LEFT(params->>'utm_source', 200)), ''), '(sem origem)') AS source,
          COALESCE(NULLIF(TRIM(LEFT(params->>'utm_medium', 200)), ''), '(sem meio)') AS medium,
          COALESCE(NULLIF(TRIM(LEFT(params->>'utm_campaign', 200)), ''), '(sem campanha)') AS campaign,
          COUNT(*) FILTER (WHERE kind = 'pageview')::bigint AS pageviews,
          COUNT(*) FILTER (WHERE kind = 'event')::bigint AS events
        FROM tracking_hits
        WHERE site_id = $1
          AND created_at >= $2
          AND ${sqlUtmSourceMatchesPlatform(platform)}
        GROUP BY 1, 2, 3
        ORDER BY (COUNT(*) FILTER (WHERE kind = 'pageview') + COUNT(*) FILTER (WHERE kind = 'event')) DESC
        LIMIT 25`,
        siteId,
        since,
      )
    : prisma.$queryRaw<AttributionRow[]>`
        SELECT
          COALESCE(NULLIF(TRIM(LEFT(params->>'utm_source', 200)), ''), '(sem origem)') AS source,
          COALESCE(NULLIF(TRIM(LEFT(params->>'utm_medium', 200)), ''), '(sem meio)') AS medium,
          COALESCE(NULLIF(TRIM(LEFT(params->>'utm_campaign', 200)), ''), '(sem campanha)') AS campaign,
          COUNT(*) FILTER (WHERE kind = 'pageview')::bigint AS pageviews,
          COUNT(*) FILTER (WHERE kind = 'event')::bigint AS events
        FROM tracking_hits
        WHERE site_id = ${siteId}
          AND created_at >= ${since}
        GROUP BY 1, 2, 3
        ORDER BY (COUNT(*) FILTER (WHERE kind = 'pageview') + COUNT(*) FILTER (WHERE kind = 'event')) DESC
        LIMIT 25
      `;
  return platformSql;
}

function mapAttribution(rows: AttributionRow[]) {
  return rows.map((row) => ({
    source: row.source,
    medium: row.medium,
    campaign: row.campaign,
    pageviews: Number(row.pageviews),
    events: Number(row.events),
  }));
}

export async function listAttributionBreakdownFromHits(
  siteId: string,
  days = 14,
) {
  const since = trackingSince(days);
  const rows = await attributionQuery(siteId, since);
  return mapAttribution(rows);
}

export async function listAttributionForPlatform(
  siteId: string,
  platform: Platform,
  days = 14,
) {
  const since = trackingSince(days);
  const rows = await attributionQuery(siteId, since, platform);
  return mapAttribution(rows);
}

export async function listEventBreakdownForPlatform(
  siteId: string,
  platform: Platform,
  days = 14,
) {
  const since = trackingSince(days);
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT name, COUNT(*)::bigint AS count
     FROM tracking_hits
     WHERE site_id = $1
       AND kind = 'event'
       AND created_at >= $2
       AND ${sqlUtmSourceMatchesPlatform(platform)}
     GROUP BY name
     ORDER BY count DESC
     LIMIT 20`,
    siteId,
    since,
  );
  return rows.map((row) => ({
    name: row.name,
    count: Number(row.count),
  }));
}
