import type { Role } from "@/lib/types";

export const adminEmail = "afk.marcos@gmail.com";

const encoder = new TextEncoder();

export function roleForEmail(email: string): Role {
  return email.trim().toLowerCase() === adminEmail ? "admin" : "client";
}

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

async function key() {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret()));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function sealAccess(email: string, role: Role) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = encoder.encode(`${email.trim().toLowerCase()}\n${role}`);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), plain);
  return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(cipher))}`;
}

export async function openAccess(email: string, sealed: string): Promise<Role | null> {
  const [iv, cipher] = sealed.split(".");
  if (!iv || !cipher || sealed.split(".").length !== 2) return null;

  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64Url(iv) },
      await key(),
      fromBase64Url(cipher),
    );
    const [storedEmail, role] = new TextDecoder().decode(plain).split("\n");
    const normalized = email.trim().toLowerCase();
    if (storedEmail !== normalized || (role !== "admin" && role !== "client")) return null;
    if (role === "admin" && normalized !== adminEmail) return null;
    return role;
  } catch {
    return null;
  }
}
