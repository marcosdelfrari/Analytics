import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password.normalize("NFKC"), salt, KEY_LEN)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEY_LEN) return false;
  const derived = (await scryptAsync(
    password.normalize("NFKC"),
    salt,
    KEY_LEN,
  )) as Buffer;
  return timingSafeEqual(expected, derived);
}
