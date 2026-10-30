import type { Platform } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { sqlSourceMatchesPlatform } from "@/lib/utm-platform";

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
    SELECT event_name AS name, SUM(count)::bigint AS count
    FROM tracking_event_daily_metrics
    WHERE site_id = ${siteId}
      AND day >= ${since}::date
    GROUP BY event_name
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
          source,
          medium,
          campaign,
          SUM(pageviews)::bigint AS pageviews,
          SUM(events)::bigint AS events
        FROM tracking_attribution_daily_metrics
        WHERE site_id = $1
          AND day >= $2::date
          AND ${sqlSourceMatchesPlatform(platform)}
        GROUP BY source, medium, campaign
        ORDER BY (SUM(pageviews) + SUM(events)) DESC
        LIMIT 25`,
        siteId,
        since,
      )
    : prisma.$queryRaw<AttributionRow[]>`
        SELECT
          source,
          medium,
          campaign,
          SUM(pageviews)::bigint AS pageviews,
          SUM(events)::bigint AS events
        FROM tracking_attribution_daily_metrics
        WHERE site_id = ${siteId}
          AND day >= ${since}::date
        GROUP BY source, medium, campaign
        ORDER BY (SUM(pageviews) + SUM(events)) DESC
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
  const rows = await prisma.$queryRaw<EventRow[]>`
    SELECT event_name AS name, SUM(count)::bigint AS count
    FROM tracking_event_platform_daily_metrics
    WHERE site_id = ${siteId}
      AND day >= ${since}::date
      AND platform = ${platform}
    GROUP BY event_name
    ORDER BY count DESC
    LIMIT 20
  `;
  return rows.map((row) => ({
    name: row.name,
    count: Number(row.count),
  }));
}
