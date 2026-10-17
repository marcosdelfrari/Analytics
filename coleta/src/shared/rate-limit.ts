import { RATE_LIMIT_EVENTS_PER_MINUTE } from "./constants.js";

const buckets = new Map<string, number[]>();

export function allowEvents(publicKey: string, count: number): boolean {
  const now = Date.now();
  const fresh = (buckets.get(publicKey) ?? []).filter(
    (time) => now - time < 60_000,
  );

  if (fresh.length + count > RATE_LIMIT_EVENTS_PER_MINUTE) {
    buckets.set(publicKey, fresh);
    return false;
  }

  for (let index = 0; index < count; index += 1) {
    fresh.push(now);
  }
  buckets.set(publicKey, fresh);
  return true;
}
