"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";
import {
  addAllowedDomain,
  ensureTrackingSite,
  listAllowedDomains,
  removeAllowedDomain,
} from "@/lib/tracking";
import {
  verifyTrackerInPageHtml,
  type HtmlVerifyResult,
} from "@/lib/tracking-verify";

export type DomainFormState = { error: string } | { ok: true } | null;
export type InstallVerifyState = HtmlVerifyResult | null;

async function requireTrackingSite() {
  if (!authEnabled) redirect("/login");
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin" && session.role !== "client") {
    redirect("/login");
  }
  const site = await ensureTrackingSite(session.userId);
  return site;
}

export async function addTrackingDomain(
  _previous: DomainFormState,
  formData: FormData,
): Promise<DomainFormState> {
  const site = await requireTrackingSite();
  const host = String(formData.get("host") ?? "");
  const result = await addAllowedDomain(site.id, host);
  if ("error" in result) return { error: result.error };
  revalidatePath("/rastreamento");
  return { ok: true };
}

export async function deleteTrackingDomain(formData: FormData) {
  const site = await requireTrackingSite();
  const domainId = String(formData.get("domainId") ?? "").trim();
  if (!domainId) return;
  await removeAllowedDomain(site.id, domainId);
  revalidatePath("/rastreamento");
}

export async function verifyScriptInstallation(
  _previous: InstallVerifyState,
  formData: FormData,
): Promise<InstallVerifyState> {
  const site = await requireTrackingSite();
  const pageUrl = String(formData.get("pageUrl") ?? "").trim();
  if (!pageUrl) {
    return { error: "Informe a URL de uma página do site." };
  }

  const domains = await listAllowedDomains(site.id);
  const allowedHosts = domains.map((entry) => entry.host);

  return verifyTrackerInPageHtml(pageUrl, site.publicKey, allowedHosts);
}
