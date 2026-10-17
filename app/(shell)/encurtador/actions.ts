"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";
import { hasActivePlan } from "@/lib/plan";
import { deleteLink, findLink, saveLink } from "@/lib/links-store";

export type ShortenState = { error: string } | { url: string } | null;

const codePattern = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

async function requireAccess() {
  if (!authEnabled) return;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasActivePlan(session)) redirect("/dashboard");
}

function randomCode() {
  return randomBytes(4).toString("hex").slice(0, 6);
}

function parseDestination(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function createShortLink(
  _previous: ShortenState,
  formData: FormData,
): Promise<ShortenState> {
  await requireAccess();
  const destination = parseDestination(String(formData.get("url") ?? "").trim());
  const label = String(formData.get("label") ?? "").trim();
  const requested = String(formData.get("code") ?? "")
    .trim()
    .toLowerCase();

  if (!destination) {
    return { error: "Informe um endereço http ou https." };
  }

  let code = requested;
  if (code) {
    if (!codePattern.test(code) || code.length < 3) {
      return { error: "O atalho precisa ter de 3 a 32 letras, números ou hífen." };
    }
    if (await findLink(code)) {
      return { error: "Esse atalho já está em uso." };
    }
  } else {
    code = randomCode();
    while (await findLink(code)) code = randomCode();
  }

  await saveLink({
    code,
    url: destination,
    label,
    clicks: 0,
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/encurtador");
  return { url: code };
}

export async function removeShortLink(formData: FormData) {
  await requireAccess();
  const code = String(formData.get("code") ?? "");
  if (!code) return;
  await deleteLink(code);
  revalidatePath("/encurtador");
}
