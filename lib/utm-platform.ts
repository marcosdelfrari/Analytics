import type { Platform } from "@/lib/types";

const GOOGLE = /google|adwords|googleads/i;
const META = /facebook|meta|instagram|^fb$|^ig$/i;

/** Origens da coleta do site na aba Mídia (além das plataformas de ads). */
export type TrackingMediaOrigin = Platform | "other" | "none";

export const TRACKING_MEDIA_ORIGIN_LABELS: Record<TrackingMediaOrigin, string> =
  {
    google: "Google Ads",
    meta: "Meta Ads",
    other: "Outros",
    none: "Sem dados",
  };

export function utmSourcePlatform(source: string): Platform | "other" | "none" {
  const value = source.trim().toLowerCase();
  if (!value || value === "(sem origem)") return "none";
  if (GOOGLE.test(value)) return "google";
  if (META.test(value)) return "meta";
  return "other";
}

export function sqlUtmSourceMatchesPlatform(platform: Platform) {
  if (platform === "google") {
    return `(params->>'utm_source' ~* 'google|adwords|googleads')`;
  }
  return `(params->>'utm_source' ~* 'facebook|meta|instagram|^fb$|^ig$')`;
}

/** Filtro em colunas agregadas (`source`), não em JSON de hits brutos. */
export function sqlSourceMatchesPlatform(platform: Platform) {
  if (platform === "google") {
    return `(source ~* 'google|adwords|googleads')`;
  }
  return `(source ~* 'facebook|meta|instagram|^fb$|^ig$')`;
}

const SQL_SOURCE_GOOGLE = `(source ~* 'google|adwords|googleads')`;
const SQL_SOURCE_META = `(source ~* 'facebook|meta|instagram|^fb$|^ig$')`;
const SQL_SOURCE_NONE = `(NULLIF(TRIM(source), '') IS NULL OR source = '(sem origem)')`;

/** Filtro de origem na tabela agregada de atribuição. */
export function sqlSourceMatchesMediaOrigin(origin: TrackingMediaOrigin) {
  if (origin === "google") return SQL_SOURCE_GOOGLE;
  if (origin === "meta") return SQL_SOURCE_META;
  if (origin === "none") return SQL_SOURCE_NONE;
  return `(NOT ${SQL_SOURCE_NONE} AND NOT ${SQL_SOURCE_GOOGLE} AND NOT ${SQL_SOURCE_META})`;
}

const SQL_HIT_SOURCE = `NULLIF(TRIM(params->>'utm_source'), '')`;
const SQL_HIT_GOOGLE = `(${SQL_HIT_SOURCE} ~* 'google|adwords|googleads')`;
const SQL_HIT_META = `(${SQL_HIT_SOURCE} ~* 'facebook|meta|instagram|^fb$|^ig$')`;
const SQL_HIT_NONE = `(${SQL_HIT_SOURCE} IS NULL)`;

/** Filtro de origem nos hits brutos (`params` JSON). */
export function sqlHitSourceMatchesMediaOrigin(origin: TrackingMediaOrigin) {
  if (origin === "google") return SQL_HIT_GOOGLE;
  if (origin === "meta") return SQL_HIT_META;
  if (origin === "none") return SQL_HIT_NONE;
  return `(NOT ${SQL_HIT_NONE} AND NOT ${SQL_HIT_GOOGLE} AND NOT ${SQL_HIT_META})`;
}

export function trackingMediaOriginLabel(origin: TrackingMediaOrigin) {
  return TRACKING_MEDIA_ORIGIN_LABELS[origin];
}
