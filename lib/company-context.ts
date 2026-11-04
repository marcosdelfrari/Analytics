import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { CompanyAccount } from "@/lib/organizations-store";
import { listAccessibleCompanies } from "@/lib/organizations-store";
import { isSystemAdminAccount } from "@/lib/access-roles";
import type { Session } from "@/lib/types";

export const companyCookie = "analytics_company";

export function companyCookieOptions(origin?: string) {
  const secure = origin
    ? origin.startsWith("https://")
    : process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure,
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function resolveClientCompanyContext(session: Session) {
  const accessible = await listAccessibleCompanies(session.email);
  if (accessible.length === 0) {
    if (isSystemAdminAccount(session.role)) {
      return {
        clientId: undefined,
        title: "Conta",
        planActive: true,
        accessibleCompanies: [] as CompanyAccount[],
        activeCompanyId: undefined,
        organizationName: undefined,
      };
    }
    redirect("/login?erro=sem-acesso");
  }

  const jar = await cookies();
  const preferred = jar.get(companyCookie)?.value;
  const company =
    accessible.find((item) => item.id === preferred) ?? accessible[0];

  const planActive =
    isSystemAdminAccount(session.role) ? true : company.planActive;

  return {
    clientId: company.id,
    title: company.name,
    planActive,
    accessibleCompanies: accessible,
    activeCompanyId: company.id,
    organizationName: company.organizationName,
  };
}

export type ClientCompanyContext = {
  clientId: string | undefined;
  title: string;
  planActive: boolean;
  accessibleCompanies: CompanyAccount[];
  activeCompanyId: string | undefined;
  organizationName: string | undefined;
};
