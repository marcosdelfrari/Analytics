import { openAccess, sealAccess } from "@/lib/access-code";
import type { Session } from "@/lib/types";

export const sessionCookie = "analytics_session";

export function sessionCookieOptions(origin?: string) {
  const secure = origin
    ? origin.startsWith("https://")
    : process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure,
    maxAge: 60 * 60 * 24 * 14,
  };
}

const encoder = new TextEncoder();

function secret() {
  return process.env.AUTH_SECRET ?? "analytics-dev-secret";
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signSession(session: Session) {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        userId: session.userId,
        name: session.name,
        email: session.email,
        access: await sealAccess(session.email, session.role),
      }),
    ),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    encoder.encode(payload),
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function readSession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(),
    fromBase64Url(signature),
    encoder.encode(payload),
  );
  if (!valid) return null;

  try {
    const stored = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      userId?: string;
      name?: string;
      email?: string;
      access?: string;
    };
    if (!stored.userId || !stored.email || !stored.access) return null;
    const role = await openAccess(stored.email, stored.access);
    if (!role) return null;
    return {
      userId: stored.userId,
      role,
      name: stored.name ?? stored.email,
      email: stored.email,
    };
  } catch {
    return null;
  }
}
