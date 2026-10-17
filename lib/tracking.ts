import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { parseAllowedHostInput } from "@/lib/tracking-domains";

const MAX_ALLOWED_DOMAINS = 20;

export function coletaOrigin() {
  return (process.env.COLETA_ORIGIN ?? "http://localhost:4000").replace(
    /\/$/,
    "",
  );
}

export function trackingSnippet(publicKey: string) {
  const src = `${coletaOrigin()}/tracker.js?key=${encodeURIComponent(publicKey)}`;
  return `<script async src="${src}"></script>`;
}

/** Site e chave de coleta exclusivos deste cliente (1:1 com a conta). */
export async function ensureTrackingSite(userId: string) {
  const existing = await prisma.trackingSite.findUnique({
    where: { userId },
  });
  if (existing) return existing;

  return prisma.trackingSite.create({
    data: {
      userId,
      publicKey: `lt_${randomBytes(16).toString("hex")}`,
    },
  });
}

export async function trackingSiteForUser(userId: string) {
  return prisma.trackingSite.findUnique({ where: { userId } });
}

export async function listRecentHits(siteId: string) {
  return prisma.trackingHit.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function listDailyMetrics(siteId: string, days = 14) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  return prisma.trackingDailyMetric.findMany({
    where: { siteId, day: { gte: since } },
    orderBy: { day: "desc" },
  });
}

export {
  listAttributionBreakdownFromHits,
  listAttributionForPlatform,
  listEventBreakdownForPlatform,
  listEventBreakdownFromHits,
} from "@/lib/tracking-breakdown-sql";

export async function listAllowedDomains(siteId: string) {
  return prisma.trackingAllowedDomain.findMany({
    where: { siteId },
    orderBy: { host: "asc" },
  });
}

export async function addAllowedDomain(siteId: string, rawHost: string) {
  const host = parseAllowedHostInput(rawHost);
  if (!host) {
    return { error: "Informe um domínio válido, ex. cliente.com.br" as const };
  }

  const count = await prisma.trackingAllowedDomain.count({ where: { siteId } });
  if (count >= MAX_ALLOWED_DOMAINS) {
    return {
      error: `Limite de ${MAX_ALLOWED_DOMAINS} domínios por conta.` as const,
    };
  }

  try {
    await prisma.trackingAllowedDomain.create({
      data: { siteId, host },
    });
  } catch {
    return { error: "Este domínio já está na lista." as const };
  }

  return { ok: true as const };
}

export async function removeAllowedDomain(siteId: string, domainId: string) {
  const deleted = await prisma.trackingAllowedDomain.deleteMany({
    where: { id: domainId, siteId },
  });
  if (deleted.count === 0) {
    return { error: "Domínio não encontrado." as const };
  }
  return { ok: true as const };
}

export function jsonStringEntries(value: Prisma.JsonValue) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([key, entry]) =>
    typeof entry === "string" || typeof entry === "number"
      ? [[key, String(entry)] as const]
      : [],
  );
}
