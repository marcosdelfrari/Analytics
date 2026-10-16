import { NextResponse, type NextRequest } from "next/server";
import {
  googleAuthUrl,
  googleConfigured,
  googleIntentCookie,
  googleStateCookie,
  publicOrigin,
} from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/login?erro=config", publicOrigin(request)));
  }

  const state = crypto.randomUUID();
  const origin = publicOrigin(request);
  const intent = request.nextUrl.searchParams.get("intent") === "signup" ? "signup" : "login";
  const response = NextResponse.redirect(googleAuthUrl(origin, state));
  const cookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: origin.startsWith("https://"),
    maxAge: 60 * 10,
  };
  response.cookies.set(googleStateCookie, state, cookie);
  response.cookies.set(googleIntentCookie, intent, cookie);
  return response;
}
