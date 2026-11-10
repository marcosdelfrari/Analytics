import { prisma } from "@/lib/prisma";
import {
  addDaysToKey,
  dateKeyToUtc,
  windowFromDays,
  type TrackingWindow,
} from "@/lib/report-period";
import {
  sqlHitIsSiteConversion,
} from "@/lib/tracking-events";
import {
  sqlHitSourceMatchesMediaOrigin,
  sqlSourceMatchesMediaOrigin,
  type TrackingMediaOrigin,
} from "@/lib/utm-platform";

const SQL_HIT_CONVERSION = sqlHitIsSiteConversion();

export function trackingSince(days: number) {
  return dateKeyToUtc(windowFromDays(days).from);
}

function bounds(window: TrackingWindow) {
  return {
    from: window.from,
    to: window.to,
  };
}

type EventRow = { name: string; count: bigint };
type AttributionRow = {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  pageviews: bigint;
  events: bigint;
  conversions?: bigint;
};

type AttributionPathRow = AttributionRow & { path: string };

const SQL_HIT_UTM_SOURCE = `COALESCE(NULLIF(TRIM(LEFT(params->>'utm_source', 200)), ''), '(sem origem)')`;
const SQL_HIT_UTM_MEDIUM = `COALESCE(NULLIF(TRIM(LEFT(params->>'utm_medium', 200)), ''), '(sem meio)')`;
const SQL_HIT_UTM_CAMPAIGN = `COALESCE(NULLIF(TRIM(LEFT(params->>'utm_campaign', 200)), ''), '(sem campanha)')`;
const SQL_HIT_UTM_TERM = `COALESCE(NULLIF(TRIM(LEFT(params->>'utm_term', 200)), ''), '(sem termo)')`;
const SQL_HIT_UTM_CONTENT = `COALESCE(NULLIF(TRIM(LEFT(params->>'utm_content', 200)), ''), '(sem conteúdo)')`;

export async function listEventBreakdownFromHits(
  siteId: string,
  window: TrackingWindow,
) {
  const { from, to } = bounds(window);
  const rows = await prisma.$queryRaw<EventRow[]>`
    SELECT event_name AS name, SUM(count)::bigint AS count
    FROM tracking.agr_evento_dia
    WHERE site_id = ${siteId}
      AND day >= ${from}::date
      AND day <= ${to}::date
    GROUP BY event_name
    ORDER BY count DESC
    LIMIT 20
  `;
  return rows.map((row) => ({
    name: row.name,
    count: Number(row.count),
  }));
}

function attributionQuery(
  siteId: string,
  window: TrackingWindow,
  origin?: TrackingMediaOrigin,
) {
  const { from, to } = bounds(window);
  if (!origin) {
    return prisma.$queryRaw<AttributionRow[]>`
      SELECT
        source,
        medium,
        campaign,
        SUM(pageviews)::bigint AS pageviews,
        SUM(events)::bigint AS events
      FROM tracking.agr_atribuicao_dia
      WHERE site_id = ${siteId}
        AND day >= ${from}::date
        AND day <= ${to}::date
      GROUP BY source, medium, campaign
      ORDER BY (SUM(pageviews) + SUM(events)) DESC
      LIMIT 25
    `;
  }

  return prisma.$queryRawUnsafe<AttributionRow[]>(
    `SELECT
      source,
      medium,
      campaign,
      SUM(pageviews)::bigint AS pageviews,
      SUM(events)::bigint AS events
    FROM tracking.agr_atribuicao_dia
    WHERE site_id = $1
      AND day >= $2::date
      AND day <= $3::date
      AND ${sqlSourceMatchesMediaOrigin(origin)}
    GROUP BY source, medium, campaign
    ORDER BY (SUM(pageviews) + SUM(events)) DESC
    LIMIT 25`,
    siteId,
    from,
    to,
  );
}

function mapAttribution(rows: AttributionRow[]) {
  return rows.map((row) => ({
    source: row.source,
    medium: row.medium,
    campaign: row.campaign,
    term: row.term,
    content: row.content,
    pageviews: Number(row.pageviews),
    events: Number(row.events),
    conversions: Number(row.conversions ?? 0),
  }));
}

function mapAttributionWithPath(rows: AttributionPathRow[]) {
  return rows.map((row) => ({
    source: row.source,
    medium: row.medium,
    campaign: row.campaign,
    term: row.term,
    content: row.content,
    path: row.path,
    pageviews: Number(row.pageviews),
    events: Number(row.events),
    conversions: Number(row.conversions ?? 0),
  }));
}

