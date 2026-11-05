import { coletaOrigin } from "@/lib/fractal-origin";

export function leadFormScriptUrl(formId: string) {
  return `${coletaOrigin()}/lead-form.js?form=${encodeURIComponent(formId)}`;
}

/** Bloco local (fallback) para colar no site do cliente. */
export function leadFormEmbedSnippet(formId: string, kind?: string) {
  const script = `<script async src="${leadFormScriptUrl(formId)}"></script>`;
  if (kind === "section") {
    return `<section id="fractal-lead-form" data-fractal-form></section>\n${script}`;
  }
  return script;
}

export type LeadFormSnippetPayload = {
  formId: string;
  kind?: string;
  scriptUrl: string;
  html: string;
};

/** Busca o snippet na Fractal API (`FRACTAL_ORIGIN` / porta 4000). */
export async function fetchLeadFormSnippet(formId: string) {
  try {
    const response = await fetch(
      `${coletaOrigin()}/v1/forms/${encodeURIComponent(formId)}/snippet`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      return {
        error:
          body?.error ??
          "Não foi possível gerar o script de instalação na Fractal API.",
      } as const;
    }
    return (await response.json()) as LeadFormSnippetPayload;
  } catch {
    return {
      error:
        "Fractal API indisponível. Confirme que o serviço está em execução (porta 4000).",
    } as const;
  }
}
