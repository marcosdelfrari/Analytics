"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { deleteReport, deleteReportsForClient, saveReport } from "@/lib/reports-store";
import type { PublishedReport } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import {
  createClientWorkspace,
  createOrganization,
  deleteAccessGrant,
  deleteCompany,
  deleteOrganization,
  findCompanyById,
  setCompanyPlanActive,
} from "@/lib/organizations-store";
import { deleteAccount } from "@/lib/users-store";

const allowedExtensions = new Set([
  ".pdf",
  ".csv",
  ".xlsx",
  ".xls",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
]);

export type FormState = { error: string } | null;

async function requireAdmin() {
  if (!authEnabled) return;
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
}

function parseNumber(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? "")
    .trim()
    .replace(/\s/g, "");
  if (!text) return null;
  const normalized =
    text.includes(",") && text.includes(".")
      ? text.replace(/\./g, "").replace(",", ".")
      : text.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

export async function createClientAccount(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (name.length < 2) return { error: "Informe o nome do cliente." };
  if (!email.includes("@")) return { error: "Informe um e-mail válido." };

  const result = await createClientWorkspace({ name, email });
  if ("error" in result) {
    return { error: result.error ?? "Não foi possível criar o cliente." };
  }

  revalidatePath("/admin");
  redirect(`/admin?empresa=${result.companyId}`);
}

export async function createOrganizationAccount(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const result = await createOrganization(name);
  if ("error" in result) {
    return { error: result.error ?? "Não foi possível criar a organização." };
  }
  revalidatePath("/admin");
  redirect(`/admin?org=${result.organizationId}`);
}

export async function removePlatformUser(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteAccount(id);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function removeAccessGrant(formData: FormData) {
  await requireAdmin();
  const grantId = String(formData.get("grantId") ?? "");
  const org = String(formData.get("org") ?? "");
  if (!grantId) return;
  await deleteAccessGrant(grantId);
  revalidatePath("/admin");
  redirect(org ? `/admin?org=${org}` : "/admin");
}

export async function removeClient(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const org = String(formData.get("org") ?? "");
  const company = await findCompanyById(id);
  if (!company) return;
  await deleteReportsForClient(id);

  const siblings = await prisma.company.count({
    where: { organizationId: company.organizationId },
  });
  if (siblings <= 1) {
    await deleteOrganization(company.organizationId);
  } else {
    await deleteCompany(id);
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect(org ? `/admin?org=${org}` : "/admin");
}

export async function publishReport(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const clientId = String(formData.get("clientId") ?? "");
  const company = await findCompanyById(clientId);
  if (!company) {
    return { error: "Selecione uma empresa." };
  }

  const platform = String(formData.get("platform") ?? "");
  const period = String(formData.get("period") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const spend = parseNumber(formData.get("spend"));
  const impressions = parseNumber(formData.get("impressions"));
  const clicks = parseNumber(formData.get("clicks"));
  const conversions = parseNumber(formData.get("conversions"));
  const spendChange = parseNumber(formData.get("spendChange"));
  const activeCampaigns = parseNumber(formData.get("activeCampaigns"));
  const totalCampaigns = parseNumber(formData.get("totalCampaigns"));
  const file = formData.get("file");

  if (platform !== "google" && platform !== "meta") {
    return { error: "Escolha Google Ads ou Meta Ads." };
  }
  if (period.length < 3) {
    return { error: "Informe o período, por exemplo Março 2026." };
  }
  if (
    spend === null ||
    impressions === null ||
    clicks === null ||
    conversions === null
  ) {
    return {
      error: "Preencha investimento, impressões, cliques e conversões.",
    };
  }
  if (clicks > impressions) {
    return { error: "Cliques não podem ser maiores que impressões." };
  }

  let fileName: string | null = null;
  let storedFile: string | null = null;
  let buffer: Buffer | undefined;

  if (file instanceof File && file.size > 0) {
    if (file.size > 8 * 1024 * 1024) {
      return { error: "O arquivo precisa ter no máximo 8 MB." };
    }
    const extension = extensionOf(file.name);
    if (!allowedExtensions.has(extension)) {
      return { error: "Envie PDF, CSV, planilha ou imagem." };
    }
    fileName = file.name;
    storedFile = `${randomUUID()}${extension}`;
    buffer = Buffer.from(await file.arrayBuffer());
  }

  const report: PublishedReport = {
    id: randomUUID(),
    clientId,
    platform,
    period,
    spend,
    spendChange,
    impressions,
    clicks,
    conversions,
    activeCampaigns,
    totalCampaigns,
    notes,
    fileName,
    storedFile,
    publishedAt: new Date().toISOString(),
  };

  await saveReport(
    report,
    buffer && storedFile ? { buffer, storedFile } : undefined,
  );

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  const org = String(formData.get("org") ?? company.organizationId);
  redirect(`/admin?org=${org}&empresa=${clientId}`);
}

export async function setClientPlan(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const org = String(formData.get("org") ?? "");
  const active = String(formData.get("planActive") ?? "") === "true";
  if (!id) return;
  await setCompanyPlanActive(id, active);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  redirect(
    org ? `/admin?org=${org}&empresa=${id}` : `/admin?empresa=${id}`,
  );
}

export async function removeReport(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  if (!id) return;
  await deleteReport(id);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  const org = String(formData.get("org") ?? "");
  redirect(
    clientId
      ? org
        ? `/admin?org=${org}&empresa=${clientId}`
        : `/admin?empresa=${clientId}`
      : "/admin",
  );
}
