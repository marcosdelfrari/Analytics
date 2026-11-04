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

type EventDailyRow = { day: Date | string; name: string; count: bigint };
type EventPlatformRow = { name: string; platform: string; count: bigint };

function asDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export async function listEventDailySeries(siteId: string, days = 14) {
  const since = trackingSince(days);
  const rows = await prisma.$queryRaw<EventDailyRow[]>`
    SELECT day, event_name AS name, SUM(count)::bigint AS count
    FROM tracking_event_daily_metrics
    WHERE site_id = ${siteId}
      AND day >= ${since}::date
    GROUP BY day, event_name
    ORDER BY day ASC
  `;
  return rows.map((row) => ({
    day: asDate(row.day),
    name: row.name,
    count: Number(row.count),
  }));
}

export async function listEventPlatformBreakdown(siteId: string, days = 14) {
  const since = trackingSince(days);
  const rows = await prisma.$queryRaw<EventPlatformRow[]>`
    SELECT event_name AS name, platform, SUM(count)::bigint AS count
    FROM tracking_event_platform_daily_metrics
    WHERE site_id = ${siteId}
      AND day >= ${since}::date
    GROUP BY event_name, platform
  `;
  return rows.map((row) => ({
    name: row.name,
    platform: row.platform,
    count: Number(row.count),
  }));
}

type PathRow = {
  path: string;
  pageviews: bigint;
  events: bigint;
  landings: bigint;
};
type PathFlowRow = { fromPath: string; path: string; count: bigint };

export async function listPathBreakdown(siteId: string, days = 14) {
  const since = trackingSince(days);
  const rows = await prisma.$queryRaw<PathRow[]>`
    SELECT
      path,
      SUM(pageviews)::bigint AS pageviews,
      SUM(events)::bigint AS events,
      SUM(landings)::bigint AS landings
    FROM tracking_path_daily_metrics
    WHERE site_id = ${siteId}
      AND day >= ${since}::date
    GROUP BY path
    ORDER BY SUM(pageviews) DESC, SUM(landings) DESC
    LIMIT 25
  `;
  return rows.map((row) => ({
    path: row.path,
    pageviews: Number(row.pageviews),
    events: Number(row.events),
    landings: Number(row.landings),
  }));
}

export async function listPathFlowBreakdown(siteId: string, days = 14) {
  const since = trackingSince(days);
  const rows = await prisma.$queryRaw<PathFlowRow[]>`
    SELECT from_path AS "fromPath", path, SUM(count)::bigint AS count
    FROM tracking_path_flow_daily_metrics
    WHERE site_id = ${siteId}
      AND day >= ${since}::date
      AND NULLIF(TRIM(from_path), '') IS NOT NULL
    GROUP BY from_path, path
    ORDER BY SUM(count) DESC
    LIMIT 25
  `;
  return rows.map((row) => ({
    fromPath: row.fromPath,
    path: row.path,
    count: Number(row.count),
  }));
}
