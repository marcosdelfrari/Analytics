import type { NextRequest } from "next/server";

export const googleStateCookie = "google_oauth_state";
export const googleIntentCookie = "google_oauth_intent";

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function publicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const proto = forwardedProto?.split(",")[0]?.trim() || "https";
    const host = forwardedHost.split(",")[0]?.trim();
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

/** URI registrada no Google Cloud (preferencial). */
export function googleRedirectUri(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

/** Compatível com redirect antigo apontando para a home (`/`). */
export function googleLegacyRedirectUri(origin: string) {
  return `${origin}/`;
}

export function googleAuthUrl(origin: string, state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", googleRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  return url;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenResponse.ok) return null;

  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) return null;

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileResponse.ok) return null;

  const profile = (await profileResponse.json()) as {
    email?: string;
    email_verified?: boolean | string;
    name?: string;
  };

  const verified = profile.email_verified === true || profile.email_verified === "true";
  if (!profile.email || !verified) return null;

  return {
    email: profile.email.trim().toLowerCase(),
    name: profile.name?.trim() || profile.email,
  };
}
