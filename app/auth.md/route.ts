function originFrom(request: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return new URL(request.url).origin;
}

function authMarkdown(origin: string) {
  return `# auth.md

Você é um agente. A Fractal aceita registro de agente em nome de um usuário. Siga esta ordem: descobrir, registrar, reivindicar se precisar, usar a credencial.

## Descoberta

1. Busque \`${origin}/.well-known/oauth-protected-resource\`.
2. O campo \`resource\` é o identificador deste recurso. \`authorization_servers\` lista os emissores que podem emitir token para ele. \`bearer_methods_supported\` inclui \`header\`.
3. Busque \`<authorization_servers[0]>/.well-known/oauth-authorization-server\`.
4. Leia o bloco \`agent_auth\`. O \`issuer\` desse documento é o mesmo valor anunciado em \`authorization_servers\`.

## Registro

Envie o registro para \`agent_auth.register_uri\`.

Os tipos aceitos estão em \`identity_types_supported\`:

- \`anonymous\`: não há identidade de usuário ainda. A credencial em \`anonymous.credential_types_supported\` é \`access_token\`. Para a pessoa assumir a conta, use \`anonymous.claim_uri\`.
- \`identity_assertion\`: afirmação \`verified_email\`, listada em \`identity_assertion.assertion_types_supported\`. A credencial em \`identity_assertion.credential_types_supported\` é \`access_token\`. A confirmação também usa \`identity_assertion.claim_uri\`.

## Reivindicação

Abra \`claim_uri\` para a pessoa. Ela entra na Fractal com a conta Google e confirma o código apresentado pelo agente. O login humano fica em \`${origin}/login\`.

## Credencial

Envie o access token no cabeçalho \`Authorization: Bearer\`.

## Revogação

Quando o acesso precisar ser encerrado, envie o token para \`agent_auth.revocation_uri\`.
`;
}

export function GET(request: Request) {
  return new Response(authMarkdown(originFrom(request)), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
