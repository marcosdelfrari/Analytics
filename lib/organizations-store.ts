import { randomUUID } from "node:crypto";
import { adminEmail, roleForEmail } from "@/lib/access-code";
import {
  AccountRole,
  OrgMemberRole,
  hasProprietarioAccess,
  isOrgProprietarioMemberRole,
  isSystemAdminAccount,
  parseOrgMemberRole,
  type OrgMemberRole as OrgMemberRoleType,
} from "@/lib/access-roles";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/types";

export type CompanyAccount = {
  id: string;
  name: string;
  planActive: boolean;
  organizationId: string;
  organizationName: string;
};

export type OrganizationSummary = {
  id: string;
  name: string;
  companies: CompanyAccount[];
  grants: AccessGrantSummary[];
};

export type AccessGrantSummary = {
  id: string;
  email: string;
  userId: string | null;
  userName: string;
  hasPassword: boolean;
  allCompanies: boolean;
  isOrgProprietario: boolean;
  companyIds: string[];
  /** Papel em cada empresa vinculada (vínculo específico). */
  companyRoles: Record<string, OrgMemberRoleType>;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const ADMIN_ORG_NAME = "Lótus";

/** Organização própria do admin da plataforma (não confundir com o papel agency). */
export async function ensureAdminLotusOrganization() {
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!admin) return;

  await prisma.organization.upsert({
    where: { id: admin.id },
    create: {
      id: admin.id,
      name: ADMIN_ORG_NAME,
    },
    update: { name: ADMIN_ORG_NAME },
  });

  await prisma.company.upsert({
    where: { id: admin.id },
    create: {
      id: admin.id,
      organizationId: admin.id,
      name: ADMIN_ORG_NAME,
      planActive: true,
    },
    update: {
      name: ADMIN_ORG_NAME,
      planActive: true,
    },
  });

  await prisma.accessGrant.upsert({
    where: {
      organizationId_email: {
        organizationId: admin.id,
        email: admin.email,
      },
    },
    create: {
      organizationId: admin.id,
      email: admin.email,
      allCompanies: true,
      isOrgProprietario: true,
    },
    update: {
      allCompanies: true,
      isOrgProprietario: true,
    },
  });
}

export async function listOrganizations(): Promise<OrganizationSummary[]> {
  const [rows, users] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { name: "asc" },
      include: {
        companies: { orderBy: { name: "asc" } },
        accessGrants: {
          orderBy: [{ isOrgProprietario: "desc" }, { email: "asc" }],
          include: { companies: true },
        },
      },
    }),
    prisma.user.findMany({
      select: { id: true, email: true, name: true, passwordHash: true },
    }),
  ]);

  const userByEmail = new Map(
    users.map((user) => [normalizeEmail(user.email), user]),
  );

  return rows.map((org) => ({
    id: org.id,
    name: org.name,
    companies: org.companies.map((company) => ({
      id: company.id,
      name: company.name,
      planActive: company.planActive,
      organizationId: org.id,
      organizationName: org.name,
    })),
    grants: org.accessGrants.map((grant) => {
      const matchedUser = userByEmail.get(normalizeEmail(grant.email));
      return {
        id: grant.id,
        email: grant.email,
        userId: matchedUser?.id ?? null,
        userName:
          matchedUser?.name?.trim() ||
          (grant.email.split("@")[0] ?? grant.email),
        hasPassword: Boolean(matchedUser?.passwordHash),
        allCompanies: grant.allCompanies,
        isOrgProprietario: grant.isOrgProprietario,
        companyIds: grant.companies.map((link) => link.companyId),
        companyRoles: Object.fromEntries(
          grant.companies.map((link) => [
            link.companyId,
            link.role as OrgMemberRoleType,
          ]),
        ),
      };
    }),
  }));
}

async function accessGrantsForEmail(email: string) {
  const normalized = normalizeEmail(email);
  return prisma.accessGrant.findMany({
    where: {
      email: { equals: normalized, mode: "insensitive" },
    },
    include: { companies: { select: { role: true } } },
  });
}

