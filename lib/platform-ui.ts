import type { Platform } from "@/lib/types";

export function utmSourcePlatform(source: string): Platform | null {
  const value = source.trim().toLowerCase();
  if (!value) return null;
  if (/google|adwords|googleads/.test(value)) return "google";
  if (/facebook|meta|instagram|^fb$|^ig$/.test(value)) return "meta";
  return null;
}

export function platformChoiceButtonClass(
  platform: Platform,
  active: boolean,
): string {
  const base =
    "inline-flex items-center gap-2 rounded-sm px-3 py-2 text-[12px] font-medium transition-[color,background-color,box-shadow,border-color] ";

  if (!active) {
    return `${base}border border-border text-muted-foreground hover:border-border hover:bg-surface-elevated hover:text-foreground`;
  }

  if (platform === "google") {
    return `${base}border border-google/50 bg-google/15 text-foreground shadow-sm ring-2 ring-google/35`;
  }

  return `${base}border border-meta/50 bg-meta/15 text-foreground shadow-sm ring-2 ring-meta/35`;
}

export function platformTabButtonClass(
  platform: Platform,
  active: boolean,
): string {
  const base =
    "inline-flex items-center gap-2 rounded-sm px-3 py-2 text-[12px] font-medium transition-[color,background-color,box-shadow] ";

  if (!active) {
    return `${base}text-muted-foreground hover:bg-surface hover:text-foreground`;
  }

  if (platform === "google") {
    return `${base}bg-google/15 text-foreground shadow-sm ring-2 ring-google/35`;
  }

  return `${base}bg-meta/15 text-foreground shadow-sm ring-2 ring-meta/35`;
}
