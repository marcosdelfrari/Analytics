/**
 * pg v8 trata sslmode=require como verify-full e emite warning.
 * Usamos verify-full explicitamente (comportamento atual recomendado pelo driver).
 */
export function pgConnectionString(connectionString: string): string {
  if (!connectionString.includes("sslmode=")) {
    return connectionString;
  }
  return connectionString.replace(
    /([?&])sslmode=(require|prefer|verify-ca)(?=&|$)/,
    "$1sslmode=verify-full",
  );
}
