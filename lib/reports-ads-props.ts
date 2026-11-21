import type { Platform, PlatformSummary, PublishedReport } from "@/lib/types";

/** Dados de relatórios importados por plataforma (seguro para Client Components). */
export type ReportsAdsPlatformBundle = {
  summary: PlatformSummary | undefined;
  reports: PublishedReport[];
};

export type ReportsPublishedAdsData = Record<Platform, ReportsAdsPlatformBundle>;