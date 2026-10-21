"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import {
  createAccessGrant,
  createCompany,
  deleteAccessGrant,
} from "@/lib/organizations-store";
import { prisma } from "@/lib/prisma";

export type FormState = { error: string } | null;

async function requireOrganizationOwner(organizationId: string) {
  if (!authEnabled) return;
  const session = await getSession();
  if (!session || !session.isOrganizationOwner) {
    redirect("/login");
  }
  const grant = await prisma.accessGrant.findUnique({
    where: {
      organizationId_email: {
        organizationId,
        email: session.email.trim().toLowerCase(),
      },
    },
  });
  if (grant?.isOwner !== true) {
    redirect(session.role === "admin" ? "/admin" : "/dashboard");
  }
}

export async function addCompanyToOrganization(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const organizationId = String(formData.get("organizationId") ?? "");
  await requireOrganizationOwner(organizationId);
  const name = String(formData.get("name") ?? "").trim();
  const result = await createCompany({ organizationId, name });
  if ("error" in result) {
    return { error: result.error ?? "Não foi possível criar a empresa." };
  }
  revalidatePath("/organizacao");
  redirect(`/organizacao?org=${organizationId}&empresa=${result.companyId}`);
}

export async function addOrganizationAccess(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const organizationId = String(formData.get("organizationId") ?? "");
  await requireOrganizationOwner(organizationId);
  const email = String(formData.get("email") ?? "").trim();
  const companyIds = formData
    .getAll("companyIds")
    .map((value) => String(value));
  const allCompanies =
    companyIds.length === 0 &&
    String(formData.get("allCompanies") ?? "") === "true";

  const result = await createAccessGrant({
    organizationId,
    email,
    allCompanies,
    companyIds,
    isOwner: false,
  });
  if ("error" in result) {
    return { error: result.error ?? "Não foi possível liberar o acesso." };
  }
  revalidatePath("/organizacao");
  redirect(`/organizacao?org=${organizationId}`);
}

export async function removeAccessGrant(formData: FormData) {
  const grantId = String(formData.get("grantId") ?? "");
  const org = String(formData.get("org") ?? "");
  if (!grantId || !org) return;
  await requireOrganizationOwner(org);

  const grant = await prisma.accessGrant.findUnique({ where: { id: grantId } });
  if (!grant || grant.organizationId !== org || grant.isOwner) return;

  await deleteAccessGrant(grantId);
  revalidatePath("/organizacao");
  redirect(`/organizacao?org=${org}`);
}
