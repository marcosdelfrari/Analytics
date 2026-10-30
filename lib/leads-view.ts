import { listLeadFormsForOrganization } from "@/lib/lead-forms-store";
import type { LeadFormRecord } from "@/lib/lead-form-types";
import {
  countLeadSubmissionsForOrganization,
  listLeadSubmissionsForOrganization,
  type LeadSubmissionRecord,
} from "@/lib/lead-submissions-store";
import {
  listAccessibleCompanies,
  listOrganizationsForOwner,
} from "@/lib/organizations-store";
import { toCsv } from "@/lib/csv";

export type LeadsCompanyOption = { id: string; name: string };

export type LeadsView = {
  organizations: { id: string; name: string }[];
  activeOrganizationId: string | null;
  companies: LeadsCompanyOption[];
  forms: LeadFormRecord[];
  submissions: LeadSubmissionRecord[];
  totalCount: number;
  selectedFormId: string | null;
  selectedCompanyId: string | null;
};

const emptyView: LeadsView = {
  organizations: [],
  activeOrganizationId: null,
  companies: [],
  forms: [],
  submissions: [],
  totalCount: 0,
  selectedFormId: null,
  selectedCompanyId: null,
};

export async function loadLeadsView(input: {
  email: string;
  canRegister: boolean;
  orgId?: string;
  formId?: string;
  companyId?: string;
  limit?: number;
}): Promise<LeadsView> {
  if (input.canRegister) {
    const organizations = await listOrganizationsForOwner(input.email);
    const active =
      organizations.find((item) => item.id === input.orgId) ??
      organizations[0] ??
      null;
    if (!active) return emptyView;

    const companies = active.companies.map((company) => ({
      id: company.id,
      name: company.name,
    }));
    const forms = await listLeadFormsForOrganization(active.id);
    return loadSlice({
      organizations: organizations.map((item) => ({
        id: item.id,
        name: item.name,
      })),
      active,
      companies,
      forms,
      formId: input.formId,
      companyId: input.companyId,
      limit: input.limit,
    });
  }

  const accessible = await listAccessibleCompanies(input.email);
  const byOrg = new Map<string, { id: string; name: string; companies: LeadsCompanyOption[] }>();
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
  if (!active) return emptyView;

  const allowedIds = new Set(active.companies.map((company) => company.id));
  const forms = (await listLeadFormsForOrganization(active.id)).filter(
    (form) => !form.companyId || allowedIds.has(form.companyId),
  );

  return loadSlice({
    organizations: organizations.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    active,
    companies: active.companies,
    forms,
    formId: input.formId,
    companyId:
      input.companyId && allowedIds.has(input.companyId)
        ? input.companyId
        : undefined,
    companyIds: [...allowedIds],
    limit: input.limit,
  });
}

async function loadSlice(input: {
  organizations: { id: string; name: string }[];
  active: { id: string; name: string };
  companies: LeadsCompanyOption[];
  forms: LeadFormRecord[];
  formId?: string;
  companyId?: string;
  companyIds?: string[];
  limit?: number;
}): Promise<LeadsView> {
  const selectedFormId =
    input.formId && input.forms.some((form) => form.id === input.formId)
      ? input.formId
      : null;
  const selectedCompanyId =
    input.companyId &&
    input.companies.some((company) => company.id === input.companyId)
      ? input.companyId
      : null;

  const filters = {
    formId: selectedFormId ?? undefined,
    companyId: selectedCompanyId ?? undefined,
    companyIds: selectedCompanyId ? undefined : input.companyIds,
    limit: input.limit,
  };

  const [submissions, totalCount] = await Promise.all([
    listLeadSubmissionsForOrganization(input.active.id, filters),
    countLeadSubmissionsForOrganization(input.active.id, filters),
  ]);

  return {
    organizations: input.organizations,
    activeOrganizationId: input.active.id,
    companies: input.companies,
    forms: input.forms,
    submissions,
    totalCount,
    selectedFormId,
    selectedCompanyId,
  };
}

export function leadsToCsv(submissions: LeadSubmissionRecord[]) {
  const headers = [
    "quando",
    "formulário",
    "empresa",
    "página",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "resumo",
  ];
  const rows = submissions.map((submission) => [
    submission.createdAt,
    submission.formName,
    submission.companyName ?? "",
    submission.pageUrl,
    submission.utmSource,
    submission.utmMedium,
    submission.utmCampaign,
    submission.lines.map((line) => `${line.label}: ${line.value}`).join(" | "),
  ]);
  return toCsv(headers, rows);
}
