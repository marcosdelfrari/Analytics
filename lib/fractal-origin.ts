/** Origem pública da Fractal API (`../fractal-api`, padrão porta 4000). */
export function coletaOrigin() {
  return (
    process.env.FRACTAL_ORIGIN ??
    process.env.COLETA_ORIGIN ??
    "http://localhost:4000"
  ).replace(/\/$/, "");
}
