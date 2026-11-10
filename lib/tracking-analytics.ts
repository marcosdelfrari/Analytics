import { unstable_cache } from "next/cache";
import {
  dateKeyToUtc,
  eachDateKey,
  formatRangeLabel,
  trackingWindowFor,
  windowFromDays,
  isDateKey,
  type ReportPeriod,
  type TrackingWindow,
} from "@/lib/report-period";
import {
  listAttributionBreakdownFromHits,
  listAttributionForPlatform,
  listClientBreakdown,
  listDailyMetrics,
  listEventBreakdownForPlatform,
  listEventBreakdownFromHits,
  listEventDailySeries,
  listEventPlatformBreakdown,
  listPathBreakdown,
  listPathFlowBreakdown,
  trackingSiteForCompany,
} from "@/lib/tracking";
import {
  toEventShareRows,
  type EventBreakdownRow,
  type EventPlatformMixRow,
  type EventTrendData,
  type SiteTrackingAnalytics,
} from "@/lib/tracking-analytics-shared";
import { totalConversionsFromEvents } from "@/lib/tracking-events";

export type {
  AttributionBreakdownRow,
  ClientBreakdownRow,
  EventBreakdownRow,
  EventPlatformMixRow,
  EventShareRow,
  EventTrendData,
  EventTrendPoint,
  PathBreakdownRow,
  PathFlowRow,
  SiteTrackingAnalytics,
  SiteTrafficPoint,
} from "@/lib/tracking-analytics-shared";
export { toEventShareRows } from "@/lib/tracking-analytics-shared";

const TOP_EVENT_SERIES = 5;
const TRACKING_CACHE_SECONDS = 45;

export function trackingPeriodCacheKey(period: ReportPeriod | number): string {
  if (typeof period === "number") return `n:${period}`;
  if (period.kind === "days") return `d:${period.days}`;
  return `r:${period.from}:${period.to}`;
}

export function trackingPeriodFromCacheKey(key: string): ReportPeriod | number {
  if (key.startsWith("n:")) return Number(key.slice(2));
  if (key.startsWith("d:")) return { kind: "days", days: Number(key.slice(2)) };
  const rangeMatch = /^r:(\d{4}-\d{2}-\d{2}):(\d{4}-\d{2}-\d{2})$/.exec(key);
  if (rangeMatch && isDateKey(rangeMatch[1]) && isDateKey(rangeMatch[2])) {
    return { kind: "range", from: rangeMatch[1], to: rangeMatch[2] };
  }
  return 14;
}

function formatDayLabel(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(value);
}

function utcDayKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function resolvePeriod(period: ReportPeriod | number): ReportPeriod {
  return typeof period === "number" ? { kind: "days", days: period } : period;
}

function mixEventPlatforms(
  eventsByName: EventBreakdownRow[],
  platformRows: { name: string; platform: string; count: number }[],
): EventPlatformMixRow[] {
  const byName = new Map<
    string,
    { google: number; meta: number; other: number }
  >();
  for (const row of platformRows) {
    const current = byName.get(row.name) ?? {
      google: 0,
      meta: 0,
      other: 0,
    };
    if (row.platform === "google") current.google += row.count;
    else if (row.platform === "meta") current.meta += row.count;
    else current.other += row.count;
    byName.set(row.name, current);
  }

  return toEventShareRows(eventsByName).map((row) => {
    const platforms = byName.get(row.name) ?? {
      google: 0,
      meta: 0,
      other: 0,
    };
    const attributed = platforms.google + platforms.meta + platforms.other;
    return {
      ...row,
      google: platforms.google,
      meta: platforms.meta,
      other:
        attributed > 0
          ? platforms.other + Math.max(0, row.count - attributed)
          : row.count,
    };
  });
}

function axisDaysFor(window: TrackingWindow) {
  return eachDateKey(window.from, window.to).map((key) => dateKeyToUtc(key));
}

function buildEventTrend(
  names: string[],
  days: Date[],
  series: { day: Date; name: string; count: number }[],
): EventTrendData {
  if (names.length === 0 || days.length === 0) {
    return { names: [], points: [] };
  }

  const counts = new Map<string, number>();
  for (const row of series) {
    counts.set(`${utcDayKey(row.day)}::${row.name}`, row.count);
  }

  return {
    names,
    points: days.map((day) => ({
      label: formatDayLabel(day),
      values: names.map(
        (name) => counts.get(`${utcDayKey(day)}::${name}`) ?? 0,
      ),
    })),
  };
}

