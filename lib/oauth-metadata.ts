export function organizationDomain(origin: string) {
  return new URL(origin).hostname.replace(/^www\./i, "");
}

export function oauthMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    token_endpoint: "https://oauth2.googleapis.com/token",
    revocation_endpoint: `${origin}/oauth/revoke`,
    jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
    scopes_supported: ["openid", "email", "profile"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    dpop_signing_alg_values_supported: ["ES256"],
    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
    code_challenge_methods_supported: ["S256"],
    poppy_domains: [organizationDomain(origin)],
    service_documentation: `${origin}/api/docs`,
    agent_auth: agentAuth(origin),
  };
}

function agentAuth(origin: string) {
  const registerUri = `${origin}/agent/identity`;
  const claimUri = `${origin}/agent/identity/claim`;
  const revocationUri = `${origin}/oauth/revoke`;

  return {
    skill: `${origin}/auth.md`,
    register_uri: registerUri,
    identity_endpoint: registerUri,
    claim_uri: claimUri,
    claim_endpoint: claimUri,
    revocation_uri: revocationUri,
    identity_types_supported: ["anonymous", "identity_assertion"],
    identity_assertion: {
      assertion_types_supported: ["verified_email"],
      credential_types_supported: ["access_token"],
      claim_uri: claimUri,
    },
    anonymous: {
      credential_types_supported: ["access_token"],
      claim_uri: claimUri,
    },
  };
}

export function oauthMetadataResponse(origin: string) {
  return jsonResponse(oauthMetadata(origin));
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
