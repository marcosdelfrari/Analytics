import { buildCampaignAnalysis } from "@/lib/campaign-analysis/build";
import { mapContactHits } from "@/lib/campaign-analysis/contacts";
import { getDemoCampaignAnalysis } from "@/lib/campaign-analysis/demo";
import type { CampaignAnalysisView } from "@/lib/campaign-analysis/types";
import { listCampaignAdsImports } from "@/lib/campaign-analysis-store";
import {
  localDateKey,
  parseReportPeriod,
  windowFromDays,
  type ReportPeriod,
} from "@/lib/report-period";
import { loadSiteTrackingAnalytics } from "@/lib/tracking-analytics";
import {
  listCampaignContactHits,
  listGoogleCampaignsFromHits,
} from "@/lib/tracking-breakdown-sql";
import { trackingSiteForCompany } from "@/lib/tracking";

export async function loadCampaignAnalysis(input: {
  companyId: string | undefined;
  planActive: boolean;
  period: ReportPeriod;
  campaign?: string;
}): Promise<CampaignAnalysisView> {
  if (!input.planActive || !input.companyId) {
    return getDemoCampaignAnalysis(input.campaign);
  }

  const window =
    input.period.kind === "range"
      ? { from: input.period.from, to: input.period.to }
      : windowFromDays(input.period.days);

  const site = await trackingSiteForCompany(input.companyId);
  const tracking = await loadSiteTrackingAnalytics(
    input.companyId,
    input.period,
  );
  let imports: Awaited<ReturnType<typeof listCampaignAdsImports>> = [];
  try {
    imports = await listCampaignAdsImports(input.companyId);
  } catch {
    imports = [];
  }

  const campaignOptions = site
    ? await listGoogleCampaignsFromHits(site.id, window)
    : [];

  const importCampaigns = imports
    .map((item) => item.campaignName)
    .filter(Boolean);
  const mergedOptions = [...new Set([...campaignOptions, ...importCampaigns])].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );

  const campaign =
    input.campaign && mergedOptions.includes(input.campaign)
      ? input.campaign
      : mergedOptions[0] ?? imports[0]?.campaignName ?? "";

  const contacts =
    site && campaign
      ? mapContactHits(
          await listCampaignContactHits(site.id, window, campaign),
        )
      : [];

  const updatedAt = imports[0]?.updatedAt ?? null;

  if (!campaign && imports.length === 0) {
    return buildCampaignAnalysis({
      demo: false,
      campaign: "",
      campaignOptions: [],
      trackingWindow: tracking?.range ?? window,
      tracking,
      imports: [],
      contacts: [],
      updatedAt: null,
    });
  }

  return buildCampaignAnalysis({
    demo: false,
    campaign,
    campaignOptions: mergedOptions.length > 0 ? mergedOptions : campaign ? [campaign] : [],
    trackingWindow: tracking?.range ?? window,
    tracking,
    imports,
    contacts,
    updatedAt,
  });
}

export function campaignAnalysisPeriodFromSearch(params: {
  dias?: string;
  de?: string;
  ate?: string;
}) {
  return parseReportPeriod(params, localDateKey());
}