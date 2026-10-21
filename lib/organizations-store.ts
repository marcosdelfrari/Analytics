import { randomUUID } from "node:crypto";
import { adminEmail, roleForEmail } from "@/lib/access-code";
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
  allCompanies: boolean;
  isOwner: boolean;
  companyIds: string[];
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
      isOwner: true,
    },
    update: {
      allCompanies: true,
      isOwner: true,
    },
  });
}

export async function ensureLegacyClientsMigrated() {
  await ensureAdminLotusOrganization();

  const clients = await prisma.user.findMany({
    where: { role: "client" },
    orderBy: { createdAt: "asc" },
  });

  for (const user of clients) {
    await prisma.organization.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        name: user.name,
      },
      update: { name: user.name },
    });

    await prisma.company.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        organizationId: user.id,
        name: user.name,
        planActive: user.planActive,
      },
      update: {
        name: user.name,
        planActive: user.planActive,
      },
    });

    await prisma.accessGrant.upsert({
      where: {
        organizationId_email: {
          organizationId: user.id,
          email: user.email,
        },
      },
      create: {
        organizationId: user.id,
        email: user.email,
        allCompanies: true,
        isOwner: true,
      },
      update: { isOwner: true },
    });
  }
}

export async function listOrganizations(): Promise<OrganizationSummary[]> {
  await ensureLegacyClientsMigrated();
  const rows = await prisma.organization.findMany({
    orderBy: { name: "asc" },
    include: {
      companies: { orderBy: { name: "asc" } },
      accessGrants: {
        orderBy: { email: "asc" },
        include: { companies: true },
      },
    },
  });

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
    grants: org.accessGrants.map((grant) => ({
      id: grant.id,
      email: grant.email,
      allCompanies: grant.allCompanies,
      isOwner: grant.isOwner,
      companyIds: grant.companies.map((link) => link.companyId),
    })),
  }));
}

export async function listOrganizationsForOwner(
  email: string,
): Promise<OrganizationSummary[]> {
  const normalized = normalizeEmail(email);
  const all = await listOrganizations();
  return all.filter((org) =>
    org.grants.some(
      (grant) =>
        grant.email === normalized && grant.isOwner,
    ),
  );
}

export async function emailIsOrganizationOwner(email: string) {
  const normalized = normalizeEmail(email);
  const count = await prisma.accessGrant.count({
    where: { email: normalized, isOwner: true },
  });
  return count > 0;
}

export async function canManageOrganization(email: string, organizationId: string) {
  const normalized = normalizeEmail(email);
  if (roleForEmail(normalized) === "admin") return true;
  const grant = await prisma.accessGrant.findUnique({
    where: {
      organizationId_email: { organizationId, email: normalized },
    },
  });
  return grant?.isOwner === true;
}

export async function listCompanies(): Promise<CompanyAccount[]> {
  await ensureLegacyClientsMigrated();
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
  await ensureLegacyClientsMigrated();
  const normalized = normalizeEmail(email);
  if (roleForEmail(normalized) === "admin") {
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
  if (roleForEmail(normalized) === "admin") return true;
  const count = await prisma.accessGrant.count({ where: { email: normalized } });
  return count > 0;
}

export async function canAccessCompany(email: string, companyId: string) {
  const normalized = normalizeEmail(email);
  if (roleForEmail(normalized) === "admin") return true;
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
  email: string;
  allCompanies: boolean;
  companyIds: string[];
  isOwner?: boolean;
}) {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    return { error: "Informe um e-mail válido." } as const;
  }

  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    include: { companies: true },
  });
  if (!org) return { error: "Organização não encontrada." } as const;

  const companyIds = input.allCompanies
    ? []
    : [...new Set(input.companyIds)].filter((id) =>
        org.companies.some((company) => company.id === id),
      );

  if (!input.allCompanies && companyIds.length === 0) {
    return { error: "Selecione ao menos uma empresa ou marque acesso à organização inteira." } as const;
  }

  const existing = await prisma.accessGrant.findUnique({
    where: {
      organizationId_email: { organizationId: org.id, email },
    },
  });
  if (existing) {
    return { error: "Esse e-mail já tem acesso nesta organização." } as const;
  }

  await prisma.accessGrant.create({
    data: {
      organizationId: org.id,
      email,
      allCompanies: input.allCompanies,
      isOwner: input.isOwner === true,
      companies: input.allCompanies
        ? undefined
        : {
            create: companyIds.map((companyId) => ({ companyId })),
          },
    },
  });

  const role: Role = roleForEmail(email);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: email.split("@")[0] ?? email,
      role,
      planActive: role === "admin",
    },
    update: {},
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
          planActive: role === "admin",
        },
      },
      accessGrants: {
        create: {
          email,
          allCompanies: true,
          isOwner: true,
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
      planActive: role === "admin",
    },
    update: { name },
  });

  return { companyId } as const;
}
