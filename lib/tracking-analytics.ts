import type { Platform } from "@/lib/types";
import {
  listAttributionBreakdownFromHits,
  listAttributionForPlatform,
  listDailyMetrics,
  listEventBreakdownForPlatform,
  listEventBreakdownFromHits,
  listEventDailySeries,
  listEventPlatformBreakdown,
  listPathBreakdown,
  listPathFlowBreakdown,
  trackingSiteForCompany,
} from "@/lib/tracking";

const TOP_EVENT_SERIES = 5;

export type SiteTrafficPoint = {
  label: string;
  pageviews: number;
  events: number;
  visitors: number;
};

export type EventBreakdownRow = {
  name: string;
  count: number;
};

export type EventShareRow = EventBreakdownRow & {
  share: number;
};

export type EventPlatformMixRow = EventShareRow & {
  google: number;
  meta: number;
  other: number;
};

export type EventTrendPoint = {
  label: string;
  values: number[];
};

export type EventTrendData = {
  names: string[];
  points: EventTrendPoint[];
};

export type AttributionBreakdownRow = {
  source: string;
  medium: string;
  campaign: string;
  pageviews: number;
  events: number;
};

export type PathBreakdownRow = {
  path: string;
  pageviews: number;
  events: number;
  landings: number;
};

export type PathFlowRow = {
  fromPath: string;
  path: string;
  count: number;
};

export type SiteTrackingAnalytics = {
  ready: boolean;
  period: string;
  totals: {
    pageviews: number;
    events: number;
    visitors: number;
    eventRate: number;
    eventsPerVisit: number;
  };
  topEvent: EventShareRow | null;
  points: SiteTrafficPoint[];
  eventsByName: EventBreakdownRow[];
  eventShare: EventShareRow[];
  eventPlatformMix: EventPlatformMixRow[];
  eventTrend: EventTrendData;
  byPath: PathBreakdownRow[];
  byPathFlow: PathFlowRow[];
  byAttribution: AttributionBreakdownRow[];
  byPlatform: Record<
    Platform,
    {
      attribution: AttributionBreakdownRow[];
      eventsByName: EventBreakdownRow[];
    }
  >;
};

function formatDayLabel(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(value);
}

function utcDayKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function toEventShareRows(rows: EventBreakdownRow[]): EventShareRow[] {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return rows.map((row) => ({
    ...row,
    share: total > 0 ? (row.count / total) * 100 : 0,
  }));
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

function uniqueDays(rows: { day: Date }[]) {
  const keys = [...new Set(rows.map((row) => utcDayKey(row.day)))].sort();
  return keys.map((key) => new Date(`${key}T00:00:00.000Z`));
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

function emptyAnalytics(): SiteTrackingAnalytics {
  return {
    ready: false,
    period: "Script de rastreamento",
    totals: {
      pageviews: 0,
      events: 0,
      visitors: 0,
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
    byAttribution: [],
    byPlatform: {
      google: { attribution: [], eventsByName: [] },
      meta: { attribution: [], eventsByName: [] },
    },
  };
}

export async function loadSiteTrackingAnalytics(
  companyId: string,
  days = 14,
): Promise<SiteTrackingAnalytics> {
  const empty = emptyAnalytics();
  const site = await trackingSiteForCompany(companyId);
  if (!site) return empty;

  const [
    rows,
    eventsByName,
    byAttribution,
    googleAttribution,
    metaAttribution,
    googleEvents,
    metaEvents,
    eventDaily,
    eventPlatform,
    byPath,
    byPathFlow,
  ] = await Promise.all([
    listDailyMetrics(site.id, days),
    listEventBreakdownFromHits(site.id, days),
    listAttributionBreakdownFromHits(site.id, days),
    listAttributionForPlatform(site.id, "google", days),
    listAttributionForPlatform(site.id, "meta", days),
    listEventBreakdownForPlatform(site.id, "google", days),
    listEventBreakdownForPlatform(site.id, "meta", days),
    listEventDailySeries(site.id, days),
    listEventPlatformBreakdown(site.id, days),
    listPathBreakdown(site.id, days),
    listPathFlowBreakdown(site.id, days),
  ]);

  const byPlatform: SiteTrackingAnalytics["byPlatform"] = {
    google: { attribution: googleAttribution, eventsByName: googleEvents },
    meta: { attribution: metaAttribution, eventsByName: metaEvents },
  };

  const eventShare = toEventShareRows(eventsByName);
  const eventPlatformMix = mixEventPlatforms(eventsByName, eventPlatform);
  const chronological = [...rows].reverse();
  const axisDays =
    chronological.length > 0
      ? chronological.map((row) => row.day)
      : uniqueDays(eventDaily);
  const eventTrend = buildEventTrend(
    eventShare.slice(0, TOP_EVENT_SERIES).map((row) => row.name),
    axisDays,
    eventDaily,
  );
  const points = chronological.map((row) => ({
    label: formatDayLabel(row.day),
    pageviews: row.pageviews,
    events: row.events,
    visitors: row.visitors,
  }));
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
  const eventRate =
    totalsBase.pageviews > 0 ? (eventsTotal / totalsBase.pageviews) * 100 : 0;
  const eventsPerVisit =
    totalsBase.pageviews > 0 ? eventsTotal / totalsBase.pageviews : 0;
  const first = chronological[0]?.day;
  const last = chronological[chronological.length - 1]?.day;
  const period =
    first && last
      ? `${formatDayLabel(first)} – ${formatDayLabel(last)}`
      : `Últimos ${days} dias${rows.length === 0 ? " · aguardando visitas" : ""}`;

  return {
    ready: true,
    period,
    totals: {
      pageviews: totalsBase.pageviews,
      events: eventsTotal,
      visitors: totalsBase.visitors,
      eventRate,
      eventsPerVisit,
    },
    topEvent: eventShare[0] ?? null,
    points,
    eventsByName,
    eventShare,
    eventPlatformMix,
    eventTrend,
    byPath,
    byPathFlow,
    byAttribution,
    byPlatform,
  };
}