export async function listOrganizationsForOwner(
  email: string,
): Promise<OrganizationSummary[]> {
  const normalized = normalizeEmail(email);
  const all = await listOrganizations();
  return all.filter((org) =>
    org.grants.some(
      (grant) =>
        normalizeEmail(grant.email) === normalized &&
        hasProprietarioAccess(grant),
    ),
  );
}

/**
 * Nível de proprietário na sessão/UI: owner da org OU administrador
 * de ao menos uma empresa vinculada.
 */
export async function emailHasProprietarioAccess(email: string) {
  const grants = await accessGrantsForEmail(email);
  return grants.some(
    (grant) =>
      grant.isOrgProprietario ||
      grant.companies.some((link) => isOrgProprietarioMemberRole(link.role)),
  );
}

/** @deprecated Use `emailHasProprietarioAccess`. */
export const emailIsOrganizationOwner = emailHasProprietarioAccess;

export async function canManageOrganization(email: string, organizationId: string) {
  const normalized = normalizeEmail(email);
  if (isSystemAdminAccount(roleForEmail(normalized))) return true;
  const grant = await prisma.accessGrant.findFirst({
    where: {
      organizationId,
      email: { equals: normalized, mode: "insensitive" },
    },
    include: { companies: true },
  });
  if (!grant) return false;
  if (grant.isOrgProprietario) return true;
  return grant.companies.some((link) => isOrgProprietarioMemberRole(link.role));
}

export async function listCompanies(): Promise<CompanyAccount[]> {
  const companies = await prisma.company.findMany({
    orderBy: [{ organization: { name: "asc" } }, { name: "asc" }],
    include: { organization: true },
  });
  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    planActive: company.planActive,
    organizationId: company.organizationId,
    organizationName: company.organization.name,
  }));
}

export async function findCompanyById(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: { organization: true },
  });
  if (!company) return null;
  return {
    id: company.id,
    name: company.name,
    planActive: company.planActive,
    organizationId: company.organizationId,
    organizationName: company.organization.name,
  };
}

export async function listAccessibleCompanies(
  email: string,
): Promise<CompanyAccount[]> {
  const normalized = normalizeEmail(email);
  if (isSystemAdminAccount(roleForEmail(normalized))) {
    return listCompanies();
  }

  const grants = await prisma.accessGrant.findMany({
    where: { email: normalized },
    include: {
      organization: true,
      companies: { include: { company: true } },
    },
  });

  const byId = new Map<string, CompanyAccount>();

  for (const grant of grants) {
    if (grant.allCompanies) {
      const companies = await prisma.company.findMany({
        where: { organizationId: grant.organizationId },
        include: { organization: true },
      });
      for (const company of companies) {
        byId.set(company.id, {
          id: company.id,
          name: company.name,
          planActive: company.planActive,
          organizationId: company.organizationId,
          organizationName: company.organization.name,
        });
      }
      continue;
    }

    for (const link of grant.companies) {
      const company = link.company;
      byId.set(company.id, {
        id: company.id,
        name: company.name,
        planActive: company.planActive,
        organizationId: company.organizationId,
        organizationName: grant.organization.name,
      });
    }
  }

  return [...byId.values()].sort((a, b) =>
    a.organizationName.localeCompare(b.organizationName, "pt-BR") ||
    a.name.localeCompare(b.name, "pt-BR"),
  );
}

export async function emailHasPlatformAccess(email: string) {
  const normalized = normalizeEmail(email);
  if (isSystemAdminAccount(roleForEmail(normalized))) return true;
  const count = await prisma.accessGrant.count({ where: { email: normalized } });
  return count > 0;
}

export async function canAccessCompany(email: string, companyId: string) {
  const normalized = normalizeEmail(email);
  if (isSystemAdminAccount(roleForEmail(normalized))) return true;
  const accessible = await listAccessibleCompanies(normalized);
  return accessible.some((company) => company.id === companyId);
}

export async function createOrganization(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { error: "Informe o nome da organização." } as const;
  }
  const org = await prisma.organization.create({ data: { name: trimmed } });
  return { organizationId: org.id } as const;
}

