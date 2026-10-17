export function pgConnectionString(connectionString: string): string {
  if (!connectionString.includes("sslmode=")) {
    return connectionString;
  }
  return connectionString.replace(
    /([?&])sslmode=(require|prefer|verify-ca)(?=&|$)/,
    "$1sslmode=verify-full",
  );
}
