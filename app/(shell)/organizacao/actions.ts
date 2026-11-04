"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { parseCompanyAccessRole, type CompanyAccessRole } from "@/lib/company-access-role";
import {
  addCompaniesToAccessGrant,
  associateFlowCompanyAndGrant,
  canManageOrganization,
  createAccessGrant,
  createCompany,
  deleteAccessGrant,
  resetOrganizationUserPassword,
  setAccessGrantAllCompanies,
  setAccessGrantCompanyRole,
  toggleAccessGrantCompany,
  updateOrganizationUserConfiguration,
} from "@/lib/organizations-store";
import { prisma } from "@/lib/prisma";

export type FormState = { error: string } | null;

async function requireOrganizationOwnerOrAdmin(organizationId: string) {
  if (!authEnabled) return { isAdmin: true };
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role === "admin") {
    return { isAdmin: true };
  }
  if (!session.isOrganizationOwner) {
    redirect("/dashboard");
  }
  const canManage = await canManageOrganization(session.email, organizationId);
  if (!canManage) {
    redirect("/dashboard");
  }
  return { isAdmin: false };
}

export async function addCompanyToOrganization(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const organizationId = String(formData.get("organizationId") ?? "");
  const basePath = String(formData.get("basePath") ?? "") || "/organizacao";
  await requireOrganizationOwnerOrAdmin(organizationId);
  const name = String(formData.get("name") ?? "").trim();
  const result = await createCompany({ organizationId, name });
  if ("error" in result) {
    return { error: result.error ?? "Não foi possível criar a empresa." };
  }
  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/planos");
  redirect(`${basePath}?org=${organizationId}&empresa=${result.companyId}`);
}

export async function addOrganizationAccess(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const organizationId = String(formData.get("organizationId") ?? "");
  const basePath = String(formData.get("basePath") ?? "") || "/organizacao";
  await requireOrganizationOwnerOrAdmin(organizationId);
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const isOwner = String(formData.get("isOwner") ?? "") === "true";
  const companyIds = formData
    .getAll("companyIds")
    .map((value) => String(value));
  const companyRoles: Record<string, CompanyAccessRole> = {};
  for (const companyId of companyIds) {
    companyRoles[companyId] = parseCompanyAccessRole(
      formData.get(`companyRole_${companyId}`),
    );
  }
  const allCompanies =
    isOwner ||
    String(formData.get("allCompanies") ?? "") === "true";

  const result = await createAccessGrant({
    organizationId,
    name,
    email,
    password: password || undefined,
    allCompanies,
    companyIds,
    companyRoles,
    isOwner,
  });
  if ("error" in result) {
    return { error: result.error ?? "Não foi possível incluir o usuário." };
  }
  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  const orgQuery = String(formData.get("empresa") ?? "");
  const query = new URLSearchParams({ org: organizationId });
  if (orgQuery) query.set("empresa", orgQuery);
  redirect(`${basePath}?${query.toString()}`);
}

