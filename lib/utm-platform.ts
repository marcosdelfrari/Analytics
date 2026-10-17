import type { Platform } from "@/lib/types";

const GOOGLE = /google|adwords|googleads/i;
const META = /facebook|meta|instagram|^fb$|^ig$/i;

export function utmSourcePlatform(source: string): Platform | "other" {
  const value = source.trim().toLowerCase();
  if (!value || value === "(sem origem)") return "other";
  if (GOOGLE.test(value)) return "google";
  if (META.test(value)) return "meta";
  return "other";
}

export function sqlUtmSourceMatchesPlatform(platform: Platform) {
  if (platform === "google") {
    return `(params->>'utm_source' ~* 'google|adwords|googleads')`;
  }
  return `(params->>'utm_source' ~* 'facebook|meta|instagram|^fb$|^ig$')`;
}