export async function createCompany(input: {
  organizationId: string;
  name: string;
}) {
  const name = input.name.trim();
  if (name.length < 2) {
    return { error: "Informe o nome da empresa." } as const;
  }
  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
  });
  if (!org) return { error: "Organização não encontrada." } as const;

  const company = await prisma.company.create({
    data: {
      organizationId: org.id,
      name,
    },
  });
  return { companyId: company.id } as const;
}

export async function createAccessGrant(input: {
  organizationId: string;
  name?: string;
  email: string;
  password?: string;
  allCompanies: boolean;
  companyIds: string[];
  companyRoles?: Record<string, OrgMemberRoleType>;
  isOrgProprietario?: boolean;
}) {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    return { error: "Informe um e-mail válido." } as const;
  }

  const rawPassword = (input.password ?? "").trim();
  if (rawPassword && rawPassword.length < 8) {
    return {
      error: "A senha inicial precisa ter pelo menos 8 caracteres.",
    } as const;
  }

  const cleanName = (input.name ?? "").trim();

  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    include: { companies: true },
  });
  if (!org) return { error: "Organização não encontrada." } as const;

  const isOrgProprietario = input.isOrgProprietario === true;
  const allCompanies = isOrgProprietario || input.allCompanies;

  const companyIds = allCompanies
    ? []
    : [...new Set(input.companyIds)].filter((id) =>
        org.companies.some((company) => company.id === id),
      );

  const roleForCompanyId = (companyId: string): OrgMemberRoleType =>
    input.companyRoles?.[companyId] ?? OrgMemberRole.analista;

  const existing = await prisma.accessGrant.findUnique({
    where: {
      organizationId_email: { organizationId: org.id, email },
    },
    include: { companies: true },
  });

  const role: Role = roleForEmail(email);
  const passwordHash = rawPassword ? await hashPassword(rawPassword) : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { email },
      create: {
        email,
        name: cleanName || (email.split("@")[0] ?? email),
        role,
        planActive: isSystemAdminAccount(role),
        ...(passwordHash ? { passwordHash } : {}),
      },
      update: {
        ...(cleanName ? { name: cleanName } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    if (existing) {
      if (isOrgProprietario || allCompanies) {
        await tx.accessGrant.update({
          where: { id: existing.id },
          data: {
            isOrgProprietario: existing.isOrgProprietario || isOrgProprietario,
            allCompanies: true,
          },
        });
        await tx.accessGrantCompany.deleteMany({
          where: { grantId: existing.id },
        });
      } else if (!existing.isOrgProprietario && !existing.allCompanies) {
        const currentIds = new Set(existing.companies.map((c) => c.companyId));
        const toAdd = companyIds.filter((id) => !currentIds.has(id));
        if (toAdd.length > 0) {
          await tx.accessGrantCompany.createMany({
            data: toAdd.map((companyId) => ({
              grantId: existing.id,
              companyId,
              role: roleForCompanyId(companyId),
            })),
            skipDuplicates: true,
          });
        }
      }
      return;
    }

    await tx.accessGrant.create({
      data: {
        organizationId: org.id,
        email,
        allCompanies,
        isOrgProprietario,
        companies: allCompanies
          ? undefined
          : {
              create: companyIds.map((companyId) => ({
                companyId,
                role: roleForCompanyId(companyId),
              })),
            },
      },
    });
  });

  return { ok: true } as const;
}

