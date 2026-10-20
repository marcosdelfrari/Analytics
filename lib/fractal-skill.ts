export const fractalSkillName = "fractal";

export const fractalSkillDescription =
  "Descubra a API pública, o catálogo, a autenticação e o status da Fractal. Use ao integrar um agente com este site.";

export const fractalSkillMarkdown = `---
name: ${fractalSkillName}
description: ${fractalSkillDescription}
---

# Fractal

Use esta skill para localizar a superfície pública da Fractal antes de chamar qualquer rota.

## O produto (resumo)

A Fractal é a API de trackeamento e atribuição do ecossistema marcosdelfrari.com: mapeia origens, interações e conversões de ponta a ponta para quem investe em Google Ads e Meta Ads. Unifica investimento publicado no painel com visitas e eventos do site (script no \`head\` ou GTM, API \`fractal.track(...)\`), encurtador com UTMs e dashboards. Cadastro gratuito; uso dos recursos mediante plano Pro ou Agency (multi-cliente). A landing em \`/\` explica benefícios, planos e FAQ; \`/llms.txt\` resume links para humanos e agentes.

## Descoberta

1. Leia \`/llms.txt\` para o índice completo.
2. Leia \`/.well-known/ai-catalog.json\` (AIR) e \`/.well-known/api-catalog\` (\`application/linkset+json\`).
3. A especificação está em \`/openapi.json\`. A documentação humana está em \`/api/docs\`.
4. O status está em \`GET /api/health\` e responde \`{"status":"ok"}\`.

## Autenticação

1. Leia \`/.well-known/oauth-protected-resource\`.
2. Siga \`authorization_servers\` até \`/.well-known/oauth-authorization-server\`.
3. O registro de agentes está em \`/auth.md\`.

## Servidor MCP

O cartão está em \`/.well-known/mcp/server-card.json\`. O transporte anunciado é \`/mcp\`.
`;
