export type CompanyAccessRole = "administrator" | "analyst";

export const COMPANY_ACCESS_ROLE_LABELS: Record<CompanyAccessRole, string> = {
  administrator: "Administrador",
  analyst: "Analista",
};

export function parseCompanyAccessRole(
  value: FormDataEntryValue | null | undefined,
): CompanyAccessRole {
  return String(value ?? "") === "administrator" ? "administrator" : "analyst";
}

export function isAdministratorAtCompany(
  grant: {
    isOwner: boolean;
    allCompanies: boolean;
    companyRoles: Record<string, CompanyAccessRole>;
  },
  companyId: string,
): boolean {
  if (grant.isOwner) return true;
  if (grant.allCompanies) return false;
  return grant.companyRoles[companyId] === "administrator";
}

/** Owner da org ou administrador de ao menos uma empresa. */
export function hasElevatedCompanyAccess(grant: {
  isOwner: boolean;
  companyRoles: Record<string, CompanyAccessRole>;
}): boolean {
  if (grant.isOwner) return true;
  return Object.values(grant.companyRoles).some(
    (role) => role === "administrator",
  );
}
