import { randomUUID } from "node:crypto";
import type { IncomingEvent, NormalizedHit } from "./types.js";
import { cleanRecord, parseKind } from "./sanitize.js";

const CLIENT_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeClientEventId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 64) return null;
  if (CLIENT_ID_RE.test(trimmed)) return trimmed.toLowerCase();
  return trimmed.slice(0, 64);
}

export function normalizeIncomingEvent(
  raw: IncomingEvent,
  options: { requireClientId: boolean },
): { hit: NormalizedHit } | { error: string } {
  const kind = parseKind(raw.kind);
  const name =
    typeof raw.name === "string" ? raw.name.trim().slice(0, 80) : "";
  const urlValue =
    typeof raw.url === "string" ? raw.url.trim().slice(0, 2000) : "";

  if (!kind || !name || !urlValue) {
    return { error: "Cada evento precisa de tipo, nome e URL." };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlValue);
  } catch {
    return { error: "URL inválida." };
  }

  let clientEventId = normalizeClientEventId(raw.id);
  if (!clientEventId && options.requireClientId) {
    return { error: "Cada evento precisa de um identificador único (id)." };
  }
  if (!clientEventId) {
    clientEventId = randomUUID();
  }

  const referrer =
    typeof raw.referrer === "string" ? raw.referrer.slice(0, 2000) : "";

  return {
    hit: {
      clientEventId,
      kind,
      name,
      url: parsed.toString().slice(0, 2000),
      path: parsed.pathname.slice(0, 500),
      referrer,
      params: cleanRecord(raw.params, 64),
      properties: cleanRecord(raw.properties, 20),
    },
  };
}
