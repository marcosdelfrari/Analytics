import type { LeadFormRecord } from "@/lib/lead-form-types";
import { listLeadFormsForOrganization } from "@/lib/lead-forms-store";
import {
  listAccessibleCompanies,
  listOrganizationsForOwner,
} from "@/lib/organizations-store";

export type LeadFormsCompanyOption = { id: string; name: string };

export type LeadFormsWorkspace = {
  organizations: { id: string; name: string }[];
  activeOrganizationId: string | null;
  companies: LeadFormsCompanyOption[];
  forms: LeadFormRecord[];
};

const emptyWorkspace: LeadFormsWorkspace = {
  organizations: [],
  activeOrganizationId: null,
  companies: [],
  forms: [],
};

export async function loadLeadFormsWorkspace(input: {
  email: string;
  canRegister: boolean;
  orgId?: string;
}): Promise<LeadFormsWorkspace> {
  if (input.canRegister) {
    const organizations = await listOrganizationsForOwner(input.email);
    const active =
      organizations.find((item) => item.id === input.orgId) ??
      organizations[0] ??
      null;
    if (!active) return emptyWorkspace;

    const forms = await listLeadFormsForOrganization(active.id);
    return {
      organizations: organizations.map((item) => ({
        id: item.id,
        name: item.name,
      })),
      activeOrganizationId: active.id,
      companies: active.companies.map((company) => ({
        id: company.id,
        name: company.name,
      })),
      forms,
    };
  }

  const accessible = await listAccessibleCompanies(input.email);
  const byOrg = new Map<
    string,
    { id: string; name: string; companies: LeadFormsCompanyOption[] }
  >();
  for (const company of accessible) {
    const current = byOrg.get(company.organizationId) ?? {
      id: company.organizationId,
      name: company.organizationName,
      companies: [],
    };
    current.companies.push({ id: company.id, name: company.name });
    byOrg.set(company.organizationId, current);
  }

  const organizations = [...byOrg.values()];
  const active =
    organizations.find((item) => item.id === input.orgId) ??
    organizations[0] ??
    null;
  if (!active) return emptyWorkspace;

  const allowedIds = new Set(active.companies.map((company) => company.id));
  const forms = (await listLeadFormsForOrganization(active.id)).filter(
    (form) => !form.companyId || allowedIds.has(form.companyId),
  );

  return {
    organizations: organizations.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    activeOrganizationId: active.id,
    companies: active.companies,
    forms,
  };
}
