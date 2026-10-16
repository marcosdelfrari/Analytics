const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>API Lótus</title>
</head>
<body>
  <h1>API Lótus</h1>
  <p>Contrato público da Lótus Analytics. A descrição para máquinas está em <a href="/openapi.json">/openapi.json</a>.</p>
  <h2>Status</h2>
  <p><code>GET /api/health</code> responde <code>application/json</code> com <code>{"status":"ok"}</code> quando o serviço está disponível.</p>
  <h2>Catálogo</h2>
  <p>A descoberta automática fica em <a href="/.well-known/api-catalog">/.well-known/api-catalog</a> (<code>application/linkset+json</code>).</p>
  <h2>Autenticação</h2>
  <p>O login usa OpenID Connect do Google, com código de autorização. Os metadados estão em <a href="/.well-known/openid-configuration">/.well-known/openid-configuration</a> e <a href="/.well-known/oauth-authorization-server">/.well-known/oauth-authorization-server</a>.</p>
  <p>O recurso protegido está em <a href="/.well-known/oauth-protected-resource">/.well-known/oauth-protected-resource</a>, com o identificador do recurso, os servidores de autorização e os escopos.</p>
  <p>O registro de agentes está em <a href="/auth.md">/auth.md</a>.</p>
  <p>O cartão do servidor MCP está em <a href="/.well-known/mcp/server-card.json">/.well-known/mcp/server-card.json</a>.</p>
  <p>As skills de agente estão em <a href="/.well-known/agent-skills/index.json">/.well-known/agent-skills/index.json</a>.</p>
  <p>O manifesto de descoberta está em <a href="/.well-known/ai-catalog.json">/.well-known/ai-catalog.json</a>.</p>
  <p>O Personal Agent Protocol está em <a href="/.well-known/poppy.json">/.well-known/poppy.json</a>.</p>
</body>
</html>
`;

export function GET() {
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