export async function toggleAccessGrantCompany(input: {
  grantId: string;
  organizationId: string;
  companyId: string;
}) {
  const grant = await prisma.accessGrant.findUnique({
    where: { id: input.grantId },
    include: {
      companies: true,
      organization: { include: { companies: true } },
    },
  });

  if (!grant || grant.organizationId !== input.organizationId) {
    return { error: "Acesso não encontrado nesta organização." } as const;
  }
  if (grant.isOrgProprietario) {
    return { error: "Proprietários têm acesso a toda a organização." } as const;
  }

  const orgCompanies = grant.organization.companies;
  if (!orgCompanies.some((c) => c.id === input.companyId)) {
    return { error: "Empresa inválida." } as const;
  }

  await prisma.$transaction(async (tx) => {
    if (grant.allCompanies) {
      const remaining = orgCompanies
        .map((c) => c.id)
        .filter((id) => id !== input.companyId);
      await tx.accessGrant.update({
        where: { id: grant.id },
        data: { allCompanies: false },
      });
      await tx.accessGrantCompany.deleteMany({ where: { grantId: grant.id } });
      if (remaining.length > 0) {
        await tx.accessGrantCompany.createMany({
          data: remaining.map((companyId) => ({
            grantId: grant.id,
            companyId,
            role: OrgMemberRole.analista,
          })),
          skipDuplicates: true,
        });
      }
      return;
    }

    const currentIds = new Set(grant.companies.map((c) => c.companyId));
    if (currentIds.has(input.companyId)) {
      await tx.accessGrantCompany.delete({
        where: {
          grantId_companyId: {
            grantId: grant.id,
            companyId: input.companyId,
          },
        },
      });
    } else {
      await tx.accessGrantCompany.create({
        data: {
          grantId: grant.id,
          companyId: input.companyId,
          role: OrgMemberRole.analista,
        },
      });
    }
  });

  return { ok: true } as const;
}

export async function associateFlowCompanyAndGrant(input: {
  grantId: string;
  organizationId: string;
  companyId: string;
  role?: OrgMemberRoleType;
}) {
  const grant = await prisma.accessGrant.findUnique({
    where: { id: input.grantId },
    include: {
      companies: true,
      organization: { include: { companies: true } },
    },
  });

  if (!grant || grant.organizationId !== input.organizationId) {
    return { error: "Usuário não encontrado nesta organização." } as const;
  }

  const orgCompanies = grant.organization.companies;
  if (!orgCompanies.some((c) => c.id === input.companyId)) {
    return { error: "Empresa inválida." } as const;
  }

  if (grant.isOrgProprietario || grant.allCompanies) {
    return { ok: true } as const;
  }

  const linkRole = input.role ?? OrgMemberRole.analista;

  await prisma.accessGrantCompany.upsert({
    where: {
      grantId_companyId: {
        grantId: grant.id,
        companyId: input.companyId,
      },
    },
    create: {
      grantId: grant.id,
      companyId: input.companyId,
      role: linkRole,
    },
    update: {},
  });

  return { ok: true } as const;
}

export async function setAccessGrantAllCompanies(input: {
  grantId: string;
  organizationId: string;
  allCompanies: boolean;
}) {
  const grant = await prisma.accessGrant.findUnique({
    where: { id: input.grantId },
    include: {
      organization: { include: { companies: true } },
    },
  });

  if (!grant || grant.organizationId !== input.organizationId) {
    return { error: "Acesso não encontrado nesta organização." } as const;
  }
  if (grant.isOrgProprietario) {
    return { error: "Proprietários têm acesso a toda a organização." } as const;
  }

  await prisma.$transaction(async (tx) => {
    if (input.allCompanies) {
      await tx.accessGrant.update({
        where: { id: grant.id },
        data: { allCompanies: true },
      });
      await tx.accessGrantCompany.deleteMany({ where: { grantId: grant.id } });
    } else {
      const firstCompanyId = grant.organization.companies[0]?.id;
      await tx.accessGrant.update({
        where: { id: grant.id },
        data: { allCompanies: false },
      });
      await tx.accessGrantCompany.deleteMany({ where: { grantId: grant.id } });
      if (firstCompanyId) {
        await tx.accessGrantCompany.create({
          data: { grantId: grant.id, companyId: firstCompanyId, role: OrgMemberRole.analista },
        });
      }
    }
  });

  return { ok: true } as const;
}

