import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { acceptsMarkdown } from "@/lib/html-to-markdown";

const discoveryLinks =
  '</llms.txt>; rel="describedby", </.well-known/ai-catalog.json>; rel="ai-catalog", </.well-known/api-catalog>; rel="api-catalog", </sitemap.xml>; rel="sitemap"';

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname === "/" &&
    searchParams.has("code") &&
    searchParams.has("state")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/auth/google/callback";
    return NextResponse.redirect(url);
  }

  if (
    pathname === "/" &&
    request.headers.get("x-lotus-source") !== "1" &&
    acceptsMarkdown(request.headers.get("accept"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/internal/markdown";
    return NextResponse.rewrite(url);
  }

  const response = NextResponse.next();
  if (pathname === "/") {
    response.headers.append("Link", discoveryLinks);
    response.headers.append("Vary", "Accept");
  }
  return response;
}

export const config = {
  matcher: "/",
};
