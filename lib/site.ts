import { headers } from "next/headers";

/** Páginas públicas indexáveis. Rotas internas ficam fora do sitemap. */
export const publicPaths = ["/"] as const;

export async function siteOrigin() {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const headerList = await headers();
  const host = (headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3001")
    .split(",")[0]
    .trim();
  const proto = (headerList.get("x-forwarded-proto") ?? "http").split(",")[0].trim();
  return `${proto}://${host}`;
}
