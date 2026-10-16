import { oauthMetadataResponse } from "@/lib/oauth-metadata";

function originFrom(request: Request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return new URL(request.url).origin;
}

export function GET(request: Request) {
  return oauthMetadataResponse(originFrom(request));
}
