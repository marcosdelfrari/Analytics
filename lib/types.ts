export type Platform = "google" | "meta";

export type Role = "admin" | "client";

export type CampaignStatus = "ativa" | "pausada" | "aprendizado";

export interface Campaign {
  id: string;
  name: string;
  platform: Platform;
  type: string;
  status: CampaignStatus;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

export interface AdUnit {
  id: string;
  name: string;
  status: CampaignStatus;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface AdGroupNode {
  id: string;
  name: string;
  status: CampaignStatus;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ads: AdUnit[];
}

export interface CampaignTreeNode {
  id: string;
  name: string;
  platform: Platform;
  type: string;
  status: CampaignStatus;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  adGroups: AdGroupNode[];
}

export interface EvolutionPoint {
  label: string;
  spend: number;
  conversions: number;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Plano pago liberado para ver dados reais publicados pela equipe. */
  planActive: boolean;
}

export interface SessionCookie {
  userId: string;
  role: Role;
  name: string;
  email: string;
}

export interface Session extends SessionCookie {
  planActive: boolean;
  /** Cliente com papel de proprietário em ao menos uma organização. */
  isOrganizationOwner: boolean;
}

export interface PlatformSummary {
  platform: Platform;
  label: string;
  spend: number;
  spendChange: number | null;
  impressions: number;
  clicks: number;
  conversions: number;
  activeCampaigns: number | null;
  totalCampaigns: number | null;
  period: string;
}

export interface PublishedReport {
  id: string;
  clientId: string;
  platform: Platform;
  period: string;
  spend: number;
  spendChange: number | null;
  impressions: number;
  clicks: number;
  conversions: number;
  activeCampaigns: number | null;
  totalCampaigns: number | null;
  notes: string;
  fileName: string | null;
  storedFile: string | null;
  publishedAt: string;
}

export function platformLabel(platform: Platform) {
  return platform === "google" ? "Google Ads" : "Meta Ads";
}
