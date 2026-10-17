const HOST_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

export function normalizeHostname(host: string): string {
  return host.trim().toLowerCase().replace(/\.$/, "");
}

export function parseAllowedHostInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 253) return null;

  let hostname: string;
  if (trimmed.includes("://") || trimmed.includes("/")) {
    try {
      const url = new URL(
        trimmed.includes("://") ? trimmed : `https://${trimmed}`,
      );
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      hostname = url.hostname;
    } catch {
      return null;
    }
  } else {
    hostname = trimmed.split("/")[0]?.split(":")[0] ?? "";
  }

  const host = normalizeHostname(hostname);
  if (!host || host.length > 253) return null;
  if (host === "localhost") return host;
  if (!HOST_PATTERN.test(host)) return null;
  return host;
}

export function urlHostAllowed(urlValue: string, allowedHosts: string[]): boolean {
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

export function hostMatchesAllowed(eventHost: string, allowedHost: string): boolean {
  const host = normalizeHostname(eventHost);
  const allowed = normalizeHostname(allowedHost);
  if (!host || !allowed) return false;
  if (host === allowed) return true;
  return host.endsWith(`.${allowed}`);
}
