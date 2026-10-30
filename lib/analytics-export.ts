import type { ClientAnalytics } from "@/lib/analytics";
import { toCsv } from "@/lib/csv";
import { platformLabel } from "@/lib/types";

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

export function analyticsToCsv(analytics: ClientAnalytics) {
  const base = analytics.demo ? "demonstração" : "publicado";
  const rows: Array<Array<string | number | null>> = [];

  for (const summary of analytics.dashboard.summaries) {
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

  for (const report of analytics.dashboard.reports) {
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
    for (const row of tracking.byAttribution) {
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
    for (const row of tracking.eventsByName) {
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

  for (const campaign of analytics.campaigns) {
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
