import type { Platform, PlatformSummary, PublishedReport } from "@/lib/types";
import { listReports } from "@/lib/reports-store";

function latestByPlatform(reports: PublishedReport[], platform: Platform) {
  return reports.find((report) => report.platform === platform) ?? null;
}

function toSummary(report: PublishedReport): PlatformSummary {
  return {
    platform: report.platform,
    label: report.platform === "google" ? "Google Ads" : "Meta Ads",
    spend: report.spend,
    spendChange: report.spendChange,
    impressions: report.impressions,
    clicks: report.clicks,
    conversions: report.conversions,
    activeCampaigns: report.activeCampaigns,
    totalCampaigns: report.totalCampaigns,
    period: report.period,
  };
}

export async function getDashboard(clientId: string) {
  const reports = await listReports(clientId);
  const google = latestByPlatform(reports, "google");
  const meta = latestByPlatform(reports, "meta");
  const summaries = [google, meta]
    .filter((report): report is PublishedReport => report !== null)
    .map(toSummary);

  const spend = summaries.reduce((total, item) => total + item.spend, 0);
  const impressions = summaries.reduce(
    (total, item) => total + item.impressions,
    0,
  );
  const clicks = summaries.reduce((total, item) => total + item.clicks, 0);
  const conversions = summaries.reduce(
    (total, item) => total + item.conversions,
    0,
  );

  const period =
    summaries.length === 0
      ? "Nenhum período publicado"
      : summaries.every((item) => item.period === summaries[0]?.period)
        ? summaries[0].period
        : summaries.map((item) => `${item.label}: ${item.period}`).join(" · ");

  return {
    reports,
    summaries,
    period,
    totals: {
      spend,
      impressions,
      clicks,
      conversions,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      costPerConversion: conversions > 0 ? spend / conversions : 0,
    },
  };
}
