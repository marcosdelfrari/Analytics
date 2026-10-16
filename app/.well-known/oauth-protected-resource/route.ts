import { oauthMetadata } from "@/lib/oauth-metadata";

function originFrom(request: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return new URL(request.url).origin;
}

export function GET(request: Request) {
  const origin = originFrom(request);
  const { issuer, scopes_supported } = oauthMetadata(origin);

  return new Response(
    JSON.stringify({
      resource: origin,
      authorization_servers: [issuer],
      scopes_supported,
      bearer_methods_supported: ["header"],
      resource_documentation: `${origin}/api/docs`,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
