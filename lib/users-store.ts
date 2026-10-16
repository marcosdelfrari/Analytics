import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { hashPassword } from "@/lib/password";
import type { Account } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const usersPath = path.join(dataDir, "users.json");

async function ensureUsers() {
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(usersPath, "utf8");
    const users = JSON.parse(raw) as Account[];
    if (users.length > 0) return users;
  } catch {
    // arquivo ainda não existe
  }

  const admin: Account = {
    id: randomUUID(),
    name: "Administrador",
    email: "admin@analytics.local",
    passwordHash: hashPassword("admin"),
    role: "admin",
  };
  await writeFile(usersPath, JSON.stringify([admin], null, 2), "utf8");
  return [admin];
}

async function writeUsers(users: Account[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(usersPath, JSON.stringify(users, null, 2), "utf8");
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

export async function createClient(input: {
  name: string;
  email: string;
  password: string;
}) {
  const users = await ensureUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((user) => user.email === email)) {
    return { error: "Já existe uma conta com esse e-mail." } as const;
  }

  const account: Account = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password),
    role: "client",
  };
  users.push(account);
  await writeUsers(users);
  return { account } as const;
}

export async function deleteAccount(id: string) {
  const users = await ensureUsers();
  await writeUsers(users.filter((user) => user.id !== id || user.role === "admin"));
}
