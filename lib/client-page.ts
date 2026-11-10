import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { resolveClientCompanyContext } from "@/lib/company-context";
import { AccountRole, isSystemAdminAccount } from "@/lib/access-roles";
import { listCompanies } from "@/lib/organizations-store";

export const getClientPageContext = cache(async () => {
  await connection();
  const session = await getSession();
  if (authEnabled && !session) {
    redirect("/login");
  }

  if (
    session &&
    (session.role === AccountRole.client || isSystemAdminAccount(session.role))
  ) {
    const companyContext = await resolveClientCompanyContext(session);
    return {
      session,
      planActive: companyContext.planActive,
      clientId: companyContext.clientId,
      title: companyContext.title,
      accessibleCompanies: companyContext.accessibleCompanies,
      activeCompanyId: companyContext.activeCompanyId,
      organizationName: companyContext.organizationName,
    };
  }

  const companies = await listCompanies();
  const first = companies[0];
  return {
    session,
    planActive: true,
    clientId: first?.id,
    title: first?.name ?? "Conta",
    accessibleCompanies: companies,
    activeCompanyId: first?.id,
    organizationName: first?.organizationName,
  };
});

export function clientSubtitle(planActive: boolean, period: string) {
  return planActive ? period : `${period} · demonstração`;
}
