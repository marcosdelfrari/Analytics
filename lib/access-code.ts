import { authSecret } from "@/lib/auth-secret";
import {
  AccountRole,
  isSystemAdminAccount,
  type AccountRole as AccountRoleType,
} from "@/lib/access-roles";

export function adminEmailFromEnv() {
  return (process.env.ADMIN_EMAIL ?? "afk.marcos@gmail.com")
    .trim()
    .toLowerCase();
}

export const adminEmail = adminEmailFromEnv();

const encoder = new TextEncoder();

export function roleForEmail(email: string): AccountRoleType {
  return email.trim().toLowerCase() === adminEmail
    ? AccountRole.systemAdmin
    : AccountRole.client;
}

function secret() {
  return authSecret();
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

export async function sealAccess(email: string, role: AccountRoleType) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = encoder.encode(`${email.trim().toLowerCase()}\n${role}`);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), plain);
  return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(cipher))}`;
}

export async function openAccess(
  email: string,
  sealed: string,
): Promise<AccountRoleType | null> {
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
    const validRole =
      role === AccountRole.systemAdmin ||
      role === AccountRole.client ||
      role === "admin" ||
      role === "client";
    if (storedEmail !== normalized || !validRole) return null;
    if (isSystemAdminAccount(role) && normalized !== adminEmail) return null;
    return isSystemAdminAccount(role)
      ? AccountRole.systemAdmin
      : AccountRole.client;
  } catch {
    return null;
  }
}
