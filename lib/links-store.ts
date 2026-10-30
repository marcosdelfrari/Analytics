import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

export interface ShortLink {
  code: string;
  url: string;
  label: string;
  clicks: number;
  createdAt: string;
  companyId: string | null;
}

const legacyIndexPath = path.join(process.cwd(), "data", "links.json");

let legacyImportDone = false;

async function importLegacyLinksIfNeeded() {
  if (legacyImportDone) return;
  legacyImportDone = true;

  const count = await prisma.shortLink.count();
  if (count > 0) return;

  let rows: ShortLink[] = [];
  try {
    const raw = await readFile(legacyIndexPath, "utf8");
    const parsed = JSON.parse(raw) as ShortLink[];
    rows = Array.isArray(parsed) ? parsed : [];
  } catch {
    return;
  }

  for (const link of rows) {
    const code = String(link.code ?? "").trim().toLowerCase();
    if (!code) continue;
    await prisma.shortLink
      .create({
        data: {
          code,
          url: String(link.url ?? ""),
          label: String(link.label ?? ""),
          clicks: Number(link.clicks) || 0,
          createdAt: link.createdAt ? new Date(link.createdAt) : new Date(),
          companyId: null,
        },
      })
      .catch(() => undefined);
  }
}

function toShortLink(row: {
  code: string;
  url: string;
  label: string;
  clicks: number;
  createdAt: Date;
  companyId: string | null;
}): ShortLink {
  return {
    code: row.code,
    url: row.url,
    label: row.label,
    clicks: row.clicks,
    createdAt: row.createdAt.toISOString(),
    companyId: row.companyId,
  };
}

export async function listLinks(companyId?: string | null) {
  await importLegacyLinksIfNeeded();
  const where =
    companyId === undefined
      ? {}
      : companyId === null
        ? { companyId: null }
        : { OR: [{ companyId }, { companyId: null }] };

  const links = await prisma.shortLink.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return links.map(toShortLink);
}

export async function listLinksForCompanies(companyIds: string[]) {
  await importLegacyLinksIfNeeded();
  if (companyIds.length === 0) return [];
  const links = await prisma.shortLink.findMany({
    where: { companyId: { in: companyIds } },
    orderBy: { createdAt: "desc" },
  });
  return links.map(toShortLink);
}

export async function findLink(code: string) {
  await importLegacyLinksIfNeeded();
  const row = await prisma.shortLink.findUnique({
    where: { code: code.toLowerCase() },
  });
  return row ? toShortLink(row) : null;
}

export async function saveLink(link: Omit<ShortLink, "createdAt"> & { createdAt?: string }) {
  await importLegacyLinksIfNeeded();
  const code = link.code.toLowerCase();
  await prisma.shortLink.create({
    data: {
      code,
      url: link.url,
      label: link.label,
      clicks: link.clicks,
      companyId: link.companyId,
      createdAt: link.createdAt ? new Date(link.createdAt) : undefined,
    },
  });
}

export async function deleteLink(code: string, companyId?: string | null) {
  await importLegacyLinksIfNeeded();
  const existing = await findLink(code);
  if (!existing) return;
  if (
    companyId !== undefined &&
    existing.companyId !== null &&
    existing.companyId !== companyId
  ) {
    return;
  }
  await prisma.shortLink.delete({ where: { code: code.toLowerCase() } });
}

export async function registerClick(code: string) {
  await importLegacyLinksIfNeeded();
  const normalized = code.toLowerCase();
  const updated = await prisma.shortLink.updateMany({
    where: { code: normalized },
    data: { clicks: { increment: 1 } },
  });
  if (updated.count === 0) return null;
  const row = await prisma.shortLink.findUnique({ where: { code: normalized } });
  return row?.url ?? null;
}
