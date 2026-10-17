import { SITE_CACHE_TTL_MS } from "./constants.js";
import { pool } from "./db.js";

export type ResolvedSite = {
  siteId: string;
  allowedHosts: string[];
};

type CacheEntry = ResolvedSite & {
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

export async function resolveSite(publicKey: string): Promise<ResolvedSite | null> {
  const now = Date.now();
  const cached = cache.get(publicKey);
  if (cached && cached.expiresAt > now) {
    return {
      siteId: cached.siteId,
      allowedHosts: cached.allowedHosts,
    };
  }

  const result = await pool.query<{ id: string; host: string | null }>(
    `SELECT s.id, d.host
     FROM tracking_sites s
     LEFT JOIN tracking_allowed_domains d ON d.site_id = s.id
     WHERE s.public_key = $1`,
    [publicKey],
  );
  if (result.rowCount === 0) return null;

  const siteId = result.rows[0].id;
  const allowedHosts = [
    ...new Set(
      result.rows
        .map((row) => row.host)
        .filter((host): host is string => typeof host === "string" && host.length > 0),
    ),
  ];

  cache.set(publicKey, {
    siteId,
    allowedHosts,
    expiresAt: now + SITE_CACHE_TTL_MS,
  });

  return { siteId, allowedHosts };
}

/** Compatível com chamadas que só precisam do id. */
export async function resolveSiteId(publicKey: string): Promise<string | null> {
  const site = await resolveSite(publicKey);
  return site?.siteId ?? null;
}
