import { NextResponse, type NextRequest } from "next/server";
import {
  googleAuthUrl,
  googleConfigured,
  googleReturnCookie,
  googleStateCookie,
  publicOrigin,
} from "@/lib/google-oauth";
import { safeReturnPath } from "@/lib/auth-redirect";

export async function GET(request: NextRequest) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/login?erro=config", publicOrigin(request)));
  }

  const state = crypto.randomUUID();
  const origin = publicOrigin(request);
  const returnTo = safeReturnPath(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(googleAuthUrl(origin, state));
  const cookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: origin.startsWith("https://"),
    maxAge: 60 * 10,
  };
  response.cookies.set(googleStateCookie, state, cookie);
  response.cookies.set(googleReturnCookie, returnTo, cookie);
  return response;
}
