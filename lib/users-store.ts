import { readFile } from "node:fs/promises";
import path from "node:path";
import { adminEmail, roleForEmail } from "@/lib/access-code";
import {
  createClientWorkspace,
  ensureLegacyClientsMigrated,
} from "@/lib/organizations-store";
import { prisma } from "@/lib/prisma";
import type { Account, Role } from "@/lib/types";
import type { User } from "@/lib/generated/prisma/client";

const legacyUsersPath = path.join(process.cwd(), "data", "users.json");

type LegacyStoredUser = {
  id?: string;
  name?: string;
  email?: string;
  planActive?: boolean;
};

function toAccount(user: User): Account {
  const role = roleForEmail(user.email);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    planActive: role === "admin" ? true : user.planActive,
  };
}

async function ensureAdminUser() {
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Administrador",
      role: "admin",
      planActive: true,
    },
    update: {
      name: "Administrador",
      role: "admin",
      planActive: true,
    },
  });
}

async function importLegacyUsersIfEmpty() {
  const count = await prisma.user.count();
  if (count > 0) return;

  let rows: LegacyStoredUser[] = [];
  try {
    const raw = await readFile(legacyUsersPath, "utf8");
    const parsed = JSON.parse(raw) as LegacyStoredUser[];
    rows = Array.isArray(parsed) ? parsed : [];
  } catch {
    return;
  }

  for (const row of rows) {
    const email = String(row.email ?? "").trim().toLowerCase();
    if (!email.includes("@")) continue;
    const resolvedEmail = email === "admin@analytics.local" ? adminEmail : email;
    const role = roleForEmail(resolvedEmail);
    await prisma.user.upsert({
      where: { email: resolvedEmail },
      create: {
        id: row.id,
        email: resolvedEmail,
        name: String(row.name ?? "").trim() || resolvedEmail,
        role,
        planActive: role === "admin" ? true : row.planActive === true,
      },
      update: {},
    });
  }
}

async function ensureUsers() {
  await importLegacyUsersIfEmpty();
  await ensureAdminUser();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return users.map(toAccount);
}

export async function ensureAdminFromEnv() {
  await ensureAdminUser();
}

export async function listAccounts() {
  return ensureUsers();
}

export async function listClients() {
  await ensureLegacyClientsMigrated();
  const users = await ensureUsers();
  return users.filter((user) => user.role === "client");
}

export async function ensureUserForEmail(input: { name: string; email: string }) {
  const email = input.email.trim().toLowerCase();
  const role: Role = roleForEmail(email);
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: input.name.trim() || email,
      role,
      planActive: role === "admin",
    },
    update: {
      name: input.name.trim() || email,
    },
  });
  return toAccount(user);
}

export async function findAccountByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  return user ? toAccount(user) : null;
}

export async function findAccountById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toAccount(user) : null;
}

export async function createClient(input: { name: string; email: string }) {
  const result = await createClientWorkspace(input);
  if ("error" in result) return result;

  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Não foi possível criar o acesso." } as const;
  }
  return { account: toAccount(user), companyId: result.companyId } as const;
}

export async function deleteAccount(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.email === adminEmail) return;
  await prisma.user.delete({ where: { id } });
}

export async function setClientPlanActive(id: string, planActive: boolean) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || roleForEmail(user.email) !== "client") {
    return { error: "Cliente não encontrado." } as const;
  }
  const updated = await prisma.user.update({
    where: { id },
    data: { planActive },
  });
  return { account: toAccount(updated) } as const;
}
