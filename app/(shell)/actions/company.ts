"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import {
  companyCookie,
  companyCookieOptions,
} from "@/lib/company-context";
import { canAccessCompany } from "@/lib/organizations-store";

export async function selectActiveCompany(formData: FormData) {
  if (!authEnabled) redirect("/login");

  const session = await getSession();
  if (!session || session.role !== "client") redirect("/login");

  const companyId = String(formData.get("companyId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/dashboard");
  if (!companyId) redirect(returnTo);

  const allowed = await canAccessCompany(session.email, companyId);
  if (!allowed) redirect(returnTo);

  const jar = await cookies();
  jar.set(companyCookie, companyId, companyCookieOptions());

  redirect(returnTo.startsWith("/") ? returnTo : "/dashboard");
}
