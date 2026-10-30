import { readFile } from "node:fs/promises";
import path from "node:path";
import { adminEmail, roleForEmail } from "@/lib/access-code";
import {
  createClientWorkspace,
  ensureLegacyClientsMigrated,
} from "@/lib/organizations-store";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { Account, Role } from "@/lib/types";
import type { User } from "@/lib/generated/prisma/client";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validatePassword(password: string) {
  if (password.length < 8) {
    return "A senha precisa ter pelo menos 8 caracteres.";
  }
  return null;
}

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

export async function createClient(input: {
  name: string;
  email: string;
  password?: string;
}): Promise<
  { account: Account; companyId: string } | { error: string }
> {
  const workspace = await createClientWorkspace({
    name: input.name,
    email: input.email,
  });
  if (!workspace.companyId) {
    return {
      error: workspace.error ?? "Não foi possível criar o acesso.",
    };
  }

  const email = normalizeEmail(input.email);
  if (input.password) {
    const passwordHash = await hashPassword(input.password);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Não foi possível criar o acesso." };
  }
  return { account: toAccount(user), companyId: workspace.companyId };
}

export async function registerWithPassword(input: {
  name: string;
  email: string;
  password: string;
}) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  if (!name) return { error: "Informe seu nome." } as const;
  if (!email || !email.includes("@")) {
    return { error: "Informe um e-mail válido." } as const;
  }
  const passwordError = validatePassword(input.password);
  if (passwordError) return { error: passwordError } as const;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.passwordHash) {
      return {
        error: "Já existe uma conta com esse e-mail. Entre com e-mail e senha.",
      } as const;
    }
    return {
      error:
        "Já existe uma conta com esse e-mail. Entre com e-mail para criar sua senha ou use o Google.",
    } as const;
  }

  return createClient({
    name,
    email,
    password: input.password,
  });
}

export async function checkEmailForPasswordLogin(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) {
    return { error: "Informe um e-mail válido." } as const;
  }

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) {
    return {
      error:
        "Não encontramos conta com esse e-mail. Crie uma conta ou entre com o Google.",
    } as const;
  }
  return {
    email: normalized,
    needsPasswordSetup: !user.passwordHash,
  } as const;
}

export async function setupPasswordAndLogin(input: {
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const email = normalizeEmail(input.email);
  if (!email || !input.password) {
    return { error: "Informe e-mail e senha." } as const;
  }
  if (input.password !== input.confirmPassword) {
    return { error: "As senhas não coincidem." } as const;
  }
  const passwordError = validatePassword(input.password);
  if (passwordError) return { error: passwordError } as const;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Conta não encontrada." } as const;
  }
  if (user.passwordHash) {
    return authenticateWithPassword({ email, password: input.password });
  }

  const passwordHash = await hashPassword(input.password);
  const updated = await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });
  return { account: toAccount(updated) } as const;
}

export async function authenticateWithPassword(input: {
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  if (!email || !input.password) {
    return { error: "Informe e-mail e senha." } as const;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "E-mail ou senha incorretos." } as const;
  }
  if (!user.passwordHash) {
    return {
      error: "Esta conta entra com Google. Use o botão Continuar com Google.",
    } as const;
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    return { error: "E-mail ou senha incorretos." } as const;
  }

  return { account: toAccount(user) } as const;
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
