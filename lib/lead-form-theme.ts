import type {
  LeadFormDraft,
  LeadFormKind,
  LeadFormThemeMode,
} from "@/lib/lead-form-types";

const HEX_FULL = /^#([0-9A-Fa-f]{6})$/;
const HEX_SHORT = /^#([0-9A-Fa-f]{3})$/;

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (HEX_FULL.test(trimmed)) return trimmed.toLowerCase();
  const short = trimmed.match(HEX_SHORT);
  if (short) {
    const [r, g, b] = short[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

export function resolveLeadFormAccent(
  draft: Pick<LeadFormDraft, "kind" | "brandAccentColor">,
): string {
  const custom = normalizeHexColor(draft.brandAccentColor);
  if (custom) return custom;
  if (draft.kind === "whatsapp_button") return "#25d366";
  return "#ededed";
}

export function contrastTextOnBackground(hex: string): "#0c0c0c" | "#ffffff" {
  const normalized = normalizeHexColor(hex) ?? "#ededed";
  const raw = normalized.slice(1);
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0c0c0c" : "#ffffff";
}

export type LeadFormSurfaceStyles = {
  modalBg: string;
  modalText: string;
  modalMuted: string;
  fieldBg: string;
  fieldBorder: string;
  shellBorder: string;
  footerBg: string;
  dashedBorder: string;
};

export function leadFormThemeStyles(
  mode: LeadFormThemeMode,
): LeadFormSurfaceStyles {
  if (mode === "light") {
    return {
      modalBg: "#ffffff",
      modalText: "#171717",
      modalMuted: "#525252",
      fieldBg: "#f5f5f5",
      fieldBorder: "rgba(0,0,0,0.12)",
      shellBorder: "rgba(0,0,0,0.1)",
      footerBg: "rgba(0,0,0,0.04)",
      dashedBorder: "rgba(0,0,0,0.15)",
    };
  }
  return {
    modalBg: "#161615",
    modalText: "#ededed",
    modalMuted: "#a1a1a1",
    fieldBg: "rgba(12,12,12,0.9)",
    fieldBorder: "rgba(255,255,255,0.1)",
    shellBorder: "rgba(255,255,255,0.12)",
    footerBg: "rgba(0,0,0,0.35)",
    dashedBorder: "rgba(255,255,255,0.15)",
  };
}

export function leadFormUsesCustomTheme(
  draft: Pick<
    LeadFormDraft,
    | "brandLogoUrl"
    | "brandAccentColor"
    | "brandHeaderImageUrl"
    | "brandTheme"
  >,
): boolean {
  return Boolean(
    draft.brandTheme === "light" ||
      draft.brandLogoUrl.trim() ||
      normalizeHexColor(draft.brandAccentColor) ||
      draft.brandHeaderImageUrl.trim(),
  );
}

export function defaultAccentForKind(kind: LeadFormKind): string {
  return kind === "whatsapp_button" ? "#25d366" : "#ededed";
}

export function isAllowedBrandAssetUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
