export const lotusSkillName = "lotus-analytics";

export const lotusSkillDescription =
  "Descubra a API pública, o catálogo, a autenticação e o status da Lótus. Use ao integrar um agente com este site.";

export const lotusSkillMarkdown = `---
name: ${lotusSkillName}
description: ${lotusSkillDescription}
---

# Lótus Analytics

Use esta skill para localizar a superfície pública da Lótus antes de chamar qualquer rota.

## Descoberta

1. Leia \`/.well-known/api-catalog\` (\`application/linkset+json\`).
2. A especificação está em \`/openapi.json\`. A documentação humana está em \`/api/docs\`.
3. O status está em \`GET /api/health\` e responde \`{"status":"ok"}\`.

## Autenticação

1. Leia \`/.well-known/oauth-protected-resource\`.
2. Siga \`authorization_servers\` até \`/.well-known/oauth-authorization-server\`.
3. O registro de agentes está em \`/auth.md\`.

## Servidor MCP

O cartão está em \`/.well-known/mcp/server-card.json\`. O transporte anunciado é \`/mcp\`.
`;
