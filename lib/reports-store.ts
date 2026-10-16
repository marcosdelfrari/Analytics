import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PublishedReport } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(dataDir, "uploads");
const indexPath = path.join(dataDir, "reports.json");

async function ensureStore() {
  await mkdir(uploadsDir, { recursive: true });
  try {
    await readFile(indexPath, "utf8");
  } catch {
    await writeFile(indexPath, "[]", "utf8");
  }
}

export async function listReports(clientId?: string): Promise<PublishedReport[]> {
  try {
    await ensureStore();
    const raw = await readFile(indexPath, "utf8");
    const reports = JSON.parse(raw) as PublishedReport[];
    return reports
      .filter((report) => (clientId ? report.clientId === clientId : true))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  } catch {
    return [];
  }
}

export async function getReport(id: string): Promise<PublishedReport | null> {
  const reports = await listReports();
  return reports.find((report) => report.id === id) ?? null;
}

export async function saveReport(
  report: PublishedReport,
  file?: { buffer: Buffer; storedFile: string },
) {
  await ensureStore();
  if (file) {
    await writeFile(path.join(uploadsDir, file.storedFile), file.buffer);
  }
  const reports = await listReports();
  reports.unshift(report);
  await writeFile(indexPath, JSON.stringify(reports, null, 2), "utf8");
}

export async function deleteReport(id: string) {
  await ensureStore();
  const reports = await listReports();
  const next = reports.filter((report) => report.id !== id);
  await writeFile(indexPath, JSON.stringify(next, null, 2), "utf8");
}

export async function deleteReportsForClient(clientId: string) {
  await ensureStore();
  const reports = await listReports();
  const next = reports.filter((report) => report.clientId !== clientId);
  await writeFile(indexPath, JSON.stringify(next, null, 2), "utf8");
}

export function uploadPath(storedFile: string) {
  return path.join(uploadsDir, storedFile);
}
