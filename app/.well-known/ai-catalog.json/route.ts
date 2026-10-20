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
      displayName: "Fractal",
      identifier: `did:web:${didHost}`,
    },
    entries: [
      {
        identifier: `urn:air:${domain}:mcp:analytics`,
        displayName: "Servidor MCP da Fractal",
        type: "application/mcp-server-card+json",
        url: `${origin}/.well-known/mcp/server-card.json`,
        representativeQueries: [
          "onde está o servidor MCP da Fractal",
          "como conectar um agente ao analytics",
          "qual o endpoint do transporte MCP",
        ],
      },
      {
        identifier: `urn:air:${domain}:api:openapi`,
        displayName: "API pública da Fractal",
        type: "application/vnd.oai.openapi+json",
        url: `${origin}/openapi.json`,
        representativeQueries: [
          "qual é o contrato da API",
          "como consultar o status da API",
          "quais rotas públicas existem",
        ],
      },
      {
        identifier: `urn:air:${domain}:skill:fractal`,
        displayName: "Skill de descoberta da Fractal",
        type: "text/markdown",
        url: `${origin}/.well-known/agent-skills/fractal/SKILL.md`,
        representativeQueries: [
          "como um agente descobre a Fractal",
          "onde fica o catálogo e a autenticação",
          "qual skill explica a API pública",
        ],
      },
      {
        identifier: `urn:air:${domain}:api:catalog`,
        displayName: "Catálogo de APIs da Fractal",
        type: "application/linkset+json",
        url: `${origin}/.well-known/api-catalog`,
        representativeQueries: [
          "liste as APIs publicadas",
          "onde está a documentação da API",
          "qual o linkset de descoberta",
        ],
      },
      {
        identifier: `urn:air:${domain}:docs:llms-txt`,
        displayName: "Índice llms.txt da Fractal",
        type: "text/plain",
        url: `${origin}/llms.txt`,
        representativeQueries: [
          "o que é a Fractal analytics",
          "onde está o llms.txt",
          "links de descoberta para agentes",
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
