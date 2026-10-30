import { coletaOrigin } from "@/lib/tracking";

export function leadFormScriptUrl(formId: string) {
  return `${coletaOrigin()}/lead-form.js?form=${encodeURIComponent(formId)}`;
}

/** Bloco para colar no site do cliente (Fractal API). */
export function leadFormEmbedSnippet(formId: string) {
  return `<script async src="${leadFormScriptUrl(formId)}"></script>`;
}

export async function fetchLeadFormSnippet(formId: string) {
  const response = await fetch(
    `${coletaOrigin()}/v1/forms/${encodeURIComponent(formId)}/snippet`,
  );
  if (!response.ok) {
    return { error: "Não foi possível gerar o script de instalação." as const };
  }
  return (await response.json()) as {
    formId: string;
    scriptUrl: string;
    html: string;
  };
}
