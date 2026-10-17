import type { Platform } from "@/lib/types";
import {
  listAttributionBreakdownFromHits,
  listAttributionForPlatform,
  listDailyMetrics,
  listEventBreakdownForPlatform,
  listEventBreakdownFromHits,
  trackingSiteForUser,
} from "@/lib/tracking";

export type SiteTrafficPoint = {
  label: string;
  pageviews: number;
  events: number;
};

export type EventBreakdownRow = {
  name: string;
  count: number;
};

export type AttributionBreakdownRow = {
  source: string;
  medium: string;
  campaign: string;
  pageviews: number;
  events: number;
};

export type SiteTrackingAnalytics = {
  ready: boolean;
  period: string;
  totals: {
    pageviews: number;
    events: number;
  };
  points: SiteTrafficPoint[];
  eventsByName: EventBreakdownRow[];
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

export async function loadSiteTrackingAnalytics(
  userId: string,
  days = 14,
): Promise<SiteTrackingAnalytics> {
  const empty: SiteTrackingAnalytics = {
    ready: false,
    period: "Script de rastreamento",
    totals: { pageviews: 0, events: 0 },
    points: [],
    eventsByName: [],
    byAttribution: [],
    byPlatform: {
      google: { attribution: [], eventsByName: [] },
      meta: { attribution: [], eventsByName: [] },
    },
  };

  const site = await trackingSiteForUser(userId);
  if (!site) return empty;

  const [
    rows,
    eventsByName,
    byAttribution,
    googleAttribution,
    metaAttribution,
    googleEvents,
    metaEvents,
  ] = await Promise.all([
    listDailyMetrics(site.id, days),
    listEventBreakdownFromHits(site.id, days),
    listAttributionBreakdownFromHits(site.id, days),
    listAttributionForPlatform(site.id, "google", days),
    listAttributionForPlatform(site.id, "meta", days),
    listEventBreakdownForPlatform(site.id, "google", days),
    listEventBreakdownForPlatform(site.id, "meta", days),
  ]);

  const byPlatform: SiteTrackingAnalytics["byPlatform"] = {
    google: { attribution: googleAttribution, eventsByName: googleEvents },
    meta: { attribution: metaAttribution, eventsByName: metaEvents },
  };

  if (rows.length === 0) {
    return {
      ...empty,
      ready: true,
      period: `Últimos ${days} dias · aguardando visitas`,
      eventsByName,
      byAttribution,
      byPlatform,
    };
  }

  const chronological = [...rows].reverse();
  const points = chronological.map((row) => ({
    label: formatDayLabel(row.day),
    pageviews: row.pageviews,
    events: row.events,
  }));

  const totals = points.reduce(
    (acc, point) => ({
      pageviews: acc.pageviews + point.pageviews,
      events: acc.events + point.events,
    }),
    { pageviews: 0, events: 0 },
  );

  const first = chronological[0]?.day;
  const last = chronological[chronological.length - 1]?.day;
  const period =
    first && last
      ? `${formatDayLabel(first)} – ${formatDayLabel(last)}`
      : `Últimos ${days} dias`;

  return {
    ready: true,
    period,
    totals,
    points,
    eventsByName,
    byAttribution,
    byPlatform,
  };
}
