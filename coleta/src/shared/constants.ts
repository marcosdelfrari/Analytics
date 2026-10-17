export const COLLECT_PATH = "/v1/collect";

export const MAX_BATCH_EVENTS = 20;
export const MAX_BATCH_BYTES = 65_536;
export const MAX_SINGLE_BYTES = 16_384;

export const RATE_LIMIT_EVENTS_PER_MINUTE = 240;

export const WORKER_BATCH_SIZE = 500;
export const WORKER_POLL_MS = 2_000;

export const SITE_CACHE_TTL_MS = 5 * 60_000;

export const blockedParams = new Set([
  "password",
  "passwd",
  "secret",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "code",
  "state",
]);
