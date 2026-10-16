import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site";

const privatePaths = [
  "/admin",
  "/api/",
  "/dashboard",
  "/encurtador",
  "/login",
  "/parametros",
  "/relatorios",
  "/s/",
];

const searchCrawlers = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];
const trainingCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
];
const userFetchers = ["ChatGPT-User", "Claude-User", "Perplexity-User"];

const contentSignal = "ai-train=no, search=yes, ai-input=no";

function crawlRules(userAgent: string | string[]) {
  return {
    userAgent,
    allow: "/",
    disallow: privatePaths,
    other: {
      "Content-Signal": contentSignal,
    },
  };
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await siteOrigin();

  return {
    rules: [
      crawlRules("*"),
      crawlRules(searchCrawlers),
      crawlRules(trainingCrawlers),
      crawlRules(userFetchers),
    ],
    sitemap: new URL("/sitemap.xml", `${origin}/`).toString(),
  };
}
