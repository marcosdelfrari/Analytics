import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeGoogleCode,
  googleIntentCookie,
  googleRedirectUri,
  googleStateCookie,
  publicOrigin,
} from "@/lib/google-oauth";
import { sessionCookie, sessionCookieOptions, signSession } from "@/lib/session";
import { createClient, ensureAdminFromEnv, findAccountByEmail } from "@/lib/users-store";

function sameState(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function fail(origin: string, erro: string) {
  const response = NextResponse.redirect(new URL(`/login?erro=${erro}`, origin));
  response.cookies.delete(googleStateCookie);
  response.cookies.delete(googleIntentCookie);
  return response;
}

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);

  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const saved = request.cookies.get(googleStateCookie)?.value;

    if (!code || !state || !saved || !sameState(state, saved)) {
      return fail(origin, "invalido");
    }

    const profile = await exchangeGoogleCode(code, googleRedirectUri(origin));
    if (!profile) return fail(origin, "invalido");

    await ensureAdminFromEnv();
    let account = await findAccountByEmail(profile.email);
    const signingUp = request.cookies.get(googleIntentCookie)?.value === "signup";
    if (!account && signingUp) {
      const created = await createClient({ name: profile.name, email: profile.email });
      account = "error" in created ? await findAccountByEmail(profile.email) : created.account;
    }
    if (!account) return fail(origin, "sem-acesso");

    const token = await signSession({
      userId: account.id,
      role: account.role,
      name: account.name,
      email: account.email,
    });

    const destination = account.role === "admin" ? "/admin" : "/dashboard";
    const response = NextResponse.redirect(new URL(destination, origin));
    response.cookies.set(sessionCookie, token, sessionCookieOptions(origin));
    response.cookies.delete(googleStateCookie);
    response.cookies.delete(googleIntentCookie);
    return response;
  } catch (error) {
    console.error("Falha no retorno do Google", error);
    return fail(origin, "servidor");
  }
}
