import type { ContactActionRow } from "@/lib/campaign-analysis/types";
import { orderedParamEntries } from "@/lib/tracking-attribution";

type HitRow = {
  id: string;
  createdAt: Date;
  path: string;
  name: string;
  params: unknown;
  properties: unknown;
};

function recordStrings(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(record)) {
    if (typeof entry === "string" || typeof entry === "number") {
      out[key] = String(entry);
    }
  }
  return out;
}

function contactKind(properties: Record<string, string>) {
  const botao = (properties.botao ?? "").toLowerCase();
  const origem = (properties.origem ?? "").toLowerCase();
  if (botao.includes("whatsapp")) return "whatsapp" as const;
  if (origem.includes("formulario") || origem.includes("formulário")) {
    return "form" as const;
  }
  return "other" as const;
}

function contactTitle(
  kind: ContactActionRow["kind"],
  product?: string,
  path?: string,
) {
  if (kind === "whatsapp") {
    return product
      ? `WhatsApp · ${product}`
      : "WhatsApp · Produto não informado";
  }
  if (kind === "form") {
    if (path === "/" || path === "") return "Formulário · Página inicial";
    return product ? `Formulário · ${product}` : "Formulário · Página";
  }
  return "Ação de contato";
}

export function mapContactHits(hits: HitRow[]): ContactActionRow[] {
  return hits.map((hit) => {
    const properties = recordStrings(hit.properties);
    const params = recordStrings(hit.params);
    const kind = contactKind(properties);
    const product = properties.produto || properties.product || undefined;
    const actionPlace =
      properties.botao ||
      properties.local ||
      properties.contexto ||
      properties.origem ||
      undefined;
    const utmTerm = params.utm_term?.trim() || "—";

    return {
      id: hit.id,
      kind,
      title: contactTitle(kind, product, hit.path),
      at: hit.createdAt.toISOString(),
      path: hit.path,
      product,
      actionPlace,
      campaign: params.utm_campaign ?? "—",
      utmTermLabel: utmTerm ? utmTerm : "Termo registrado na UTM",
      commercialOutcome: "pending",
      attribution: orderedParamEntries(hit.params),
    };
  });
}