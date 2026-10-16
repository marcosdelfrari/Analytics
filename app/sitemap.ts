import type { MetadataRoute } from "next";
import { publicPaths, siteOrigin } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await siteOrigin();

  return publicPaths.map((path) => ({
    url: new URL(path, `${origin}/`).toString(),
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
