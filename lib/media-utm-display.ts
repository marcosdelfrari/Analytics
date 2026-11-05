import type { AttributionBreakdownRow } from "@/lib/tracking-analytics-shared";

const PLACEHOLDER = new Set([
  "(sem origem)",
  "(sem meio)",
  "(sem campanha)",
  "(sem termo)",
  "(sem conteúdo)",
]);

function utmParamValue(raw: string | undefined) {
  const value = raw?.trim() ?? "";
  if (!value || PLACEHOLDER.has(value)) return "—";
  return value;
}

/** Linha legível: utm_source=ig · utm_campaign=… · … */
export function formatMediaUtmParams(row: AttributionBreakdownRow) {
  return [
    `utm_source=${utmParamValue(row.source)}`,
    `utm_campaign=${utmParamValue(row.campaign)}`,
    `utm_term=${utmParamValue(row.term)}`,
    `utm_content=${utmParamValue(row.content)}`,
    `utm_medium=${utmParamValue(row.medium)}`,
  ].join(" · ");
}

export function mediaUtmParamParts(row: AttributionBreakdownRow) {
  return [
    { key: "utm_source", value: utmParamValue(row.source) },
    { key: "utm_campaign", value: utmParamValue(row.campaign) },
    { key: "utm_term", value: utmParamValue(row.term) },
    { key: "utm_content", value: utmParamValue(row.content) },
    { key: "utm_medium", value: utmParamValue(row.medium) },
  ] as const;
}

export function mediaAttributionRowKey(row: AttributionBreakdownRow) {
  return [
    row.source,
    row.medium,
    row.campaign,
    row.term ?? "",
    row.content ?? "",
    row.path ?? "",
  ].join("\0");
}
