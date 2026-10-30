import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import type { Platform, PublishedReport } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(dataDir, "uploads");
const legacyIndexPath = path.join(dataDir, "reports.json");

let legacyImportDone = false;

async function ensureUploadsDir() {
  await mkdir(uploadsDir, { recursive: true });
}

function toPublishedReport(row: {
  id: string;
  companyId: string;
  platform: string;
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
  publishedAt: Date;
}): PublishedReport {
  return {
    id: row.id,
    clientId: row.companyId,
    platform: row.platform as Platform,
    period: row.period,
    spend: row.spend,
    spendChange: row.spendChange,
    impressions: row.impressions,
    clicks: row.clicks,
    conversions: row.conversions,
    activeCampaigns: row.activeCampaigns,
    totalCampaigns: row.totalCampaigns,
    notes: row.notes,
    fileName: row.fileName,
    storedFile: row.storedFile,
    publishedAt: row.publishedAt.toISOString(),
  };
}

async function importLegacyReportsIfNeeded() {
  if (legacyImportDone) return;
  legacyImportDone = true;

  const count = await prisma.publishedReport.count();
  if (count > 0) return;

  let rows: PublishedReport[] = [];
  try {
    const raw = await readFile(legacyIndexPath, "utf8");
    const parsed = JSON.parse(raw) as PublishedReport[];
    rows = Array.isArray(parsed) ? parsed : [];
  } catch {
    return;
  }

  for (const report of rows) {
    if (!report.clientId || !report.id) continue;
    const company = await prisma.company.findUnique({
      where: { id: report.clientId },
    });
    if (!company) continue;

    await prisma.publishedReport
      .create({
        data: {
          id: report.id,
          companyId: report.clientId,
          platform: report.platform,
          period: report.period,
          spend: report.spend,
          spendChange: report.spendChange,
          impressions: report.impressions,
          clicks: report.clicks,
          conversions: report.conversions,
          activeCampaigns: report.activeCampaigns,
          totalCampaigns: report.totalCampaigns,
          notes: report.notes ?? "",
          fileName: report.fileName,
          storedFile: report.storedFile,
          publishedAt: report.publishedAt
            ? new Date(report.publishedAt)
            : new Date(),
        },
      })
      .catch(() => undefined);
  }
}

export async function listReports(clientId?: string): Promise<PublishedReport[]> {
  await importLegacyReportsIfNeeded();
  const rows = await prisma.publishedReport.findMany({
    where: clientId ? { companyId: clientId } : undefined,
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toPublishedReport);
}

export async function getReport(id: string): Promise<PublishedReport | null> {
  await importLegacyReportsIfNeeded();
  const row = await prisma.publishedReport.findUnique({ where: { id } });
  return row ? toPublishedReport(row) : null;
}

export async function saveReport(
  report: PublishedReport,
  file?: { buffer: Buffer; storedFile: string },
) {
  await ensureUploadsDir();
  await importLegacyReportsIfNeeded();
  if (file) {
    await writeFile(path.join(uploadsDir, file.storedFile), file.buffer);
  }

  await prisma.publishedReport.create({
    data: {
      id: report.id,
      companyId: report.clientId,
      platform: report.platform,
      period: report.period,
      spend: report.spend,
      spendChange: report.spendChange,
      impressions: report.impressions,
      clicks: report.clicks,
      conversions: report.conversions,
      activeCampaigns: report.activeCampaigns,
      totalCampaigns: report.totalCampaigns,
      notes: report.notes,
      fileName: report.fileName,
      storedFile: report.storedFile,
      publishedAt: new Date(report.publishedAt),
    },
  });
}

export async function deleteReport(id: string) {
  await importLegacyReportsIfNeeded();
  await prisma.publishedReport.delete({ where: { id } }).catch(() => undefined);
}

export async function deleteReportsForClient(clientId: string) {
  await importLegacyReportsIfNeeded();
  await prisma.publishedReport.deleteMany({ where: { companyId: clientId } });
}

export function uploadPath(storedFile: string) {
  return path.join(uploadsDir, storedFile);
}