export async function toggleUserCompanyAccess(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const grantId = String(formData.get("grantId") ?? "");
  const companyId = String(formData.get("companyId") ?? "");
  if (!organizationId || !grantId || !companyId) return;
  await requireOrganizationOwnerOrAdmin(organizationId);

  await toggleAccessGrantCompany({
    grantId,
    organizationId,
    companyId,
  });

  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

export async function associateCompanyWithUserInFlow(input: {
  organizationId: string;
  companyId: string;
  grantId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { organizationId, companyId, grantId } = input;
  if (!organizationId || !companyId || !grantId) {
    return { ok: false, error: "Dados incompletos para associação." };
  }
  await requireOrganizationOwnerOrAdmin(organizationId);

  const result = await associateFlowCompanyAndGrant({
    organizationId,
    companyId,
    grantId,
  });

  if ("error" in result) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function toggleUserAllCompaniesAccess(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const grantId = String(formData.get("grantId") ?? "");
  const allCompanies = String(formData.get("allCompanies") ?? "") === "true";
  if (!organizationId || !grantId) return;
  await requireOrganizationOwnerOrAdmin(organizationId);

  await setAccessGrantAllCompanies({
    grantId,
    organizationId,
    allCompanies,
  });

  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

export async function addCompaniesToUserGrant(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const organizationId = String(formData.get("organizationId") ?? "");
  const basePath = String(formData.get("basePath") ?? "") || "/organizacao";
  const grantId = String(formData.get("grantId") ?? "");
  const empresa = String(formData.get("empresa") ?? "");
  await requireOrganizationOwnerOrAdmin(organizationId);

  const companyIds = formData.getAll("companyIds").map((value) => String(value));
  const singleCompanyId = String(formData.get("companyId") ?? "");
  const mergedIds =
    companyIds.length > 0
      ? companyIds
      : singleCompanyId
        ? [singleCompanyId]
        : [];

  const result = await addCompaniesToAccessGrant({
    grantId,
    organizationId,
    companyIds: mergedIds,
    role: parseCompanyAccessRole(formData.get("companyRole")),
  });
  if ("error" in result) {
    return { error: result.error ?? "Não foi possível associar a empresa." };
  }

  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  const query = new URLSearchParams({ org: organizationId });
  if (empresa) query.set("empresa", empresa);
  redirect(`${basePath}?${query.toString()}`);
}

export async function updateUserCompanyAccessRole(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const grantId = String(formData.get("grantId") ?? "");
  const companyId = String(formData.get("companyId") ?? "");
  const role = parseCompanyAccessRole(formData.get("role"));
  if (!organizationId || !grantId || !companyId) return;
  await requireOrganizationOwnerOrAdmin(organizationId);

  await setAccessGrantCompanyRole({
    grantId,
    organizationId,
    companyId,
    role,
  });

  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
}

export async function removeAccessGrant(formData: FormData) {
  const grantId = String(formData.get("grantId") ?? "");
  const org = String(formData.get("org") ?? "");
  const basePath = String(formData.get("basePath") ?? "") || "/organizacao";
  const empresa = String(formData.get("empresa") ?? "");
  if (!grantId || !org) return;
  const { isAdmin } = await requireOrganizationOwnerOrAdmin(org);

  const grant = await prisma.accessGrant.findUnique({ where: { id: grantId } });
  if (!grant || grant.organizationId !== org || (!isAdmin && grant.isOwner)) {
    return;
  }

  await deleteAccessGrant(grantId);
  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  const query = new URLSearchParams({ org });
  if (empresa) query.set("empresa", empresa);
  redirect(`${basePath}?${query.toString()}`);
}

export async function saveUserFlowConfigAction(input: {
  organizationId: string;
  grantId: string;
  name?: string;
  isOwner?: boolean;
  allCompanies?: boolean;
  companyIds?: string[];
  companyRoles?: Record<string, CompanyAccessRole>;
  newPassword?: string;
  confirmPassword?: string;
}): Promise<{ ok: boolean; error?: string; passwordUpdated?: boolean }> {
  if (!input.organizationId || !input.grantId) {
    return { ok: false, error: "Dados incompletos para atualizar o usuário." };
  }
  const { isAdmin } = await requireOrganizationOwnerOrAdmin(
    input.organizationId,
  );

  const rawPassword = (input.newPassword ?? "").trim();
  const rawConfirm = (input.confirmPassword ?? "").trim();
  if (rawPassword || rawConfirm) {
    if (rawPassword.length < 8) {
      return {
        ok: false,
        error: "A nova senha precisa ter pelo menos 8 caracteres.",
      };
    }
    if (rawPassword !== rawConfirm) {
      return { ok: false, error: "As senhas informadas não coincidem." };
    }
  }

  const result = await updateOrganizationUserConfiguration({
    organizationId: input.organizationId,
    grantId: input.grantId,
    name: input.name,
    isOwner: input.isOwner,
    allCompanies: input.allCompanies,
    companyIds: input.companyIds,
    companyRoles: input.companyRoles,
    newPassword: rawPassword || undefined,
    allowOwnerChange: isAdmin,
  });

  if ("error" in result) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  return { ok: true, passwordUpdated: result.passwordUpdated };
}

export async function resetUserPasswordInOrgAction(input: {
  organizationId: string;
  grantId: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.organizationId || !input.grantId) {
    return { ok: false, error: "Dados incompletos para redefinir a senha." };
  }
  await requireOrganizationOwnerOrAdmin(input.organizationId);

  const rawPassword = input.newPassword.trim();
  const rawConfirm = input.confirmPassword.trim();

  if (rawPassword.length < 8) {
    return {
      ok: false,
      error: "A nova senha precisa ter pelo menos 8 caracteres.",
    };
  }
  if (rawPassword !== rawConfirm) {
    return { ok: false, error: "As senhas informadas não coincidem." };
  }

  const result = await resetOrganizationUserPassword({
    organizationId: input.organizationId,
    grantId: input.grantId,
    newPassword: rawPassword,
  });

  if ("error" in result) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function removeUserFromOrgFlowAction(input: {
  organizationId: string;
  grantId: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.organizationId || !input.grantId) {
    return { ok: false, error: "Dados incompletos para remoção." };
  }
  const { isAdmin } = await requireOrganizationOwnerOrAdmin(
    input.organizationId,
  );

  const grant = await prisma.accessGrant.findUnique({
    where: { id: input.grantId },
  });
  if (!grant || grant.organizationId !== input.organizationId) {
    return { ok: false, error: "Acesso não encontrado nesta organização." };
  }
  if (!isAdmin && grant.isOwner) {
    return {
      ok: false,
      error: "Apenas o administrador da plataforma pode remover um proprietário.",
    };
  }

  await deleteAccessGrant(grant.id);
  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