async function attributionFromHitsForOrigin(
  siteId: string,
  window: TrackingWindow,
  origin: TrackingMediaOrigin,
) {
  const { from, to } = bounds(window);
  const createdFrom = dateKeyToUtc(from);
  const createdToExclusive = dateKeyToUtc(addDaysToKey(to, 1));
  const originSql = sqlHitSourceMatchesMediaOrigin(origin);

  const rows = await prisma.$queryRawUnsafe<AttributionRow[]>(
    `SELECT
      ${SQL_HIT_UTM_SOURCE} AS source,
      ${SQL_HIT_UTM_MEDIUM} AS medium,
      ${SQL_HIT_UTM_CAMPAIGN} AS campaign,
      ${SQL_HIT_UTM_TERM} AS term,
      ${SQL_HIT_UTM_CONTENT} AS content,
      COUNT(*) FILTER (WHERE kind = 'pageview')::bigint AS pageviews,
      COUNT(*) FILTER (WHERE kind = 'event')::bigint AS events,
      COUNT(*) FILTER (WHERE ${SQL_HIT_CONVERSION})::bigint AS conversions
    FROM tracking.mov_hit
    WHERE site_id = $1
      AND created_at >= $2
      AND created_at < $3
      AND ${originSql}
    GROUP BY 1, 2, 3, 4, 5
    ORDER BY (
      COUNT(*) FILTER (WHERE kind = 'pageview')
      + COUNT(*) FILTER (WHERE ${SQL_HIT_CONVERSION})
    ) DESC
    LIMIT 50`,
    siteId,
    createdFrom,
    createdToExclusive,
  );
  return mapAttribution(rows);
}

export async function listAttributionBreakdownFromHits(
  siteId: string,
  window: TrackingWindow,
) {
  const rows = await attributionQuery(siteId, window);
  return mapAttribution(rows);
}

export async function listAttributionForPlatform(
  siteId: string,
  origin: TrackingMediaOrigin,
  window: TrackingWindow,
) {
  if (origin === "other" || origin === "none") {
    return attributionFromHitsForOrigin(siteId, window, origin);
  }
  const rows = await attributionQuery(siteId, window, origin);
  return mapAttribution(rows);
}

