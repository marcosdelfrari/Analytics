function originFrom(request: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return new URL(request.url).origin;
}

function organizationDomain(origin: string) {
  return new URL(origin).hostname.replace(/^www\./i, "");
}

export function GET(request: Request) {
  const origin = originFrom(request);

  const manifest = {
    protocol_version: "0.1",
    organization: {
      name: "Fractal",
      domain: organizationDomain(origin),
    },
    auth: {
      issuer: origin,
    },
    web: {},
    apis: [
      {
        type: "openapi",
        url: `${origin}/openapi.json`,
        description: "Contrato público da API da Fractal, incluindo o status.",
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
