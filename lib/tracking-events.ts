/** Nome do evento que o Fractal trata como conversão do site (fractal.track). */
export const SITE_CONVERSION_EVENT_NAME = "contato";

export function isSiteConversionEvent(eventName: string | null | undefined) {
  if (!eventName) return false;
  return eventName.trim().toLowerCase() === SITE_CONVERSION_EVENT_NAME;
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
