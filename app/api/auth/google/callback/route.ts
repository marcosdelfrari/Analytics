import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeGoogleCode,
  googleLegacyRedirectUri,
  googleRedirectUri,
  googleReturnCookie,
  googleStateCookie,
  publicOrigin,
} from "@/lib/google-oauth";
import {
  destinationAfterLogin,
  safeReturnPath,
} from "@/lib/auth-redirect";
import { resolveAccountForLogin } from "@/lib/complete-login";
import { sessionCookie, sessionCookieOptions, signSession } from "@/lib/session";

function sameState(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function fail(origin: string, erro: string) {
  const response = NextResponse.redirect(new URL(`/login?erro=${erro}`, origin));
  response.cookies.delete(googleStateCookie);
  response.cookies.delete(googleReturnCookie);
  return response;
}

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);

  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const saved = request.cookies.get(googleStateCookie)?.value;
    const returnTo = safeReturnPath(request.cookies.get(googleReturnCookie)?.value);

    if (!code || !state || !saved || !sameState(state, saved)) {
      return fail(origin, "invalido");
    }

    let profile = await exchangeGoogleCode(code, googleRedirectUri(origin));
    if (!profile) {
      profile = await exchangeGoogleCode(code, googleLegacyRedirectUri(origin));
    }
    if (!profile) return fail(origin, "invalido");

    const email = profile.email.trim().toLowerCase();
    const resolved = await resolveAccountForLogin(email, profile.name);
    if (!resolved.ok) return fail(origin, resolved.error);
    const account = resolved.account;

    const token = await signSession({
      userId: account.id,
      role: account.role,
      name: account.name,
      email: account.email,
    });

    const destination = await destinationAfterLogin(account, returnTo);
    const response = NextResponse.redirect(new URL(destination, origin));
    response.cookies.set(sessionCookie, token, sessionCookieOptions(origin));
    response.cookies.delete(googleStateCookie);
    response.cookies.delete(googleReturnCookie);
    return response;
  } catch (error) {
    console.error("Falha no retorno do Google", error);
    return fail(origin, "servidor");
  }
}
