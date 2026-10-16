import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authEnabled } from "@/lib/auth-config";
import { readSession, sessionCookie } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/s/") || /\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/auth/google/callback";
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && request.nextUrl.searchParams.has("error")) {
    return NextResponse.redirect(new URL("/login?erro=cancelado", request.url));
  }

  if (!authEnabled) {
    if (request.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const session = await readSession(request.cookies.get(sessionCookie)?.value);
  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/api/auth/google");

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname === "/login") {
    const destination =
      session.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (
    session?.role === "client" &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/encurtador") ||
      pathname.startsWith("/parametros"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
