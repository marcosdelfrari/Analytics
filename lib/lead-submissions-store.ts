import { prisma } from "@/lib/prisma";
import type { LeadFormFieldDef } from "@/lib/lead-form-types";
import { isLeadFieldType } from "@/lib/lead-form-types";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 2000;

function companyWhere(options: ListLeadSubmissionsOptions) {
  if (options.companyId) return { companyId: options.companyId };
  if (options.companyIds) {
    if (options.companyIds.length === 0) return { companyId: { in: [] as string[] } };
    return { companyId: { in: options.companyIds } };
  }
  return {};
}

function normalizeFieldDefs(raw: unknown): LeadFormFieldDef[] {
  if (!Array.isArray(raw)) return [];
  const fields: LeadFormFieldDef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = String(row.id ?? "").trim();
    const label = String(row.label ?? "").trim();
    const type = String(row.type ?? "text");
    if (!id || !label || !isLeadFieldType(type)) continue;
    fields.push({ id, label, type, required: row.required === true });
  }
  return fields;
}

function readFieldValues(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      out[key] = String(value);
    }
  }
  return out;
}

export type LeadSubmissionLine = {
  fieldId: string;
  label: string;
  value: string;
};

export type LeadSubmissionRecord = {
  id: string;
  organizationId: string;
  companyId: string | null;
  companyName: string | null;
  formId: string;
  formName: string;
  pageUrl: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  createdAt: string;
  lines: LeadSubmissionLine[];
};

export type ListLeadSubmissionsOptions = {
  formId?: string;
  companyId?: string;
  /** Quando informado, restringe aos IDs (analista só vê as empresas liberadas). */
  companyIds?: string[];
  limit?: number;
};

export async function listLeadSubmissionsForOrganization(
  organizationId: string,
  options: ListLeadSubmissionsOptions = {},
): Promise<LeadSubmissionRecord[]> {
  const limit = Math.min(
    Math.max(options.limit ?? DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  const rows = await prisma.leadSubmission.findMany({
    where: {
      organizationId,
      ...(options.formId ? { formId: options.formId } : {}),
      ...companyWhere(options),
    },
    include: {
      form: { select: { name: true, fields: true } },
      company: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((row) => {
    const defs = normalizeFieldDefs(row.form.fields);
    const values = readFieldValues(row.fields);
    const labelById = new Map(defs.map((field) => [field.id, field.label]));
    const orderedIds = defs.map((field) => field.id);
    const extraIds = Object.keys(values).filter(
      (id) => !orderedIds.includes(id),
    );

    const lines: LeadSubmissionLine[] = [];
    for (const id of [...orderedIds, ...extraIds]) {
      const value = values[id];
      if (!value) continue;
      lines.push({
        fieldId: id,
        label: labelById.get(id) ?? id,
        value,
      });
    }

    return {
      id: row.id,
      organizationId: row.organizationId,
      companyId: row.companyId,
      companyName: row.company?.name ?? null,
      formId: row.formId,
      formName: row.form.name,
      pageUrl: row.pageUrl,
      referrer: row.referrer,
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
      createdAt: row.createdAt.toISOString(),
      lines,
    };
  });
}

export async function countLeadSubmissionsForOrganization(
  organizationId: string,
  options: Pick<
    ListLeadSubmissionsOptions,
    "formId" | "companyId" | "companyIds"
  > = {},
): Promise<number> {
  return prisma.leadSubmission.count({
    where: {
      organizationId,
      ...(options.formId ? { formId: options.formId } : {}),
      ...companyWhere(options),
    },
  });
}
