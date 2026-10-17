import { prisma } from "@/lib/prisma";
import { fetchHtmlForVerification } from "@/lib/ssrf-safe-fetch";
import { coletaOrigin } from "@/lib/tracking";
import { urlHostAllowed } from "@/lib/tracking-domains";

export type HtmlVerifyResult =
  | { error: string }
  | {
      ok: true;
      foundTrackerScript: boolean;
      foundPublicKey: boolean;
      pageUrl: string;
      message: string;
    };

function detectTrackerInHtml(html: string, publicKey: string) {
  const lower = html.toLowerCase();
  const origin = coletaOrigin().toLowerCase();

  const foundTrackerScript =
    lower.includes("/tracker.js") &&
    (lower.includes(origin) || lower.includes("tracker.js?key="));

  const encodedKey = encodeURIComponent(publicKey).toLowerCase();
  const foundPublicKey =
    lower.includes(publicKey.toLowerCase()) ||
    lower.includes(`key=${encodedKey}`) ||
    lower.includes(`key=${publicKey.toLowerCase()}`);

  return { foundTrackerScript, foundPublicKey };
}

export async function verifyTrackerInPageHtml(
  pageUrlRaw: string,
  publicKey: string,
  allowedHosts: string[],
): Promise<HtmlVerifyResult> {
  if (allowedHosts.length === 0) {
    return {
      error: "Cadastre ao menos um domínio autorizado antes de testar.",
    };
  }

  const withProtocol = pageUrlRaw.trim().includes("://")
    ? pageUrlRaw.trim()
    : `https://${pageUrlRaw.trim()}`;

  let pageUrl: URL;
  try {
    pageUrl = new URL(withProtocol);
  } catch {
    return { error: "Informe uma URL válida da página do site." };
  }

  if (pageUrl.protocol !== "http:" && pageUrl.protocol !== "https:") {
    return { error: "Use um endereço http ou https." };
  }

  if (!urlHostAllowed(pageUrl.toString(), allowedHosts)) {
    return {
      error: "Esta URL não pertence a um domínio autorizado desta conta.",
    };
  }

  let html: string;
  try {
    html = await fetchHtmlForVerification(pageUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao acessar a página.";
    return { error: message };
  }

  const { foundTrackerScript, foundPublicKey } = detectTrackerInHtml(
    html,
    publicKey,
  );

  if (foundTrackerScript && foundPublicKey) {
    return {
      ok: true,
      foundTrackerScript,
      foundPublicKey,
      pageUrl: pageUrl.toString(),
      message:
        "Encontramos a tag do tracker e a sua chave no HTML inicial da página.",
    };
  }

  if (foundTrackerScript) {
    return {
      ok: true,
      foundTrackerScript,
      foundPublicKey,
      pageUrl: pageUrl.toString(),
      message:
        "Encontramos tracker.js, mas não a sua chave. Confira se o script usa a chave desta conta.",
    };
  }

  return {
    ok: true,
    foundTrackerScript,
    foundPublicKey,
    pageUrl: pageUrl.toString(),
    message:
      "Não vimos tracker.js no HTML inicial. Sites em SPA ou tags via GTM podem carregar o script depois — use o teste de visita ao lado.",
  };
}

export async function findPageviewSince(siteId: string, since: Date) {
  return prisma.trackingHit.findFirst({
    where: {
      siteId,
      kind: "pageview",
      createdAt: { gt: since },
    },
    orderBy: { createdAt: "desc" },
    select: {
      path: true,
      url: true,
      params: true,
      createdAt: true,
    },
  });
}
