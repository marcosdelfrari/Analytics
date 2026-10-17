const FALLBACK = "(sem campanha)";

export function campaignFromParams(params: unknown): string {
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return FALLBACK;
  }
  const raw = (params as Record<string, unknown>).utm_campaign;
  if (typeof raw !== "string") return FALLBACK;
  const trimmed = raw.trim().slice(0, 200);
  return trimmed.length > 0 ? trimmed : FALLBACK;
}