export async function addCompaniesToAccessGrant(input: {
  grantId: string;
  organizationId: string;
  companyIds: string[];
  role?: OrgMemberRoleType;
}) {
  const grant = await prisma.accessGrant.findUnique({
    where: { id: input.grantId },
    include: {
      companies: true,
      organization: { include: { companies: true } },
    },
  });

  if (!grant || grant.organizationId !== input.organizationId) {
    return { error: "Acesso não encontrado nesta organização." } as const;
  }
  if (grant.isOrgProprietario) {
    return { error: "Proprietários já têm acesso a toda a organização." } as const;
  }
  if (grant.allCompanies) {
    return {
      error: "Este usuário já tem acesso a todas as empresas da organização.",
    } as const;
  }

  const orgCompanyIds = new Set(grant.organization.companies.map((c) => c.id));
  const existing = new Set(grant.companies.map((link) => link.companyId));
  const toAdd = [...new Set(input.companyIds)].filter(
    (id) => orgCompanyIds.has(id) && !existing.has(id),
  );

  if (toAdd.length === 0) {
    return {
      error: "Selecione ao menos uma empresa que o usuário ainda não acessa.",
    } as const;
  }

  const linkRole = input.role ?? OrgMemberRole.analista;

  await prisma.accessGrantCompany.createMany({
    data: toAdd.map((companyId) => ({
      grantId: grant.id,
      companyId,
      role: linkRole,
    })),
    skipDuplicates: true,
  });

  return { ok: true, added: toAdd.length } as const;
}

export async function setAccessGrantCompanyRole(input: {
  grantId: string;
  organizationId: string;
  companyId: string;
  role: OrgMemberRoleType;
}) {
  const grant = await prisma.accessGrant.findUnique({
    where: { id: input.grantId },
    include: { companies: true },
  });

  if (!grant || grant.organizationId !== input.organizationId) {
    return { error: "Acesso não encontrado nesta organização." } as const;
  }
  if (grant.isOrgProprietario) {
    return {
      error: "Proprietários da organização já têm acesso total.",
    } as const;
  }
  if (grant.allCompanies) {
    return {
      error:
        "Usuários com acesso a todas as empresas não têm papel por vínculo.",
    } as const;
  }

  const link = grant.companies.find((item) => item.companyId === input.companyId);
  if (!link) {
    return { error: "Empresa não vinculada a este usuário." } as const;
  }

  await prisma.accessGrantCompany.update({
    where: {
      grantId_companyId: {
        grantId: grant.id,
        companyId: input.companyId,
      },
    },
    data: { role: input.role },
  });

  return { ok: true } as const;
}

export async function updateOrganizationUserConfiguration(input: {
  organizationId: string;
  grantId: string;
  name?: string;
  isOrgProprietario?: boolean;
  allCompanies?: boolean;
  companyIds?: string[];
  companyRoles?: Record<string, OrgMemberRoleType>;
  newPassword?: string;
  allowOwnerChange?: boolean;
}) {
  const grant = await prisma.accessGrant.findUnique({
    where: { id: input.grantId },
    include: {
      companies: true,
      organization: { include: { companies: true } },
    },
  });

  if (!grant || grant.organizationId !== input.organizationId) {
    return { error: "Usuário não encontrado nesta organização." } as const;
  }

  const rawPassword = (input.newPassword ?? "").trim();
  if (rawPassword && rawPassword.length < 8) {
    return {
      error: "A nova senha precisa ter pelo menos 8 caracteres.",
    } as const;
  }

  const email = normalizeEmail(grant.email);
  const role: Role = roleForEmail(email);
  const cleanName = (input.name ?? "").trim();
  const passwordHash = rawPassword ? await hashPassword(rawPassword) : undefined;

  const isPlatformAdminSelfOwner =
    email === normalizeEmail(adminEmail) && grant.isOrgProprietario;

  const nextIsOwner = isPlatformAdminSelfOwner
    ? true
    : input.allowOwnerChange && typeof input.isOrgProprietario === "boolean"
      ? input.isOrgProprietario
      : grant.isOrgProprietario;

  const nextAllCompanies = nextIsOwner
    ? true
    : typeof input.allCompanies === "boolean"
      ? input.allCompanies
      : grant.allCompanies;

  const orgCompanyIds = new Set(grant.organization.companies.map((c) => c.id));
  const selectedCompanyIds = nextAllCompanies
    ? []
    : [...new Set(input.companyIds ?? grant.companies.map((c) => c.companyId))].filter(
        (id) => orgCompanyIds.has(id),
      );

  const roleForCompany = (companyId: string): OrgMemberRoleType => {
    const provided = input.companyRoles?.[companyId];
    if (provided !== undefined) {
      return parseOrgMemberRole(provided);
    }
    const existing = grant.companies.find((c) => c.companyId === companyId);
    return (existing?.role as OrgMemberRoleType) ?? OrgMemberRole.analista;
  };

  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { email },
      create: {
        email,
        name: cleanName || (email.split("@")[0] ?? email),
        role,
        planActive: isSystemAdminAccount(role),
        ...(passwordHash ? { passwordHash } : {}),
      },
      update: {
        ...(cleanName ? { name: cleanName } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    await tx.accessGrant.update({
      where: { id: grant.id },
      data: {
        isOrgProprietario: nextIsOwner,
        allCompanies: nextAllCompanies,
      },
    });

    await tx.accessGrantCompany.deleteMany({
      where: { grantId: grant.id },
    });

    if (!nextIsOwner && !nextAllCompanies && selectedCompanyIds.length > 0) {
      await tx.accessGrantCompany.createMany({
        data: selectedCompanyIds.map((companyId) => ({
          grantId: grant.id,
          companyId,
          role: roleForCompany(companyId),
        })),
        skipDuplicates: true,
      });
    }
  });

  return { ok: true, passwordUpdated: Boolean(passwordHash) } as const;
}

