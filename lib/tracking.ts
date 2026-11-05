import { randomBytes } from "node:crypto";
import { coletaOrigin } from "@/lib/fractal-origin";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  addDaysToKey,
  dateKeyToUtc,
  type TrackingWindow,
} from "@/lib/report-period";
import { parseAllowedHostInput } from "@/lib/tracking-domains";
import {
  sqlHitSourceMatchesMediaOrigin,
  type TrackingMediaOrigin,
} from "@/lib/utm-platform";

const MAX_ALLOWED_DOMAINS = 20;

export { coletaOrigin };

export function trackingSnippet(publicKey: string) {
  const src = `${coletaOrigin()}/tracker.js?key=${encodeURIComponent(publicKey)}`;
  return `<script async src="${src}"></script>`;
}

/** Site e chave de coleta exclusivos desta empresa (1:1). */
export async function ensureTrackingSite(companyId: string) {
  const existing = await prisma.trackingSite.findUnique({
    where: { companyId },
  });
  if (existing) return existing;

  return prisma.trackingSite.create({
    data: {
      companyId,
      publicKey: `lt_${randomBytes(16).toString("hex")}`,
    },
  });
}

export async function trackingSiteForCompany(companyId: string) {
  return prisma.trackingSite.findUnique({ where: { companyId } });
}

export async function listRecentHits(siteId: string) {
  return prisma.trackingHit.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export const HIT_HISTORY_LIMIT = 100;

const hitHistorySelect = {
  id: true,
  createdAt: true,
  kind: true,
  name: true,
  path: true,
  url: true,
  referrer: true,
  visitorId: true,
  params: true,
  properties: true,
} as const;

function createdAtFilter(window: TrackingWindow) {
  return {
    gte: dateKeyToUtc(window.from),
    lt: dateKeyToUtc(addDaysToKey(window.to, 1)),
  };
}

export async function listPageHitHistory(
  siteId: string,
  path: string,
  window: TrackingWindow,
) {
  const where = {
    siteId,
    path,
    createdAt: createdAtFilter(window),
  };
  const [total, hits] = await Promise.all([
    prisma.trackingHit.count({ where }),
    prisma.trackingHit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: HIT_HISTORY_LIMIT,
      select: hitHistorySelect,
    }),
  ]);
  return { total, hits };
}

export async function listEventHitHistory(
  siteId: string,
  name: string,
  window: TrackingWindow,
  origin?: TrackingMediaOrigin,
) {
  if (!origin) {
    const where = {
      siteId,
      name,
      kind: { not: "pageview" as const },
      createdAt: createdAtFilter(window),
    };
    const [total, hits] = await Promise.all([
      prisma.trackingHit.count({ where }),
      prisma.trackingHit.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: HIT_HISTORY_LIMIT,
        select: hitHistorySelect,
      }),
    ]);
    return { total, hits };
  }

  const createdFrom = dateKeyToUtc(window.from);
  const createdToExclusive = dateKeyToUtc(addDaysToKey(window.to, 1));
  const originSql = sqlHitSourceMatchesMediaOrigin(origin);

  type HitRow = {
    id: string;
    createdAt: Date;
    kind: string;
    name: string;
    path: string;
    url: string;
    referrer: string;
    visitorId: string | null;
    params: Prisma.JsonValue;
    properties: Prisma.JsonValue;
  };

  const [countRows, hits] = await Promise.all([
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count
       FROM tracking.mov_hit
       WHERE site_id = $1
         AND name = $2
         AND kind <> 'pageview'
         AND created_at >= $3
         AND created_at < $4
         AND ${originSql}`,
      siteId,
      name,
      createdFrom,
      createdToExclusive,
    ),
    prisma.$queryRawUnsafe<HitRow[]>(
      `SELECT
         id,
         created_at AS "createdAt",
         kind,
         name,
         path,
         url,
         referrer,
         visitor_id AS "visitorId",
         params,
         properties
       FROM tracking.mov_hit
       WHERE site_id = $1
         AND name = $2
         AND kind <> 'pageview'
         AND created_at >= $3
         AND created_at < $4
         AND ${originSql}
       ORDER BY created_at DESC
       LIMIT $5`,
      siteId,
      name,
      createdFrom,
      createdToExclusive,
      HIT_HISTORY_LIMIT,
    ),
  ]);

  return {
    total: Number(countRows[0]?.count ?? 0),
    hits,
  };
}

export async function listDailyMetrics(
  siteId: string,
  window: TrackingWindow,
) {
  const from = dateKeyToUtc(window.from);
  const to = dateKeyToUtc(window.to);

  return prisma.trackingDailyMetric.findMany({
    where: { siteId, day: { gte: from, lte: to } },
    orderBy: { day: "desc" },
  });
}

export {
  listAttributionBreakdownFromHits,
  listAttributionForPlatform,
  listClientBreakdown,
  listEventBreakdownForPlatform,
  listEventBreakdownFromHits,
  listEventDailySeries,
  listEventPlatformBreakdown,
  listPathBreakdown,
  listPathFlowBreakdown,
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
