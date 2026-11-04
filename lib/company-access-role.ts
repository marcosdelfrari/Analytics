/** Reexporta papéis de organização; preferir `@/lib/access-roles`. */
export {
  COMPANY_ACCESS_ROLE_LABELS,
  ORG_MEMBER_ROLE_LABELS,
  hasElevatedCompanyAccess,
  hasProprietarioAccess,
  isAdministratorAtCompany,
  isProprietarioAtCompany,
  parseCompanyAccessRole,
  parseOrgMemberRole,
  type CompanyAccessRole,
  type OrgMemberRole,
} from "@/lib/access-roles";
