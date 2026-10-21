import { cookies } from "next/headers";
import { readSession, sessionCookie } from "@/lib/session";
import { companyCookie, resolveClientCompanyContext } from "@/lib/company-context";
import {
  emailIsOrganizationOwner,
  listAccessibleCompanies,
} from "@/lib/organizations-store";
import { findAccountById } from "@/lib/users-store";
import type { Session } from "@/lib/types";

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const session = await readSession(jar.get(sessionCookie)?.value);
  if (!session) return null;
  const account = await findAccountById(session.userId);
  if (!account) return null;

  let planActive = account.role === "admin" || account.planActive;
  if (account.role === "client") {
    const companyId = jar.get(companyCookie)?.value;
    const companies = await listAccessibleCompanies(account.email);
    const company =
      companies.find((item) => item.id === companyId) ?? companies[0];
    if (company) planActive = company.planActive;
  }

  const isOrganizationOwner = await emailIsOrganizationOwner(account.email);

  return {
    userId: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
    planActive,
    isOrganizationOwner,
  };
}

export async function getActiveCompanyIdForSession(
  session: Session,
): Promise<string | undefined> {
  if (session.role !== "client") return undefined;
  const context = await resolveClientCompanyContext(session);
  return context.clientId;
}
