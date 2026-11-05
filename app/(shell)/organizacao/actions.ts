"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { OrgMemberRole, isSystemAdminAccount } from "@/lib/access-roles";
import { parseOrgMemberRole } from "@/lib/company-access-role";
import {
  addCompaniesToAccessGrant,
  associateFlowCompanyAndGrant,
  createAccessGrant,
  createCompany,
  deleteAccessGrant,
  getOrganizationManagementScope,
  resetOrganizationUserPassword,
  setAccessGrantAllCompanies,
  setAccessGrantCompanyRole,
  toggleAccessGrantCompany,
  updateOrganizationUserConfiguration,
} from "@/lib/organizations-store";
import { prisma } from "@/lib/prisma";

export type FormState = { error: string } | null;

type OrgManagerContext = {
  isAdmin: boolean;
  isOrgWide: boolean;
  managedCompanyIds: string[] | null;
  email: string | null;
};

function assertCanManageCompany(
  ctx: OrgManagerContext,
  companyId: string,
): string | null {
  if (ctx.isOrgWide || !ctx.managedCompanyIds) return null;
  if (!ctx.managedCompanyIds.includes(companyId)) {
    return "Você só pode gerenciar empresas das quais é proprietário.";
  }
  return null;
}

function assertCanManageCompanies(
  ctx: OrgManagerContext,
  companyIds: string[],
): string | null {
  for (const companyId of companyIds) {
    const error = assertCanManageCompany(ctx, companyId);
    if (error) return error;
  }
  return null;
}

async function requireOrganizationOwnerOrAdmin(
  organizationId: string,
): Promise<OrgManagerContext> {
  if (!authEnabled) {
    return {
      isAdmin: true,
      isOrgWide: true,
      managedCompanyIds: null,
      email: null,
    };
  }
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (isSystemAdminAccount(session.role)) {
    return {
      isAdmin: true,
      isOrgWide: true,
      managedCompanyIds: null,
      email: session.email,
    };
  }
  if (!session.isProprietario) {
    redirect("/dashboard");
  }
  const scope = await getOrganizationManagementScope(
    session.email,
    organizationId,
  );
  if (!scope) {
    redirect("/dashboard");
  }
  return {
    isAdmin: false,
    isOrgWide: scope.isOrgWide,
    managedCompanyIds: scope.managedCompanyIds,
    email: session.email,
  };
}