function buildTrafficOverview(
  window: TrackingWindow,
  rows: Awaited<ReturnType<typeof listDailyMetrics>>,
  eventsByName: Awaited<ReturnType<typeof listEventBreakdownFromHits>>,
) {
  const eventShare = toEventShareRows(eventsByName);
  const axisDays = axisDaysFor(window);
  const byDay = new Map(rows.map((row) => [utcDayKey(row.day), row]));
  const points = axisDays.map((day) => {
    const row = byDay.get(utcDayKey(day));
    return {
      label: formatDayLabel(day),
      pageviews: row?.pageviews ?? 0,
      events: row?.events ?? 0,
      visitors: row?.visitors ?? 0,
    };
  });
  const totalsBase = points.reduce(
    (acc, point) => ({
      pageviews: acc.pageviews + point.pageviews,
      events: acc.events + point.events,
      visitors: acc.visitors + point.visitors,
    }),
    { pageviews: 0, events: 0, visitors: 0 },
  );
  const eventsTotal =
    totalsBase.events > 0
      ? totalsBase.events
      : eventShare.reduce((sum, row) => sum + row.count, 0);
  const conversions = totalConversionsFromEvents(eventsByName);
  const conversionRate =
    totalsBase.pageviews > 0
      ? (conversions / totalsBase.pageviews) * 100
      : 0;
  const eventRate =
    totalsBase.pageviews > 0 ? (eventsTotal / totalsBase.pageviews) * 100 : 0;
  const eventsPerVisit =
    totalsBase.pageviews > 0 ? eventsTotal / totalsBase.pageviews : 0;
  const emptySuffix = rows.length === 0 ? " · aguardando visitas" : "";
  const periodLabel = `${formatRangeLabel(window.from, window.to)}${emptySuffix}`;

  return {
    periodLabel,
    points,
    eventsByName,
    eventShare,
    totals: {
      pageviews: totalsBase.pageviews,
      events: eventsTotal,
      visitors: totalsBase.visitors,
      conversions,
      conversionRate,
      eventRate,
      eventsPerVisit,
    },
    topEvent: eventShare[0] ?? null,
  };
}

function emptyAnalytics(): SiteTrackingAnalytics {
  return {
    ready: false,
    period: "Script de rastreamento",
    range: windowFromDays(14),
    totals: {
      pageviews: 0,
      events: 0,
      visitors: 0,
      conversions: 0,
      conversionRate: 0,
      eventRate: 0,
      eventsPerVisit: 0,
    },
    topEvent: null,
    points: [],
    eventsByName: [],
    eventShare: [],
    eventPlatformMix: [],
    eventTrend: { names: [], points: [] },
    byPath: [],
    byPathFlow: [],
    byDevice: [],
    byBrowser: [],
    byAttribution: [],
    byPlatform: {
      google: { attribution: [], eventsByName: [] },
      meta: { attribution: [], eventsByName: [] },
      other: { attribution: [], eventsByName: [] },
      none: { attribution: [], eventsByName: [] },
    },
  };
}

async function loadSiteTrackingAnalyticsOverviewImpl(
  companyId: string,
  period: ReportPeriod | number = 14,
): Promise<SiteTrackingAnalytics> {
  const empty = emptyAnalytics();
  const site = await trackingSiteForCompany(companyId);
  if (!site) return empty;

  const window = trackingWindowFor(resolvePeriod(period));
  const [rows, eventsByName] = await Promise.all([
    listDailyMetrics(site.id, window),
    listEventBreakdownFromHits(site.id, window),
  ]);
  const overview = buildTrafficOverview(window, rows, eventsByName);

  return {
    ready: true,
    period: overview.periodLabel,
    range: window,
    totals: overview.totals,
    topEvent: overview.topEvent,
    points: overview.points,
    eventsByName: overview.eventsByName,
    eventShare: overview.eventShare,
    eventPlatformMix: [],
    eventTrend: { names: [], points: [] },
    byPath: [],
    byPathFlow: [],
    byDevice: [],
    byBrowser: [],
    byAttribution: [],
    byPlatform: {
      google: { attribution: [], eventsByName: [] },
      meta: { attribution: [], eventsByName: [] },
      other: { attribution: [], eventsByName: [] },
      none: { attribution: [], eventsByName: [] },
    },
  };
}

