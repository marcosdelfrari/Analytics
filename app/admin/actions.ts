"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { deleteReport, deleteReportsForClient, saveReport } from "@/lib/reports-store";
import type { PublishedReport } from "@/lib/types";
import { createClient, deleteAccount, findAccountById } from "@/lib/users-store";

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
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Informe o nome do cliente." };
  if (!email.includes("@")) return { error: "Informe um e-mail válido." };
  if (password.length < 6) return { error: "A senha precisa ter pelo menos 6 caracteres." };

  const result = await createClient({ name, email, password });
  if ("error" in result) {
    return { error: result.error ?? "Não foi possível criar o cliente." };
  }

  revalidatePath("/admin");
  redirect(`/admin?cliente=${result.account.id}`);
}

export async function removeClient(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const account = await findAccountById(id);
  if (!account || account.role !== "client") return;
  await deleteReportsForClient(id);
  await deleteAccount(id);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function publishReport(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const clientId = String(formData.get("clientId") ?? "");
  const account = await findAccountById(clientId);
  if (!account || account.role !== "client") {
    return { error: "Selecione um cliente." };
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

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin?cliente=${clientId}`);
}

export async function removeReport(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  if (!id) return;
  await deleteReport(id);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect(clientId ? `/admin?cliente=${clientId}` : "/admin");
}
