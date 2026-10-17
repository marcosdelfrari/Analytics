import { LOTUS_SITE_DESCRIPTION, LOTUS_SITE_TITLE } from "@/lib/seo";

/** Corpo de /llms.txt — índice curto para LLMs e answer engines. */
export function buildLlmsTxt(origin: string) {
  const base = origin.replace(/\/$/, "");
  return `# ${LOTUS_SITE_TITLE}

> ${LOTUS_SITE_DESCRIPTION}

## Produto (humanos)

- [Landing page](${base}/): benefícios, como funciona, planos (Pro e Agency), FAQ e cadastro gratuito via Google.
- Negociação \`Accept: text/markdown\` na home devolve a mesma página em Markdown.

## Perguntas frequentes (resumo)

- Foco em clareza financeira: cruzar gasto em Google/Meta com tráfego no site (alternativa mais simples que GA4 para mídia paga).
- Script único no \`<head>\` ou GTM; encurtador integrado a UTMs; plano Agency para multi-cliente.
- Investimento é publicado no painel; dashboards refletem o acordado no período.

## Superfície para agentes

- [Catálogo AIR](${base}/.well-known/ai-catalog.json)
- [Skill lotus-analytics](${base}/.well-known/agent-skills/lotus-analytics/SKILL.md)
- [Índice de skills](${base}/.well-known/agent-skills/index.json)
- [Catálogo de APIs (RFC 9727)](${base}/.well-known/api-catalog)
- [OpenAPI](${base}/openapi.json) · [Docs HTML](${base}/api/docs) · [Health](${base}/api/health)
- [Autenticação de agentes](${base}/auth.md)
- [MCP server card](${base}/.well-known/mcp/server-card.json) · transporte em \`${base}/mcp\`
- [Poppy manifest](${base}/.well-known/poppy.json)

## Rastreamento

- [Sitemap](${base}/sitemap.xml)
- [Robots](${base}/robots.txt)

Área logada (dashboard, campanhas, guia interno): não indexar; ver \`robots.txt\`.
`;
}
