import { connection } from "next/server";
import { estimateMarkdownTokens, htmlToAgentMarkdown } from "@/lib/html-to-markdown";

const discoveryLinks =
  '</.well-known/api-catalog>; rel="api-catalog", </sitemap.xml>; rel="describedby"';

export async function GET(request: Request) {
  await connection();
  const pageUrl = new URL("/", request.url);
  const htmlResponse = await fetch(pageUrl, {
    cache: "no-store",
    headers: {
      accept: "text/html",
      "x-lotus-source": "1",
    },
  });
  const html = await htmlResponse.text();
  const markdown = htmlToAgentMarkdown(html);

  return new Response(markdown, {
    status: htmlResponse.ok ? 200 : htmlResponse.status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: discoveryLinks,
      Vary: "Accept",
      "x-markdown-tokens": String(estimateMarkdownTokens(markdown)),
    },
  });
}
