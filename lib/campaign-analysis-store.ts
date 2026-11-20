import { createHash } from "node:crypto";
import { parseGoogleAdsCsv } from "@/lib/campaign-analysis/parse-google-ads-csv";
import type { ParsedGoogleAdsImport } from "@/lib/campaign-analysis/types";
import type { GoogleAdsReportType } from "@/lib/campaign-analysis/types";
import { prisma } from "@/lib/prisma";

function hashContent(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export async function listCampaignAdsImports(companyId: string) {
  const rows = await prisma.campaignAdsImport.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    fileName: row.fileName,
    reportType: row.reportType as GoogleAdsReportType,
    periodFrom: row.periodFrom,
    periodTo: row.periodTo,
    campaignName: row.campaignName,
    parsed: row.parsed as unknown as ParsedGoogleAdsImport,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function upsertCampaignAdsImport(input: {
  companyId: string;
  fileName: string;
  raw: string;
  campaignHint?: string;
}) {
  const parsed = parseGoogleAdsCsv(input.fileName, input.raw);
  const contentHash = hashContent(input.raw);
  const campaignName =
    input.campaignHint?.trim() ||
    parsed.campaignNames[0]?.trim() ||
  "";

  const existing = await prisma.campaignAdsImport.findUnique({
    where: {
      companyId_contentHash: {
        companyId: input.companyId,
        contentHash,
      },
    },
  });

  const data = {
    fileName: input.fileName,
    contentHash,
    reportType: parsed.reportType,
    periodFrom: parsed.periodFrom,
    periodTo: parsed.periodTo,
    currency: parsed.currency,
    campaignName,
    parsed: parsed as unknown as object,
  };

  if (existing) {
    const updated = await prisma.campaignAdsImport.update({
      where: { id: existing.id },
      data,
    });
    return { importId: updated.id, parsed, updated: true };
  }

  const created = await prisma.campaignAdsImport.create({
    data: {
      companyId: input.companyId,
      ...data,
    },
  });
  return { importId: created.id, parsed, updated: false };
}