export async function addCompanyToOrganization(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const organizationId = String(formData.get("organizationId") ?? "");
  const basePath = String(formData.get("basePath") ?? "") || "/organizacao";
  const ctx = await requireOrganizationOwnerOrAdmin(organizationId);
  if (!ctx.isOrgWide) {
    return {
      error:
        "Apenas proprietários da organização podem incluir novas empresas.",
    };
  }
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
  const ctx = await requireOrganizationOwnerOrAdmin(organizationId);
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  let isOrgProprietario = String(formData.get("isOwner") ?? "") === "true";
  let companyIds = formData.getAll("companyIds").map((value) => String(value));
  const companyRoles: Record<string, OrgMemberRole> = {};
  for (const companyId of companyIds) {
    companyRoles[companyId] = parseOrgMemberRole(
      formData.get(`companyRole_${companyId}`),
    );
  }
  let allCompanies =
    isOrgProprietario ||
    String(formData.get("allCompanies") ?? "") === "true";

  if (!ctx.isOrgWide) {
    isOrgProprietario = false;
    allCompanies = false;
    companyIds = companyIds.filter((id) =>
      (ctx.managedCompanyIds ?? []).includes(id),
    );
    if (companyIds.length === 0) {
      return {
        error: "Selecione ao menos uma empresa da qual você é proprietário.",
      };
    }
  }

  const companyScopeError = assertCanManageCompanies(ctx, companyIds);
  if (companyScopeError) return { error: companyScopeError };

  const result = await createAccessGrant({
    organizationId,
    name,
    email,
    password: password || undefined,
    allCompanies,
    companyIds,
    companyRoles,
    isOrgProprietario,
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
  const ctx = await requireOrganizationOwnerOrAdmin(organizationId);
  if (assertCanManageCompany(ctx, companyId)) return;

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
  const ctx = await requireOrganizationOwnerOrAdmin(organizationId);
  const scopeError = assertCanManageCompany(ctx, companyId);
  if (scopeError) return { ok: false, error: scopeError };

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
  const ctx = await requireOrganizationOwnerOrAdmin(organizationId);
  if (!ctx.isOrgWide) return;

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
  const ctx = await requireOrganizationOwnerOrAdmin(organizationId);

  const companyIds = formData.getAll("companyIds").map((value) => String(value));
  const singleCompanyId = String(formData.get("companyId") ?? "");
  const mergedIds =
    companyIds.length > 0
      ? companyIds
      : singleCompanyId
        ? [singleCompanyId]
        : [];

  const scopeError = assertCanManageCompanies(ctx, mergedIds);
  if (scopeError) return { error: scopeError };

  const result = await addCompaniesToAccessGrant({
    grantId,
    organizationId,
    companyIds: mergedIds,
    role: parseOrgMemberRole(formData.get("companyRole")),
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
  const role = parseOrgMemberRole(formData.get("role"));
  if (!organizationId || !grantId || !companyId) return;
  const ctx = await requireOrganizationOwnerOrAdmin(organizationId);
  if (assertCanManageCompany(ctx, companyId)) return;

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
  const ctx = await requireOrganizationOwnerOrAdmin(org);

  const grant = await prisma.accessGrant.findUnique({
    where: { id: grantId },
    include: { companies: true },
  });
  if (!grant || grant.organizationId !== org || (!ctx.isAdmin && grant.isOrgProprietario)) {
    return;
  }

  if (!ctx.isOrgWide) {
    if (grant.allCompanies) return;
    const managed = new Set(ctx.managedCompanyIds ?? []);
    const outside = grant.companies.some((link) => !managed.has(link.companyId));
    if (outside) return;
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
  isOrgProprietario?: boolean;
  allCompanies?: boolean;
  companyIds?: string[];
  companyRoles?: Record<string, OrgMemberRole>;
  newPassword?: string;
  confirmPassword?: string;
}): Promise<{ ok: boolean; error?: string; passwordUpdated?: boolean }> {
  if (!input.organizationId || !input.grantId) {
    return { ok: false, error: "Dados incompletos para atualizar o usuário." };
  }
  const ctx = await requireOrganizationOwnerOrAdmin(input.organizationId);

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
    isOrgProprietario: input.isOrgProprietario,
    allCompanies: input.allCompanies,
    companyIds: input.companyIds,
    companyRoles: input.companyRoles,
    newPassword: rawPassword || undefined,
    allowOwnerChange: ctx.isAdmin,
    actorManagedCompanyIds: ctx.isOrgWide ? null : ctx.managedCompanyIds,
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
  const ctx = await requireOrganizationOwnerOrAdmin(input.organizationId);

  const grant = await prisma.accessGrant.findUnique({
    where: { id: input.grantId },
    include: { companies: true },
  });
  if (!grant || grant.organizationId !== input.organizationId) {
    return { ok: false, error: "Acesso não encontrado nesta organização." };
  }
  if (!ctx.isAdmin && grant.isOrgProprietario) {
    return {
      ok: false,
      error: "Apenas o administrador da plataforma pode remover um proprietário.",
    };
  }

  if (!ctx.isOrgWide) {
    if (grant.allCompanies) {
      return {
        ok: false,
        error:
          "Você não pode remover usuários com acesso a toda a organização.",
      };
    }
    const managed = new Set(ctx.managedCompanyIds ?? []);
    const outside = grant.companies.some((link) => !managed.has(link.companyId));
    if (outside) {
      return {
        ok: false,
        error:
          "Este usuário também pertence a outras empresas. Remova apenas o vínculo da sua empresa.",
      };
    }
  }

  await deleteAccessGrant(grant.id);
  revalidatePath("/organizacao");
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  return { ok: true };
}