export async function listEventBreakdownForPlatform(
  siteId: string,
  origin: TrackingMediaOrigin,
  window: TrackingWindow,
) {
  const { from, to } = bounds(window);

  if (origin === "google" || origin === "meta") {
    const rows = await prisma.$queryRaw<EventRow[]>`
      SELECT event_name AS name, SUM(count)::bigint AS count
      FROM tracking.agr_evento_plataforma_dia
      WHERE site_id = ${siteId}
        AND day >= ${from}::date
        AND day <= ${to}::date
        AND platform = ${origin}
      GROUP BY event_name
      ORDER BY count DESC
      LIMIT 20
    `;
    return rows.map((row) => ({
      name: row.name,
      count: Number(row.count),
    }));
  }

  // Outros / Sem dados: a agregação antiga junta os dois em `other`.
  // Classifica pelo utm_source do hit no período.
  const createdFrom = dateKeyToUtc(from);
  const createdToExclusive = dateKeyToUtc(addDaysToKey(to, 1));
  const rows = await prisma.$queryRawUnsafe<EventRow[]>(
    `SELECT name, COUNT(*)::bigint AS count
     FROM tracking.mov_hit
     WHERE site_id = $1
       AND kind = 'event'
       AND created_at >= $2
       AND created_at < $3
       AND ${sqlHitSourceMatchesMediaOrigin(origin)}
     GROUP BY name
     ORDER BY count DESC
     LIMIT 20`,
    siteId,
    createdFrom,
    createdToExclusive,
  );
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

export async function listEventDailySeries(
  siteId: string,
  window: TrackingWindow,
) {
  const { from, to } = bounds(window);
  const rows = await prisma.$queryRaw<EventDailyRow[]>`
    SELECT day, event_name AS name, SUM(count)::bigint AS count
    FROM tracking.agr_evento_dia
    WHERE site_id = ${siteId}
      AND day >= ${from}::date
      AND day <= ${to}::date
    GROUP BY day, event_name
    ORDER BY day ASC
  `;
  return rows.map((row) => ({
    day: asDate(row.day),
    name: row.name,
    count: Number(row.count),
  }));
}

export async function listEventPlatformBreakdown(
  siteId: string,
  window: TrackingWindow,
) {
  const { from, to } = bounds(window);
  const rows = await prisma.$queryRaw<EventPlatformRow[]>`
    SELECT event_name AS name, platform, SUM(count)::bigint AS count
    FROM tracking.agr_evento_plataforma_dia
    WHERE site_id = ${siteId}
      AND day >= ${from}::date
      AND day <= ${to}::date
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
type ClientBreakdownRow = { label: string; pageviews: bigint; events: bigint };

const CLIENT_BREAKDOWN_COLUMNS = {
  device: "device_type",
  browser: "browser",
  os: "os",
} as const;

export type ClientBreakdownDimension = keyof typeof CLIENT_BREAKDOWN_COLUMNS;

export async function listClientBreakdown(
  siteId: string,
  window: TrackingWindow,
  dimension: ClientBreakdownDimension,
) {
  const { from, to } = bounds(window);
  const createdFrom = dateKeyToUtc(from);
  const createdToExclusive = dateKeyToUtc(addDaysToKey(to, 1));
  const column = CLIENT_BREAKDOWN_COLUMNS[dimension];

  const [rows, conversionRows] = await Promise.all([
    prisma.$queryRawUnsafe<ClientBreakdownRow[]>(
      `SELECT
        ${column} AS label,
        SUM(pageviews)::bigint AS pageviews,
        SUM(events)::bigint AS events
      FROM tracking.agr_dispositivo_dia
      WHERE site_id = $1
        AND day >= $2::date
        AND day <= $3::date
        AND device_type <> 'bot'
      GROUP BY ${column}
      ORDER BY SUM(pageviews) DESC, SUM(events) DESC
      LIMIT 15`,
      siteId,
      from,
      to,
    ),
    prisma.$queryRawUnsafe<{ label: string; conversions: bigint }[]>(
      `SELECT ${column} AS label, COUNT(*)::bigint AS conversions
       FROM tracking.mov_hit
       WHERE site_id = $1
         AND created_at >= $2
         AND created_at < $3
         AND device_type <> ''
         AND device_type <> 'bot'
         AND ${SQL_HIT_CONVERSION}
       GROUP BY ${column}`,
      siteId,
      createdFrom,
      createdToExclusive,
    ),
  ]);

  const conversionsByLabel = new Map(
    conversionRows.map((row) => [row.label, Number(row.conversions)]),
  );

  return rows.map((row) => ({
    label: row.label,
    pageviews: Number(row.pageviews),
    events: Number(row.events),
    conversions: conversionsByLabel.get(row.label) ?? 0,
  }));
}

export async function listPathBreakdown(siteId: string, window: TrackingWindow) {
  const { from, to } = bounds(window);
  const createdFrom = dateKeyToUtc(from);
  const createdToExclusive = dateKeyToUtc(addDaysToKey(to, 1));

  const [rows, conversionRows] = await Promise.all([
    prisma.$queryRaw<PathRow[]>`
      SELECT
        path,
        SUM(pageviews)::bigint AS pageviews,
        SUM(events)::bigint AS events,
        SUM(landings)::bigint AS landings
      FROM tracking.agr_pagina_dia
      WHERE site_id = ${siteId}
        AND day >= ${from}::date
        AND day <= ${to}::date
      GROUP BY path
      ORDER BY SUM(pageviews) DESC, SUM(landings) DESC
      LIMIT 25
    `,
    prisma.$queryRawUnsafe<{ path: string; conversions: bigint }[]>(
      `SELECT path, COUNT(*)::bigint AS conversions
       FROM tracking.mov_hit
       WHERE site_id = $1
         AND created_at >= $2
         AND created_at < $3
         AND ${SQL_HIT_CONVERSION}
       GROUP BY path`,
      siteId,
      createdFrom,
      createdToExclusive,
    ),
  ]);

  const conversionsByPath = new Map(
    conversionRows.map((row) => [row.path, Number(row.conversions)]),
  );

  return rows.map((row) => ({
    path: row.path,
    pageviews: Number(row.pageviews),
    events: Number(row.events),
    landings: Number(row.landings),
    conversions: conversionsByPath.get(row.path) ?? 0,
  }));
}

export async function listPathFlowBreakdown(
  siteId: string,
  window: TrackingWindow,
) {
  const { from, to } = bounds(window);
  const rows = await prisma.$queryRaw<PathFlowRow[]>`
    SELECT from_path AS "fromPath", path, SUM(count)::bigint AS count
    FROM tracking.agr_fluxo_pagina_dia
    WHERE site_id = ${siteId}
      AND day >= ${from}::date
      AND day <= ${to}::date
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
