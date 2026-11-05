import type { TrackingWindow } from "@/lib/report-period";
import type { TrackingMediaOrigin } from "@/lib/utm-platform";

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
  term?: string;
  content?: string;
  /** Agrupamento por página (aba Páginas / legado). */
  path?: string;
  pageviews: number;
  events: number;
  conversions?: number;
};

export type PathBreakdownRow = {
  path: string;
  pageviews: number;
  events: number;
  landings: number;
  conversions?: number;
};

export type PathFlowRow = {
  fromPath: string;
  path: string;
  count: number;
};

export type ClientBreakdownRow = {
  label: string;
  pageviews: number;
  events: number;
  conversions: number;
};

export type SiteTrackingAnalytics = {
  ready: boolean;
  period: string;
  range: TrackingWindow;
  totals: {
    pageviews: number;
    events: number;
    visitors: number;
    conversions: number;
    conversionRate: number;
    /** @deprecated Use conversionRate — mantido para compatibilidade interna */
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
  byDevice: ClientBreakdownRow[];
  byBrowser: ClientBreakdownRow[];
  byAttribution: AttributionBreakdownRow[];
  byPlatform: Record<
    TrackingMediaOrigin,
    {
      attribution: AttributionBreakdownRow[];
      eventsByName: EventBreakdownRow[];
    }
  >;
};

export function toEventShareRows(rows: EventBreakdownRow[]): EventShareRow[] {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return rows.map((row) => ({
    ...row,
    share: total > 0 ? (row.count / total) * 100 : 0,
  }));
}
