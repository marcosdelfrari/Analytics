"use server";
import { isSystemAdminAccount } from "@/lib/access-roles";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import {
  isLeadFieldType,
  isLeadFormKind,
  isLeadFormThemeMode,
  type LeadFormDraft,
  type LeadFormFieldDef,
} from "@/lib/lead-form-types";
import {
  deleteLeadForm,
  findLeadFormById,
  saveLeadForm,
} from "@/lib/lead-forms-store";
import {
  canAccessCompany,
  canAccessOrganizationForLeadForms,
} from "@/lib/organizations-store";

export type LeadFormActionState =
  | { ok: true; formId: string }
  | { error: string }
  | null;

async function requireLeadFormsAccess(organizationId: string) {
  if (!authEnabled) return null;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (isSystemAdminAccount(session.role)) {
    return session;
  }
  const canAccess = await canAccessOrganizationForLeadForms(
    session.email,
    organizationId,
  );
  if (!canAccess) {
    redirect("/dashboard");
  }
  return session;
}

async function assertLeadFormCompanyAccess(
  session: NonNullable<Awaited<ReturnType<typeof getSession>>> | null,
  organizationId: string,
  companyId: string | null,
  formId?: string,
) {
  if (!session || isSystemAdminAccount(session.role) || session.isProprietario) {
    return null;
  }
  if (formId) {
    const existing = await findLeadFormById(formId);
    if (
      existing &&
      existing.organizationId === organizationId &&
      existing.companyId &&
      !(await canAccessCompany(session.email, existing.companyId))
    ) {
      return { error: "Sem permissão para editar este formulário." } as const;
    }
  }
  if (companyId && !(await canAccessCompany(session.email, companyId))) {
    return { error: "Sem permissão para vincular esta empresa." } as const;
  }
  return null;
}

function parseFields(raw: unknown): LeadFormFieldDef[] {
  if (!Array.isArray(raw)) return [];
  const fields: LeadFormFieldDef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const type = String(row.type ?? "text");
    if (!isLeadFieldType(type)) continue;
    fields.push({
      id: String(row.id ?? "").trim() || crypto.randomUUID(),
      label: String(row.label ?? "").trim(),
      type,
      required: row.required === true,
      placeholder:
        typeof row.placeholder === "string" ? row.placeholder : undefined,
      options: Array.isArray(row.options)
        ? row.options.map((opt) => String(opt)).filter(Boolean)
        : undefined,
    });
  }
  return fields;
}

function parseDraft(payload: string): LeadFormDraft | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return { error: "Payload inválido." };
  }
  if (!parsed || typeof parsed !== "object") {
    return { error: "Payload inválido." };
  }
  const row = parsed as Record<string, unknown>;
  const kind = String(row.kind ?? "");
  if (!isLeadFormKind(kind)) {
    return { error: "Tipo de formulário inválido." };
  }
  const organizationId = String(row.organizationId ?? "").trim();
  if (!organizationId) {
    return { error: "Organização obrigatória." };
  }
  const companyRaw = row.companyId;
  const companyId =
    companyRaw === null || companyRaw === undefined || companyRaw === ""
      ? null
      : String(companyRaw);

  return {
    id: typeof row.id === "string" && row.id ? row.id : undefined,
    organizationId,
    companyId,
    name: String(row.name ?? ""),
    kind,
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    ctaLabel: String(row.ctaLabel ?? "Enviar"),
    whatsappNumber: String(row.whatsappNumber ?? ""),
    whatsappMessage: String(row.whatsappMessage ?? ""),
    fields: parseFields(row.fields),
    sendConfirmationEmail: row.sendConfirmationEmail === true,
    confirmationEmailSubject: String(row.confirmationEmailSubject ?? ""),
    confirmationEmailBody: String(row.confirmationEmailBody ?? ""),
    active: row.active !== false,
    brandLogoUrl: String(row.brandLogoUrl ?? ""),
    brandAccentColor: String(row.brandAccentColor ?? ""),
    brandHeaderImageUrl: String(row.brandHeaderImageUrl ?? ""),
    brandTheme: (() => {
      const theme = String(row.brandTheme ?? "dark");
      return isLeadFormThemeMode(theme) ? theme : "dark";
    })(),
  };
}

export async function upsertLeadFormAction(
  _previous: LeadFormActionState,
  formData: FormData,
): Promise<LeadFormActionState> {
  const payload = String(formData.get("payload") ?? "");
  const draft = parseDraft(payload);
  if ("error" in draft) return { error: draft.error };

  const session = await requireLeadFormsAccess(draft.organizationId);
  const companyError = await assertLeadFormCompanyAccess(
    session,
    draft.organizationId,
    draft.companyId,
    draft.id,
  );
  if (companyError) return companyError;

  const result = await saveLeadForm(draft);
  if ("error" in result) {
    return { error: result.error ?? "Não foi possível salvar." };
  }

  revalidatePath("/organizacao/formularios");
  revalidatePath("/organizacao/formularios/instalar");
  return { ok: true, formId: result.form.id };
}

export async function removeLeadFormAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const organizationId = String(formData.get("organizationId") ?? "");
  if (!id || !organizationId) return;
  const session = await requireLeadFormsAccess(organizationId);
  const companyError = await assertLeadFormCompanyAccess(
    session,
    organizationId,
    null,
    id,
  );
  if (companyError) return;

  await deleteLeadForm(id, organizationId);
  revalidatePath("/organizacao/formularios");
  revalidatePath("/organizacao/formularios/instalar");
  redirect(`/organizacao/formularios?org=${organizationId}`);
}