async function loadSiteTrackingAnalyticsFullImpl(
  companyId: string,
  period: ReportPeriod | number = 14,
): Promise<SiteTrackingAnalytics> {
  const empty = emptyAnalytics();
  const site = await trackingSiteForCompany(companyId);
  if (!site) return empty;

  const window = trackingWindowFor(resolvePeriod(period));
  const [
    rows,
    eventsByName,
    byAttribution,
    googleAttribution,
    metaAttribution,
    otherAttribution,
    noneAttribution,
    googleEvents,
    metaEvents,
    otherEvents,
    noneEvents,
    eventDaily,
    eventPlatform,
    byPath,
    byPathFlow,
    byDevice,
    byBrowser,
  ] = await Promise.all([
    listDailyMetrics(site.id, window),
    listEventBreakdownFromHits(site.id, window),
    listAttributionBreakdownFromHits(site.id, window),
    listAttributionForPlatform(site.id, "google", window),
    listAttributionForPlatform(site.id, "meta", window),
    listAttributionForPlatform(site.id, "other", window),
    listAttributionForPlatform(site.id, "none", window),
    listEventBreakdownForPlatform(site.id, "google", window),
    listEventBreakdownForPlatform(site.id, "meta", window),
    listEventBreakdownForPlatform(site.id, "other", window),
    listEventBreakdownForPlatform(site.id, "none", window),
    listEventDailySeries(site.id, window),
    listEventPlatformBreakdown(site.id, window),
    listPathBreakdown(site.id, window),
    listPathFlowBreakdown(site.id, window),
    listClientBreakdown(site.id, window, "device"),
    listClientBreakdown(site.id, window, "browser"),
  ]);

  const byPlatform: SiteTrackingAnalytics["byPlatform"] = {
    google: { attribution: googleAttribution, eventsByName: googleEvents },
    meta: { attribution: metaAttribution, eventsByName: metaEvents },
    other: { attribution: otherAttribution, eventsByName: otherEvents },
    none: { attribution: noneAttribution, eventsByName: noneEvents },
  };

  const overview = buildTrafficOverview(window, rows, eventsByName);
  const eventPlatformMix = mixEventPlatforms(eventsByName, eventPlatform);
  const axisDays = axisDaysFor(window);
  const eventTrend = buildEventTrend(
    overview.eventShare.slice(0, TOP_EVENT_SERIES).map((row) => row.name),
    axisDays,
    eventDaily,
  );

  return {
    ready: true,
    period: overview.periodLabel,
    range: window,
    totals: overview.totals,
    topEvent: overview.topEvent,
    points: overview.points,
    eventsByName: overview.eventsByName,
    eventShare: overview.eventShare,
    eventPlatformMix,
    eventTrend,
    byPath,
    byPathFlow,
    byDevice,
    byBrowser,
    byAttribution,
    byPlatform,
  };
}

const loadSiteTrackingAnalyticsFullCached = unstable_cache(
  async (companyId: string, periodKey: string) =>
    loadSiteTrackingAnalyticsFullImpl(
      companyId,
      trackingPeriodFromCacheKey(periodKey),
    ),
  ["site-tracking-full"],
  { revalidate: TRACKING_CACHE_SECONDS },
);

const loadSiteTrackingAnalyticsOverviewCached = unstable_cache(
  async (companyId: string, periodKey: string) =>
    loadSiteTrackingAnalyticsOverviewImpl(
      companyId,
      trackingPeriodFromCacheKey(periodKey),
    ),
  ["site-tracking-overview"],
  { revalidate: TRACKING_CACHE_SECONDS },
);

export async function loadSiteTrackingAnalytics(
  companyId: string,
  period: ReportPeriod | number = 14,
): Promise<SiteTrackingAnalytics> {
  return loadSiteTrackingAnalyticsFullCached(
    companyId,
    trackingPeriodCacheKey(period),
  );
}

export async function loadSiteTrackingAnalyticsOverview(
  companyId: string,
  period: ReportPeriod | number = 14,
): Promise<SiteTrackingAnalytics> {
  return loadSiteTrackingAnalyticsOverviewCached(
    companyId,
    trackingPeriodCacheKey(period),
  );
}
