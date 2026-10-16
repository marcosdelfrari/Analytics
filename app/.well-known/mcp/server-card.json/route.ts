function originFrom(request: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return new URL(request.url).origin;
}

export function GET(request: Request) {
  const origin = originFrom(request);
  const endpoint = `${origin}/mcp`;
  const version = "0.1.0";

  const card = {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: "com.lotus/analytics",
    title: "Lótus",
    version,
    description: "Servidor MCP da Lótus para descoberta do analytics de mídia paga.",
    websiteUrl: origin,
    serverInfo: {
      name: "Lótus",
      version,
    },
    remotes: [
      {
        type: "streamable-http",
        url: endpoint,
        supportedProtocolVersions: ["2025-06-18"],
      },
    ],
    transport: {
      type: "streamable-http",
      endpoint,
    },
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  };

  return new Response(JSON.stringify(card), {
    status: 200,
    headers: {
      "Content-Type": "application/mcp-server-card+json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
      "Access-Control-Expose-Headers": "ETag",
    },
  });
}
