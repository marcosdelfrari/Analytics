/** Ordem preferida ao exibir parâmetros de campanha / clique na UI. */
export const ATTRIBUTION_PARAM_ORDER = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "gad_source",
  "gad_campaignid",
  "fbclid",
  "msclkid",
  "dclid",
  "ttclid",
] as const;

export function orderedParamEntries(
  params: unknown,
): Array<[string, string]> {
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return [];
  }
  const record = params as Record<string, unknown>;
  const seen = new Set<string>();
  const entries: Array<[string, string]> = [];

  for (const key of ATTRIBUTION_PARAM_ORDER) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      entries.push([key, value]);
      seen.add(key);
    }
  }

  for (const [key, value] of Object.entries(record)) {
    if (seen.has(key)) continue;
    if (typeof value === "string" && value.trim()) {
      entries.push([key, value]);
    }
  }

  return entries;
}
