import type { AttributionBreakdownRow, EventBreakdownRow, SiteTrackingAnalytics } from "@/lib/tracking-analytics-shared";
import { isSiteConversionEvent } from "@/lib/tracking-events";
import type { ReportMediaFilter } from "@/lib/utm-platform";

function sumAttribution(rows: AttributionBreakdownRow[]) {
  return rows.reduce(
    (acc, row) => ({
      pageviews: acc.pageviews + row.pageviews,
      events: acc.events + row.events,
      conversions: acc.conversions + (row.conversions ?? 0),
    }),
    { pageviews: 0, events: 0, conversions: 0 },
  );
}

function conversionsFromEvents(eventsByName: EventBreakdownRow[]) {
  return eventsByName
    .filter((row) => isSiteConversionEvent(row.name))
    .reduce((acc, row) => acc + row.count, 0);
}

/** Totais do resumo de tráfego respeitando o filtro de origem (UTM). */
export function trackingTotalsForFilter(
  tracking: SiteTrackingAnalytics,
  filter: ReportMediaFilter,
): SiteTrackingAnalytics["totals"] {
  if (filter === "all") {
    return tracking.totals;
  }

  const { attribution, eventsByName } = tracking.byPlatform[filter];
  const agg = sumAttribution(attribution);
  const events =
    agg.events > 0
      ? agg.events
      : eventsByName.reduce((sum, row) => sum + row.count, 0);
  const conversions =
    agg.conversions > 0 ? agg.conversions : conversionsFromEvents(eventsByName);
  const pageviews = agg.pageviews;
  const conversionRate = pageviews > 0 ? (conversions / pageviews) * 100 : 0;
  const visitors =
    tracking.totals.pageviews > 0
      ? Math.round(
          (tracking.totals.visitors * pageviews) / tracking.totals.pageviews,
        )
      : 0;

  return {
    pageviews,
    events,
    visitors,
    conversions,
    conversionRate,
    eventRate: conversionRate,
    eventsPerVisit: pageviews > 0 ? events / pageviews : 0,
  };
}