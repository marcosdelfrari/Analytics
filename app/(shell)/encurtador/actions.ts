"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveCompanyIdForSession, getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { hasActivePlan } from "@/lib/plan";
import {
  deleteLink,
  findLink,
  listLinksForCompanies,
  saveLink,
} from "@/lib/links-store";
import { listAccessibleCompanies } from "@/lib/organizations-store";

export type ShortenState = { error: string } | { url: string } | null;

const codePattern = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

async function requireAccess() {
  if (!authEnabled) return { companyId: null as string | null, isAdmin: true };
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasActivePlan(session)) redirect("/dashboard");
  if (session.role === "client" && !session.isOrganizationOwner) {
    redirect("/dashboard");
  }

  if (session.role === "admin") {
    const companyId = await getActiveCompanyIdForSession(session);
    return { companyId: companyId ?? null, isAdmin: true };
  }

  const companyId = await getActiveCompanyIdForSession(session);
  if (!companyId) redirect("/login?erro=sem-acesso");
  return { companyId, isAdmin: false };
}

function randomCode() {
  return randomBytes(4).toString("hex").slice(0, 6);
}

function parseDestination(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function createShortLink(
  _previous: ShortenState,
  formData: FormData,
): Promise<ShortenState> {
  const { companyId, isAdmin } = await requireAccess();
  if (!isAdmin && !companyId) {
    return { error: "Selecione uma empresa antes de criar links." };
  }
  const destination = parseDestination(String(formData.get("url") ?? "").trim());
  const label = String(formData.get("label") ?? "").trim();
  const requested = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase();

  if (!destination) {
    return { error: "Informe um endereço http ou https." };
  }

  let code = requested;
  if (code) {
    if (!codePattern.test(code) || code.length < 3) {
      return { error: "O atalho precisa ter de 3 a 32 letras, números ou hífen." };
    }
    if (await findLink(code)) {
      return { error: "Esse atalho já está em uso." };
    }
  } else {
    code = randomCode();
    while (await findLink(code)) code = randomCode();
  }

  await saveLink({
    code,
    url: destination,
    label,
    clicks: 0,
    companyId,
  });
  revalidatePath("/encurtador");
  return { url: code };
}

export async function removeShortLink(formData: FormData) {
  const { companyId, isAdmin } = await requireAccess();
  const code = String(formData.get("code") ?? "");
  if (!code) return;

  const link = await findLink(code);
  if (!link) return;

  if (!isAdmin && link.companyId !== null && link.companyId !== companyId) {
    return;
  }
  if (!isAdmin && link.companyId === null) {
    return;
  }

  await deleteLink(code, companyId);
  revalidatePath("/encurtador");
}

export async function listShortLinksForSession() {
  const access = await requireAccess();
  if (access.isAdmin && !access.companyId) {
    const { listLinks } = await import("@/lib/links-store");
    return listLinks();
  }
  if (access.companyId) {
    return listLinksForCompanies([access.companyId]);
  }
  const session = await getSession();
  if (!session) return [];
  const companies = await listAccessibleCompanies(session.email);
  return listLinksForCompanies(companies.map((company) => company.id));
}
