/** Origem pública da Fractal API (Vercel ou `../Fractal-Api` local). */
export const FRACTAL_API_ORIGIN_PRODUCTION =
  "https://fractal.marcosdelfrari.com";

export function coletaOrigin() {
  const configured =
    process.env.FRACTAL_ORIGIN ?? process.env.COLETA_ORIGIN;
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    return FRACTAL_API_ORIGIN_PRODUCTION;
  }

  return "http://localhost:4000";
}
