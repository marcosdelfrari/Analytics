const profile = "https://www.rfc-editor.org/info/rfc9727";

function originFrom(request: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return new URL(request.url).origin;
}

export function GET(request: Request) {
  const origin = originFrom(request);
  const api = `${origin}/api`;

  const body = {
    linkset: [
      {
        anchor: api,
        "service-desc": [
          {
            href: `${origin}/openapi.json`,
            type: "application/json",
          },
        ],
        status: [
          {
            href: `${origin}/api/health`,
            type: "application/json",
          },
        ],
        "service-doc": [
          {
            href: `${origin}/api/docs`,
            type: "text/html",
          },
        ],
      },
    ],
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": `application/linkset+json; profile="${profile}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
