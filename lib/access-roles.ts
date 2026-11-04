/**
 * Três papéis distintos no produto (código alinhado à UI):
 *
 * 1. `AccountRole.systemAdmin` — admin do sistema (conta plataforma)
 * 2. `OrgMemberRole.proprietario` — gestão de org/empresa (grant ou vínculo)
 * 3. `OrgMemberRole.analista` — operação restrita por empresa
 */

/** Papel da conta de login (`users.role`). */
export const AccountRole = {
  systemAdmin: "system_admin",
  client: "client",
} as const;

export type AccountRole = (typeof AccountRole)[keyof typeof AccountRole];

/** Papel por empresa (`access_grant_companies.role`). */
export const OrgMemberRole = {
  proprietario: "proprietario",
  analista: "analista",
} as const;

export type OrgMemberRole = (typeof OrgMemberRole)[keyof typeof OrgMemberRole];

/** @deprecated Use `AccountRole`. */
export type Role = AccountRole;

/** @deprecated Use `OrgMemberRole`. */
export type CompanyAccessRole = OrgMemberRole;

export const PLATFORM_SYSTEM_ADMIN_LABEL = "Admin do sistema";
export const ORG_PROPRIETARIO_LABEL = "Proprietário";
export const ORG_OWNER_SCOPE_LABEL = "Proprietário da organização";

export const ORG_MEMBER_ROLE_LABELS: Record<OrgMemberRole, string> = {
  proprietario: ORG_PROPRIETARIO_LABEL,
  analista: "Analista",
};

/** @deprecated Use `ORG_MEMBER_ROLE_LABELS`. */
export const COMPANY_ACCESS_ROLE_LABELS = ORG_MEMBER_ROLE_LABELS;

const LEGACY_ACCOUNT_ADMIN = "admin";
const LEGACY_ORG_PROPRIETARIO = "administrator";

export function isSystemAdminAccount(
  role: AccountRole | string | null | undefined,
): boolean {
  return role === AccountRole.systemAdmin || role === LEGACY_ACCOUNT_ADMIN;
}

export function isOrgProprietarioMemberRole(
  role: OrgMemberRole | string | null | undefined,
): boolean {
  return (
    role === OrgMemberRole.proprietario || role === LEGACY_ORG_PROPRIETARIO
  );
}

export function parseOrgMemberRole(
  value: FormDataEntryValue | null | undefined,
): OrgMemberRole {
  const raw = String(value ?? "");
  if (isOrgProprietarioMemberRole(raw)) {
    return OrgMemberRole.proprietario;
  }
  return OrgMemberRole.analista;
}

/** @deprecated Use `parseOrgMemberRole`. */
export const parseCompanyAccessRole = parseOrgMemberRole;

export function isProprietarioAtCompany(
  grant: {
    isOrgProprietario: boolean;
    allCompanies: boolean;
    companyRoles: Record<string, OrgMemberRole | string>;
  },
  companyId: string,
): boolean {
  if (grant.isOrgProprietario) return true;
  if (grant.allCompanies) return false;
  return isOrgProprietarioMemberRole(grant.companyRoles[companyId]);
}

/** @deprecated Use `isProprietarioAtCompany`. */
export const isAdministratorAtCompany = isProprietarioAtCompany;

/** Proprietário da org ou gestor (proprietario) em ao menos uma empresa. */
export function hasProprietarioAccess(grant: {
  isOrgProprietario: boolean;
  companyRoles: Record<string, OrgMemberRole | string>;
}): boolean {
  if (grant.isOrgProprietario) return true;
  return Object.values(grant.companyRoles).some((role) =>
    isOrgProprietarioMemberRole(role),
  );
}

/** @deprecated Use `hasProprietarioAccess`. */
export const hasElevatedCompanyAccess = hasProprietarioAccess;

export function sessionRoleLabel(input: {
  role: AccountRole | string;
  isProprietario: boolean;
}): string {
  if (isSystemAdminAccount(input.role)) {
    return PLATFORM_SYSTEM_ADMIN_LABEL;
  }
  if (input.isProprietario) {
    return ORG_PROPRIETARIO_LABEL;
  }
  return ORG_MEMBER_ROLE_LABELS.analista;
}

export function grantScopeSummary(grant: {
  isOrgProprietario: boolean;
  allCompanies: boolean;
  companyIds: string[];
  companyRoles: Record<string, OrgMemberRole | string>;
}): string {
  const elevated = hasProprietarioAccess(grant);

  if (grant.isOrgProprietario) {
    return `${ORG_PROPRIETARIO_LABEL} · toda a organização`;
  }
  if (elevated) {
    return `${ORG_PROPRIETARIO_LABEL} · por empresa`;
  }
  if (grant.allCompanies) {
    return `Analista · toda a organização`;
  }
  return `Analista · ${grant.companyIds.length} empresa(s)`;
}
