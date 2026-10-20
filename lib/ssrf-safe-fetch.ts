import dns from "node:dns/promises";
import net from "node:net";

const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 512_000;

function isPrivateOrLocalIp(ip: string, hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" && (ip === "127.0.0.1" || ip === "::1")) {
    return false;
  }

  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0) return true;
    return false;
  }

  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  return false;
}

async function assertSafeHostname(hostname: string) {
  const records = await dns.lookup(hostname, { all: true });
  if (records.length === 0) {
    throw new Error("Não foi possível resolver o endereço.");
  }
  for (const record of records) {
    if (isPrivateOrLocalIp(record.address, hostname)) {
      throw new Error("Endereço não permitido para verificação.");
    }
  }
}

export async function fetchHtmlForVerification(startUrl: URL): Promise<string> {
  let current = startUrl;

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertSafeHostname(current.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "FractalTrackerVerify/1.0",
        },
      });
    } finally {
      clearTimeout(timer);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Redirecionamento inválido.");
      }
      current = new URL(location, current);
      if (current.protocol !== "http:" && current.protocol !== "https:") {
        throw new Error("Redirecionamento para protocolo não permitido.");
      }
      continue;
    }

    if (!response.ok) {
      throw new Error(`A página respondeu com status ${response.status}.`);
    }

    const reader = response.body?.getReader();
    if (!reader) return "";

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.length;
      if (total > MAX_HTML_BYTES) break;
      chunks.push(value);
    }

    return Buffer.concat(chunks).toString("utf8");
  }

  throw new Error("Muitos redirecionamentos.");
}
