import { createHash, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const OTP_TTL_MS = 15 * 60 * 1000;

function secret() {
  return process.env.AUTH_SECRET ?? "analytics-dev-secret";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashCode(email: string, code: string) {
  return createHash("sha256")
    .update(`${secret()}:${normalizeEmail(email)}:${code}`)
    .digest("hex");
}

export function generateLoginCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function saveLoginOtp(email: string, code: string) {
  const normalized = normalizeEmail(email);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await prisma.loginOtp.upsert({
    where: { email: normalized },
    create: {
      email: normalized,
      codeHash: hashCode(normalized, code),
      expiresAt,
    },
    update: {
      codeHash: hashCode(normalized, code),
      expiresAt,
    },
  });
}

export async function verifyLoginOtp(email: string, code: string) {
  const normalized = normalizeEmail(email);
  const digits = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(digits)) return false;

  const row = await prisma.loginOtp.findUnique({ where: { email: normalized } });
  if (!row || row.expiresAt.getTime() < Date.now()) {
    if (row) await prisma.loginOtp.delete({ where: { email: normalized } }).catch(() => {});
    return false;
  }

  const expected = Buffer.from(row.codeHash, "hex");
  const actual = Buffer.from(hashCode(normalized, digits), "hex");
  const valid =
    expected.length === actual.length && timingSafeEqual(expected, actual);

  if (valid) {
    await prisma.loginOtp.delete({ where: { email: normalized } });
  }
  return valid;
}
