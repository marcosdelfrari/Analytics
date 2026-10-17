function normalizeHostname(host: string): string {
  return host.trim().toLowerCase().replace(/\.$/, "");
}

function hostMatchesAllowed(eventHost: string, allowedHost: string): boolean {
  const host = normalizeHostname(eventHost);
  const allowed = normalizeHostname(allowedHost);
  if (!host || !allowed) return false;
  if (host === allowed) return true;
  return host.endsWith(`.${allowed}`);
}

export function urlHostAllowed(
  urlValue: string,
  allowedHosts: readonly string[],
): boolean {
  if (allowedHosts.length === 0) return false;
  let parsed: URL;
  try {
    parsed = new URL(urlValue);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }
  const host = normalizeHostname(parsed.hostname);
  return allowedHosts.some((allowed) => hostMatchesAllowed(host, allowed));
}
