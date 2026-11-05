/** Nome padrão do evento de conversão do site (fractal.track). */
export const SITE_CONVERSION_EVENT_NAME = "contato";

/** Nomes tratados como conversão na coleta e nos relatórios. */
const SITE_CONVERSION_EVENT_NAMES = new Set([
  SITE_CONVERSION_EVENT_NAME,
  "lead",
]);

/** Filtro SQL em `tracking.mov_hit` para hits de conversão do site. */
export function sqlHitIsSiteConversion() {
  const names = [...SITE_CONVERSION_EVENT_NAMES]
    .map((name) => `'${name.replace(/'/g, "''")}'`)
    .join(", ");
  return `(kind = 'event' AND LOWER(TRIM(name)) IN (${names}))`;
}

export function conversionRatePercent(
  pageviews: number,
  conversions: number,
) {
  return pageviews > 0 ? (conversions / pageviews) * 100 : 0;
}

export function totalConversionsFromEvents(
  rows: { name: string; count: number }[],
) {
  return rows
    .filter((row) => isSiteConversionEvent(row.name))
    .reduce((sum, row) => sum + row.count, 0);
}

export function isSiteConversionEvent(eventName: string | null | undefined) {
  if (!eventName) return false;
  return SITE_CONVERSION_EVENT_NAMES.has(eventName.trim().toLowerCase());
}

export function siteConversionTrackSnippet(
  eventName: string = SITE_CONVERSION_EVENT_NAME,
) {
  return `fractal.track("${eventName}", { botao: "whatsapp" });`;
}

export function siteConversionTrackExampleSnippet(
  eventName: string = SITE_CONVERSION_EVENT_NAME,
) {
  return `fractal.track("${eventName}", { origem: "formulario" });`;
}
