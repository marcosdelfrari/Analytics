import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authEnabled } from "@/lib/auth-config";
import { readSession, sessionCookie } from "@/lib/session";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/s/")) {
    return NextResponse.next();
  }

  if (!authEnabled) {
    if (request.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const session = await readSession(request.cookies.get(sessionCookie)?.value);
  const isLogin = pathname === "/login";

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLogin) {
    const destination = session.role === "admin" ? "/admin" : "/";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (session?.role === "admin" && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (
    session?.role === "client" &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/encurtador") ||
      pathname.startsWith("/parametros"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
