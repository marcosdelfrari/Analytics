import { getDashboard } from "@/lib/dashboard";
import {
  getDemoCampaignTree,
  getDemoDashboard,
  getDemoEvolution,
} from "@/lib/demo-analytics";
import {
  loadSiteTrackingAnalytics,
  type SiteTrackingAnalytics,
} from "@/lib/tracking-analytics";
import type {
  CampaignTreeNode,
  EvolutionPoint,
  Platform,
  PublishedReport,
} from "@/lib/types";

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

export type ClientAnalytics = {
  dashboard: DashboardData;
  evolution: EvolutionPoint[];
  campaigns: CampaignTreeNode[];
  siteTracking: SiteTrackingAnalytics | null;
  demo: boolean;
};

function evolutionFromReports(reports: PublishedReport[]): EvolutionPoint[] {
  const byPeriod = new Map<string, { spend: number; conversions: number }>();
  for (const report of reports) {
    const current = byPeriod.get(report.period) ?? {
      spend: 0,
      conversions: 0,
    };
    current.spend += report.spend;
    current.conversions += report.conversions;
    byPeriod.set(report.period, current);
  }
  return [...byPeriod.entries()]
    .map(([label, values]) => ({ label, ...values }))
    .slice(0, 8);
}

export async function loadClientAnalytics(
  clientId: string | undefined,
  planActive: boolean,
): Promise<ClientAnalytics> {
  if (!planActive) {
    const id = clientId ?? "demo";
    return {
      dashboard: getDemoDashboard(id),
      evolution: getDemoEvolution(),
      campaigns: getDemoCampaignTree(),
      siteTracking: null,
      demo: true,
    };
  }

  if (!clientId) {
    const empty = {
      reports: [],
      summaries: [],
      period: "Nenhum período publicado",
      totals: {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        costPerConversion: 0,
      },
    };
    return {
      dashboard: empty,
      evolution: [],
      campaigns: [],
      siteTracking: null,
      demo: false,
    };
  }

  const [dashboard, siteTracking] = await Promise.all([
    getDashboard(clientId),
    loadSiteTrackingAnalytics(clientId),
  ]);

  return {
    dashboard,
    evolution: evolutionFromReports(dashboard.reports),
    campaigns: [],
    siteTracking,
    demo: false,
  };
}

export function filterReportsByPlatform(
  reports: PublishedReport[],
  platform: Platform,
) {
  return reports.filter((report) => report.platform === platform);
}

export function summaryForPlatform(
  analytics: ClientAnalytics,
  platform: Platform,
) {
  return analytics.dashboard.summaries.find(
    (item) => item.platform === platform,
  );
}

export function campaignsForPlatform(
  campaigns: CampaignTreeNode[],
  platform: Platform,
) {
  return campaigns.filter((item) => item.platform === platform);
}
