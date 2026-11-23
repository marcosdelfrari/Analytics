import type { ClientAnalytics } from "@/lib/analytics";
import { toCsv } from "@/lib/csv";
import { platformLabel } from "@/lib/types";
import type { ReportMediaFilter } from "@/lib/utm-platform";

const headers = [
  "base",
  "tipo",
  "plataforma",
  "período",
  "nome",
  "origem",
  "mídia",
  "campanha",
  "investimento",
  "impressões",
  "cliques",
  "conversões",
  "visitas",
  "eventos",
];

export type AnalyticsExportOptions = {
  mediaFilter?: ReportMediaFilter;
};

function isAdsPlatform(
  filter: ReportMediaFilter,
): filter is "google" | "meta" {
  return filter === "google" || filter === "meta";
}

export function analyticsToCsv(
  analytics: ClientAnalytics,
  options: AnalyticsExportOptions = {},
) {
  const mediaFilter = options.mediaFilter ?? "all";
  const base = analytics.demo ? "demonstração" : "publicado";
  const rows: Array<Array<string | number | null>> = [];

  const summaries =
    mediaFilter === "all"
      ? analytics.dashboard.summaries
      : isAdsPlatform(mediaFilter)
        ? analytics.dashboard.summaries.filter(
            (item) => item.platform === mediaFilter,
          )
        : [];

  for (const summary of summaries) {
    rows.push([
      base,
      "resumo",
      platformLabel(summary.platform),
      summary.period,
      summary.label,
      "",
      "",
      "",
      summary.spend,
      summary.impressions,
      summary.clicks,
      summary.conversions,
      "",
      "",
    ]);
  }

  const reports =
    mediaFilter === "all"
      ? analytics.dashboard.reports
      : isAdsPlatform(mediaFilter)
        ? analytics.dashboard.reports.filter(
            (item) => item.platform === mediaFilter,
          )
        : [];

  if (mediaFilter === "all") {
    for (const point of analytics.evolution) {
      rows.push([
        base,
        "evolução",
        "",
        point.label,
        "",
        "",
        "",
        "",
        point.spend,
        "",
        "",
        point.conversions,
        "",
        "",
      ]);
    }
  }

  for (const report of reports) {
    rows.push([
      base,
      "relatório",
      platformLabel(report.platform),
      report.period,
      report.fileName ?? "",
      "",
      "",
      "",
      report.spend,
      report.impressions,
      report.clicks,
      report.conversions,
      "",
      "",
    ]);
  }

  const tracking = analytics.siteTracking;
  if (tracking?.ready) {
    const slice =
      mediaFilter === "all" ? null : tracking.byPlatform[mediaFilter];
    const attribution = slice?.attribution ?? tracking.byAttribution;
    const eventsByName = slice?.eventsByName ?? tracking.eventsByName;

    if (mediaFilter === "all") {
      for (const point of tracking.points) {
        rows.push([
          base,
          "tráfego diário",
          "",
          point.label,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          point.pageviews,
          point.events,
        ]);
      }
    }

    for (const row of attribution) {
      rows.push([
        base,
        "atribuição",
        "",
        tracking.period,
        "",
        row.source,
        row.medium,
        row.campaign,
        "",
        "",
        "",
        "",
        row.pageviews,
        row.events,
      ]);
    }

    if (mediaFilter === "all") {
      for (const row of tracking.byPath) {
        rows.push([
          base,
          "página",
          "",
          tracking.period,
          row.path,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          row.pageviews,
          row.events,
        ]);
      }
      for (const row of tracking.byPathFlow) {
        if (!row.fromPath.trim()) continue;
        rows.push([
          base,
          "navegação",
          "",
          tracking.period,
          `${row.fromPath} → ${row.path}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          row.count,
        ]);
      }
    }

    for (const row of eventsByName) {
      rows.push([
        base,
        "evento",
        "",
        tracking.period,
        row.name,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        row.count,
      ]);
    }
  }

  const campaigns =
    mediaFilter === "all"
      ? analytics.campaigns
      : isAdsPlatform(mediaFilter)
        ? analytics.campaigns.filter((item) => item.platform === mediaFilter)
        : [];

  for (const campaign of campaigns) {
    rows.push([
      base,
      "campanha",
      platformLabel(campaign.platform),
      "",
      campaign.name,
      "",
      "",
      campaign.name,
      campaign.spend,
      campaign.impressions,
      campaign.clicks,
      campaign.conversions,
      "",
      "",
    ]);
    for (const group of campaign.adGroups) {
      rows.push([
        base,
        "grupo",
        platformLabel(campaign.platform),
        "",
        group.name,
        "",
        "",
        campaign.name,
        group.spend,
        group.impressions,
        group.clicks,
        group.conversions,
        "",
        "",
      ]);
      for (const ad of group.ads) {
        rows.push([
          base,
          "anúncio",
          platformLabel(campaign.platform),
          "",
          ad.name,
          "",
          "",
          campaign.name,
          ad.spend,
          ad.impressions,
          ad.clicks,
          ad.conversions,
          "",
          "",
        ]);
      }
    }
  }

  return toCsv(headers, rows);
}
