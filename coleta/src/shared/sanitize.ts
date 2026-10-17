import { blockedParams, paramValueMaxLength } from "./constants.js";

export function cleanRecord(
  value: unknown,
  limit: number,
): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entries = Object.entries(value).slice(0, limit);
  const record: Record<string, string> = {};
  for (const [key, entry] of entries) {
    const name = String(key).trim().slice(0, 80);
    if (!name || blockedParams.has(name.toLowerCase())) continue;
    if (
      typeof entry === "string" ||
      typeof entry === "number" ||
      typeof entry === "boolean"
    ) {
      record[name] = String(entry).slice(0, paramValueMaxLength(name));
    }
  }
  return record;
}

export function parseKind(value: unknown): "event" | "pageview" | "" {
  if (value === "event") return "event";
  if (value === "pageview") return "pageview";
  return "";
}