export async function resetOrganizationUserPassword(input: {
  organizationId: string;
  grantId: string;
  newPassword: string;
}) {
  const grant = await prisma.accessGrant.findUnique({
    where: { id: input.grantId },
  });

  if (!grant || grant.organizationId !== input.organizationId) {
    return { error: "Usuário não encontrado nesta organização." } as const;
  }

  const rawPassword = input.newPassword.trim();
  if (rawPassword.length < 8) {
    return {
      error: "A nova senha precisa ter pelo menos 8 caracteres.",
    } as const;
  }

  const email = normalizeEmail(grant.email);
  const role: Role = roleForEmail(email);
  const passwordHash = await hashPassword(rawPassword);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: email.split("@")[0] ?? email,
      role,
      planActive: isSystemAdminAccount(role),
      passwordHash,
    },
    update: {
      passwordHash,
    },
  });

  return { ok: true } as const;
}

export async function deleteAccessGrant(id: string) {
  await prisma.accessGrant.delete({ where: { id } });
}

export async function deleteCompany(id: string) {
  await prisma.company.delete({ where: { id } });
}

export async function deleteOrganization(id: string) {
  await prisma.organization.delete({ where: { id } });
}

export async function setCompanyPlanActive(id: string, planActive: boolean) {
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) return { error: "Empresa não encontrada." } as const;
  const updated = await prisma.company.update({
    where: { id },
    data: { planActive },
  });
  return {
    company: {
      id: updated.id,
      name: updated.name,
      planActive: updated.planActive,
      organizationId: updated.organizationId,
      organizationName: "",
    },
  } as const;
}

/** Fluxo legado: organização com uma empresa e acesso total pelo e-mail. */
export async function createClientWorkspace(input: { name: string; email: string }) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  if (name.length < 2) return { error: "Informe o nome." } as const;
  if (!email.includes("@")) return { error: "Informe um e-mail válido." } as const;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.email !== adminEmail) {
    const hasGrant = await prisma.accessGrant.count({ where: { email } });
    if (hasGrant > 0) {
      return { error: "Já existe acesso para esse e-mail." } as const;
    }
  }

  const orgId = randomUUID();
  const companyId = randomUUID();
  const role: Role = roleForEmail(email);

  await prisma.organization.create({
    data: {
      id: orgId,
      name,
      companies: {
        create: {
          id: companyId,
          name,
          planActive: isSystemAdminAccount(role),
        },
      },
      accessGrants: {
        create: {
          email,
          allCompanies: true,
          isOrgProprietario: true,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      role,
      planActive: isSystemAdminAccount(role),
    },
    update: { name },
  });

  return { companyId } as const;
}
