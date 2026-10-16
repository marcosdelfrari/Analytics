function originFrom(request: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return new URL(request.url).origin;
}

function airHost(origin: string) {
  const url = new URL(origin);
  const domain = url.hostname;
  const didHost = url.port ? `${url.hostname}%3A${url.port}` : url.hostname;
  return { domain, didHost };
}

export function GET(request: Request) {
  const origin = originFrom(request);
  const { domain, didHost } = airHost(origin);

  const catalog = {
    specVersion: "1.0",
    host: {
      displayName: "Lótus",
      identifier: `did:web:${didHost}`,
    },
    entries: [
      {
        identifier: `urn:air:${domain}:mcp:analytics`,
        displayName: "Servidor MCP da Lótus",
        type: "application/mcp-server-card+json",
        url: `${origin}/.well-known/mcp/server-card.json`,
        representativeQueries: [
          "onde está o servidor MCP da Lótus",
          "como conectar um agente ao analytics",
          "qual o endpoint do transporte MCP",
        ],
      },
      {
        identifier: `urn:air:${domain}:api:openapi`,
        displayName: "API pública da Lótus",
        type: "application/vnd.oai.openapi+json",
        url: `${origin}/openapi.json`,
        representativeQueries: [
          "qual é o contrato da API",
          "como consultar o status da API",
          "quais rotas públicas existem",
        ],
      },
      {
        identifier: `urn:air:${domain}:skill:lotus-analytics`,
        displayName: "Skill de descoberta da Lótus",
        type: "text/markdown",
        url: `${origin}/.well-known/agent-skills/lotus-analytics/SKILL.md`,
        representativeQueries: [
          "como um agente descobre a Lótus",
          "onde fica o catálogo e a autenticação",
          "qual skill explica a API pública",
        ],
      },
      {
        identifier: `urn:air:${domain}:api:catalog`,
        displayName: "Catálogo de APIs da Lótus",
        type: "application/linkset+json",
        url: `${origin}/.well-known/api-catalog`,
        representativeQueries: [
          "liste as APIs publicadas",
          "onde está a documentação da API",
          "qual o linkset de descoberta",
        ],
      },
    ],
  };

  return new Response(JSON.stringify(catalog), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
