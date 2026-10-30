import { prisma } from "@/lib/prisma";
import {
  defaultLeadFormDraft,
  isLeadFieldType,
  isLeadFormKind,
  isLeadFormThemeMode,
  type LeadFormDraft,
  type LeadFormFieldDef,
  type LeadFormRecord,
} from "@/lib/lead-form-types";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  isAllowedBrandAssetUrl,
  normalizeHexColor,
} from "@/lib/lead-form-theme";

function normalizeFields(raw: unknown): LeadFormFieldDef[] {
  if (!Array.isArray(raw)) return [];
  const fields: LeadFormFieldDef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = String(row.id ?? "").trim();
    const label = String(row.label ?? "").trim();
    const type = String(row.type ?? "text");
    if (!id || !label || !isLeadFieldType(type)) continue;
    const options = Array.isArray(row.options)
      ? row.options.map((opt) => String(opt).trim()).filter(Boolean)
      : undefined;
    fields.push({
      id,
      label,
      type,
      required: row.required === true,
      placeholder:
        typeof row.placeholder === "string" ? row.placeholder : undefined,
      options: type === "select" ? options ?? [] : undefined,
    });
  }
  return fields;
}

function toRecord(row: {
  id: string;
  organizationId: string;
  companyId: string | null;
  name: string;
  kind: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  whatsappNumber: string;
  whatsappMessage: string;
  fields: unknown;
  sendConfirmationEmail: boolean;
  confirmationEmailSubject: string;
  confirmationEmailBody: string;
  active: boolean;
  brandLogoUrl: string;
  brandAccentColor: string;
  brandHeaderImageUrl: string;
  brandTheme: string;
  createdAt: Date;
  updatedAt: Date;
  company: { name: string } | null;
}): LeadFormRecord {
  const kind = isLeadFormKind(row.kind) ? row.kind : "popup";
  return {
    id: row.id,
    organizationId: row.organizationId,
    companyId: row.companyId,
    name: row.name,
    kind,
    title: row.title,
    subtitle: row.subtitle,
    ctaLabel: row.ctaLabel,
    whatsappNumber: row.whatsappNumber,
    whatsappMessage: row.whatsappMessage,
    fields: normalizeFields(row.fields),
    sendConfirmationEmail: row.sendConfirmationEmail,
    confirmationEmailSubject: row.confirmationEmailSubject,
    confirmationEmailBody: row.confirmationEmailBody,
    active: row.active,
    brandLogoUrl: row.brandLogoUrl,
    brandAccentColor: row.brandAccentColor,
    brandHeaderImageUrl: row.brandHeaderImageUrl,
    brandTheme: isLeadFormThemeMode(row.brandTheme) ? row.brandTheme : "dark",
    companyName: row.company?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listLeadFormsForOrganization(
  organizationId: string,
): Promise<LeadFormRecord[]> {
  const rows = await prisma.leadForm.findMany({
    where: { organizationId },
    include: { company: { select: { name: true } } },
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map(toRecord);
}

export async function findLeadFormById(id: string) {
  const row = await prisma.leadForm.findUnique({
    where: { id },
    include: { company: { select: { name: true } } },
  });
  return row ? toRecord(row) : null;
}

function validateDraft(input: LeadFormDraft) {
  const name = input.name.trim();
  if (name.length < 2) {
    return { error: "Informe um nome para o formulário." } as const;
  }
  if (!isLeadFormKind(input.kind)) {
    return { error: "Tipo de formulário inválido." } as const;
  }
  if (input.fields.length === 0) {
    return { error: "Adicione ao menos um campo." } as const;
  }
  for (const field of input.fields) {
    if (!field.label.trim()) {
      return { error: "Todo campo precisa de um rótulo." } as const;
    }
    if (!isLeadFieldType(field.type)) {
      return { error: `Tipo de campo inválido: ${field.type}` } as const;
    }
    if (field.type === "select" && (!field.options || field.options.length === 0)) {
      return {
        error: `O campo "${field.label}" (seleção) precisa de opções.`,
      } as const;
    }
  }
  if (input.kind === "whatsapp_button" && !input.whatsappNumber.trim()) {
    return {
      error: "Informe o número do WhatsApp para este tipo de formulário.",
    } as const;
  }
  if (!isLeadFormThemeMode(input.brandTheme)) {
    return { error: "Tema visual inválido." } as const;
  }
  if (input.brandLogoUrl.trim() && !isAllowedBrandAssetUrl(input.brandLogoUrl)) {
    return { error: "URL do logo inválida. Use http ou https." } as const;
  }
  if (
    input.brandHeaderImageUrl.trim() &&
    !isAllowedBrandAssetUrl(input.brandHeaderImageUrl)
  ) {
    return {
      error: "URL da imagem de capa inválida. Use http ou https.",
    } as const;
  }
  const accent = normalizeHexColor(input.brandAccentColor);
  if (input.brandAccentColor.trim() && !accent) {
    return {
      error: "Cor de destaque inválida. Use um hex como #3b82f6.",
    } as const;
  }
  if (input.sendConfirmationEmail) {
    if (!input.confirmationEmailSubject.trim()) {
      return { error: "Informe o assunto do e-mail de confirmação." } as const;
    }
    if (!input.confirmationEmailBody.trim()) {
      return { error: "Informe o texto do e-mail de confirmação." } as const;
    }
    const hasEmailField = input.fields.some((field) => field.type === "email");
    if (!hasEmailField) {
      return {
        error:
          "Para enviar confirmação por e-mail, inclua um campo do tipo E-mail.",
      } as const;
    }
  }
  return null;
}

export async function saveLeadForm(input: LeadFormDraft) {
  const validationError = validateDraft(input);
  if (validationError) return validationError;

  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    include: { companies: { select: { id: true } } },
  });
  if (!org) return { error: "Organização não encontrada." } as const;

  let companyId: string | null = input.companyId?.trim() || null;
  if (companyId) {
    const belongs = org.companies.some((company) => company.id === companyId);
    if (!belongs) {
      return { error: "Empresa não pertence a esta organização." } as const;
    }
  }

  const fields = normalizeFields(input.fields) as Prisma.InputJsonValue;
  const accentColor = normalizeHexColor(input.brandAccentColor);
  const data = {
    organizationId: org.id,
    companyId,
    name: input.name.trim(),
    kind: input.kind,
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    ctaLabel: input.ctaLabel.trim() || "Enviar",
    whatsappNumber: input.whatsappNumber.trim(),
    whatsappMessage: input.whatsappMessage.trim(),
    fields,
    sendConfirmationEmail: input.sendConfirmationEmail,
    confirmationEmailSubject: input.confirmationEmailSubject.trim(),
    confirmationEmailBody: input.confirmationEmailBody.trim(),
    active: input.active !== false,
    brandLogoUrl: input.brandLogoUrl.trim(),
    brandAccentColor: accentColor ?? "",
    brandHeaderImageUrl: input.brandHeaderImageUrl.trim(),
    brandTheme: input.brandTheme,
  };

  if (input.id) {
    const existing = await prisma.leadForm.findUnique({
      where: { id: input.id },
    });
    if (!existing || existing.organizationId !== org.id) {
      return { error: "Formulário não encontrado." } as const;
    }
    const updated = await prisma.leadForm.update({
      where: { id: input.id },
      data,
      include: { company: { select: { name: true } } },
    });
    return { form: toRecord(updated) } as const;
  }

  const created = await prisma.leadForm.create({
    data,
    include: { company: { select: { name: true } } },
  });
  return { form: toRecord(created) } as const;
}

export async function deleteLeadForm(id: string, organizationId: string) {
  const existing = await prisma.leadForm.findUnique({ where: { id } });
  if (!existing || existing.organizationId !== organizationId) {
    return { error: "Formulário não encontrado." } as const;
  }
  await prisma.leadForm.delete({ where: { id } });
  return { ok: true } as const;
}

export function blankLeadForm(
  organizationId: string,
  companyId: string | null = null,
) {
  return defaultLeadFormDraft(organizationId, companyId);
}
