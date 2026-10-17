const TIME_ZONE = "America/Sao_Paulo";

/** Dia civil no fuso do cliente (Brasil), formato YYYY-MM-DD. */
export function dayKeyInTimeZone(value: Date, timeZone = TIME_ZONE): string {
  return value.toLocaleDateString("en-CA", { timeZone });
}
