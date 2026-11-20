import type { TrackingWindow } from "@/lib/report-period";

export type GoogleAdsReportType =
  | "campaign"
  | "keyword"
  | "ad"
  | "search_term"
  | "unknown";

export type ParsedGoogleAdsImport = {
  reportType: GoogleAdsReportType;
  fileName: string;
  currency: string;
  periodFrom: string | null;
  periodTo: string | null;
  campaignNames: string[];
  rows: ParsedGoogleAdsRow[];
  totals: {
    spend: number;
    clicks: number;
    impressions: number;
    conversions: number;
  };
};

export type ParsedGoogleAdsRow = {
  campaign?: string;
  keyword?: string;
  matchType?: string;
  status?: string;
  adTitle?: string;
  finalUrl?: string;
  searchTerm?: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
};

export type KeywordSituation =
  | "validated"
  | "text"
  | "review"
  | "no_tracker";

export type CommercialOutcome =
  | "pending"
  | "contact_received"
  | "qualified"
  | "quote_sent"
  | "sale";

export type CampaignAnalysisKpi = {
  id: "investment" | "visits" | "contact_actions" | "cost_per_action";
  label: string;
  value: string;
  hint: string;
  state: "measured" | "pending" | "unavailable";
};

export type CampaignReadingAction = {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
  actionTab: CampaignAnalysisTab;
};

export type CampaignReading = {
  headline: string;
  summary: string;
  actions: CampaignReadingAction[];
};

export type MeasuredMetric = {
  id: string;
  label: string;
  value: string;
  hint: string;
};

export type CampaignAnalysisTab =
  | "overview"
  | "keywords"
  | "contacts"
  | "data";

export type KeywordAnalysisRow = {
  keyword: string;
  matchType: string;
  spend: number;
  adClicks: number;
  siteActions: number | null;
  costPerAction: number | null;
  situation: KeywordSituation;
  situationLabel: string;
};

export type ContactActionRow = {
  id: string;
  kind: "whatsapp" | "form" | "other";
  title: string;
  at: string;
  path: string;
  product?: string;
  actionPlace?: string;
  campaign: string;
  utmTermLabel: string;
  commercialOutcome: CommercialOutcome;
  attribution: Array<[string, string]>;
};

export type AnalysisSourceState = "ok" | "partial" | "missing" | "empty";

export type ValidationItem = {
  id: string;
  severity: "info" | "warning" | "error";
  title: string;
  detail: string;
};

export type ImportSummary = {
  id: string;
  fileName: string;
  reportType: GoogleAdsReportType;
  periodLabel: string;
  importedAt: string;
  campaignHint: string;
};

export type SourceComparison = {
  googleAds: {
    periodLabel: string;
    spend: string;
    clicks: string;
    impressions: string;
    ctr: string;
    conversions: string;
  } | null;
  site: {
    periodLabel: string;
    visits: string;
    contactActions: string;
    actionDates: string;
    clickDate: string;
  } | null;
};

export type CampaignAnalysisView = {
  demo: boolean;
  campaign: string;
  campaignOptions: string[];
  trackingWindow: TrackingWindow;
  reportWindow: TrackingWindow | null;
  periodAligned: boolean;
  actionDateLabel: string | null;
  sources: {
    site: AnalysisSourceState;
    googleAds: AnalysisSourceState;
    commercial: AnalysisSourceState;
  };
  sourceLabels: {
    site: string;
    googleAds: string;
    commercial: string;
  };
  kpis: CampaignAnalysisKpi[];
  mediaDetails: {
    clicks: number | null;
    impressions: number | null;
    ctr: number | null;
    cpc: number | null;
    adsConversions: number | null;
  };
  reading: CampaignReading;
  measured: MeasuredMetric[];
  keywords: KeywordAnalysisRow[];
  contacts: ContactActionRow[];
  validations: ValidationItem[];
  sourceComparison: SourceComparison;
  imports: ImportSummary[];
  spendCoverage: {
    campaignTotal: number;
    keywordTotal: number;
    unexplained: number;
    keywordClicks: number;
    campaignClicks: number;
  } | null;
  updatedAt: string | null;
};