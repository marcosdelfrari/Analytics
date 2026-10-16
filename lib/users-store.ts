import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { adminEmail, openAccess, roleForEmail, sealAccess } from "@/lib/access-code";
import type { Account, Role } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const usersPath = path.join(dataDir, "users.json");

type StoredUser = {
  id?: string;
  name?: string;
  email?: string;
  access?: string;
  role?: string | boolean;
  passwordHash?: string;
};

async function readStoredUsers() {
  try {
    const raw = await readFile(usersPath, "utf8");
    const users = JSON.parse(raw) as StoredUser[];
    return Array.isArray(users) ? users : [];
  } catch {
    return null;
  }
}

async function writeUsers(users: Account[]) {
  await mkdir(dataDir, { recursive: true });
  const stored = await Promise.all(
    users.map(async (user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      access: await sealAccess(user.email, user.role),
    })),
  );
  await writeFile(usersPath, JSON.stringify(stored, null, 2), "utf8");
}

function legacyRole(email: string, row: StoredUser): Role | null {
  if (row.role === "admin" || row.role === "client" || row.role === "true" || row.role === true) {
    return roleForEmail(email);
  }
  return null;
}

async function ensureUsers() {
  await mkdir(dataDir, { recursive: true });
  const existing = await readStoredUsers();
  const users: Account[] = [];
  let dirty = existing === null;

  for (const row of existing ?? []) {
    const email = String(row.email ?? "").trim().toLowerCase();
    if (!row.id || !email.includes("@")) {
      dirty = true;
      continue;
    }

    const resolvedEmail = email === "admin@analytics.local" ? adminEmail : email;
    if (resolvedEmail !== email) dirty = true;

    const opened = row.access ? await openAccess(resolvedEmail, row.access) : null;
    const role = opened ?? legacyRole(resolvedEmail, row) ?? roleForEmail(resolvedEmail);
    if (opened !== role) dirty = true;
    if ("role" in row || "passwordHash" in row) dirty = true;

    const previous = users.find((user) => user.email === resolvedEmail);
    if (previous) {
      dirty = true;
      continue;
    }

    users.push({
      id: row.id,
      name: String(row.name ?? "").trim() || resolvedEmail,
      email: resolvedEmail,
      role,
    });
  }

  if (!users.some((user) => user.email === adminEmail)) {
    users.push({
      id: randomUUID(),
      name: "Administrador",
      email: adminEmail,
      role: "admin",
    });
    dirty = true;
  }

  const normalized = users.map((user) => ({ ...user, role: roleForEmail(user.email) }));
  if (normalized.some((user, index) => user.role !== users[index]?.role)) dirty = true;

  if (dirty) await writeUsers(normalized);
  return normalized;
}

export async function ensureAdminFromEnv() {
  await ensureUsers();
}

export async function listAccounts() {
  return ensureUsers();
}

export async function listClients() {
  const users = await ensureUsers();
  return users.filter((user) => user.role === "client");
}

export async function findAccountByEmail(email: string) {
  const users = await ensureUsers();
  return users.find((user) => user.email === email.trim().toLowerCase()) ?? null;
}

export async function findAccountById(id: string) {
  const users = await ensureUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function createClient(input: { name: string; email: string }) {
  const users = await ensureUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((user) => user.email === email)) {
    return { error: "Já existe uma conta com esse e-mail." } as const;
  }

  const account: Account = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    role: roleForEmail(email),
  };
  users.push(account);
  await writeUsers(users);
  return { account } as const;
}

export async function deleteAccount(id: string) {
  const users = await ensureUsers();
  await writeUsers(users.filter((user) => user.id !== id || user.email === adminEmail));
}
