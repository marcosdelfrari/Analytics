import Link from "next/link";
import { RemoveUserButton } from "@/app/(shell)/admin/remove-user-button";
import { adminEmail } from "@/lib/access-code";
import {
  ORG_PROPRIETARIO_LABEL,
  PLATFORM_SYSTEM_ADMIN_LABEL,
  isSystemAdminAccount,
} from "@/lib/access-roles";
import {
  COMPANY_ACCESS_ROLE_LABELS,
  hasProprietarioAccess,
  type OrgMemberRole,
} from "@/lib/company-access-role";
import type { OrganizationSummary } from "@/lib/organizations-store";
import type { Account } from "@/lib/types";

type UsersPanelProps = {
  users: Account[];
  organizations?: OrganizationSummary[];
};

type UserMembership = {
  orgId: string;
  orgName: string;
  isOrgProprietario: boolean;
  isCompanyAdmin: boolean;
  allCompanies: boolean;
  companyNames: string[];
  companyRoleLabels: string[];
  hasActivePlanCompany: boolean;
};

function resolveMemberships(
  email: string,
  organizations: OrganizationSummary[],
): UserMembership[] {
  const normalized = email.trim().toLowerCase();
  const result: UserMembership[] = [];

  for (const org of organizations) {
    const grant = org.grants.find(
      (item) => item.email.trim().toLowerCase() === normalized,
    );
    if (!grant) continue;

    const accessibleCompanies =
      grant.isOrgProprietario || grant.allCompanies
        ? org.companies
        : org.companies.filter((company) =>
            grant.companyIds.includes(company.id),
          );

    const companyRoleLabels = grant.isOrgProprietario
      ? accessibleCompanies.map(() => ORG_PROPRIETARIO_LABEL)
      : grant.allCompanies
        ? accessibleCompanies.map(() => COMPANY_ACCESS_ROLE_LABELS.analista)
        : accessibleCompanies.map((company) => {
            const role =
              grant.companyRoles[company.id] ?? ("analista" as OrgMemberRole);
            return COMPANY_ACCESS_ROLE_LABELS[role];
          });

    result.push({
      orgId: org.id,
      orgName: org.name,
      isOrgProprietario: grant.isOrgProprietario,
      isCompanyAdmin: hasProprietarioAccess(grant),
      allCompanies: grant.allCompanies,
      companyNames: accessibleCompanies.map((c) => c.name),
      companyRoleLabels,
      hasActivePlanCompany: accessibleCompanies.some((c) => c.planActive),
    });
  }

  return result;
}

export function UsersPanel({ users, organizations = [] }: UsersPanelProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
            Diretório de contas
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
            Usuários da plataforma
          </h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Todas as contas com acesso a organizações (proprietários e
            analistas), sincronizadas com os grants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-border-subtle bg-background/60 px-3 py-1.5 font-mono text-[11.5px] text-muted-foreground">
            {users.length} {users.length === 1 ? "usuário" : "usuários"}
          </span>
          <Link
            href="/admin/planos"
            className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-[12px] font-medium text-foreground transition hover:border-white/25"
          >
            Gerenciar planos →
          </Link>
        </div>
      </div>

      {users.length === 0 ? (
        <p className="px-6 py-8 text-[12.5px] text-muted">
          Nenhum usuário cadastrado na plataforma.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-background/40 font-mono text-[10.5px] uppercase tracking-wider text-muted">
                <th className="px-6 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Papel</th>
                <th className="px-4 py-3 font-medium">
                  Organizações e Empresas
                </th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-6 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-[13px]">
              {users.map((user) => {
                const isRootAdmin =
                  isSystemAdminAccount(user.role) || user.email === adminEmail;
                const memberships = resolveMemberships(
                  user.email,
                  organizations,
                );
                const isOwnerAnywhere = memberships.some(
                  (m) => m.isOrgProprietario || m.isCompanyAdmin,
                );
                const planActive =
                  isRootAdmin ||
                  user.planActive ||
                  memberships.some((m) => m.hasActivePlanCompany);

                const roleLabel = isRootAdmin
                  ? PLATFORM_SYSTEM_ADMIN_LABEL
                  : memberships.length === 0
                    ? "Sem organização"
                    : isOwnerAnywhere
                      ? ORG_PROPRIETARIO_LABEL
                      : "Analista";

                return (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-background/30"
                  >
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="mt-0.5 font-mono text-[11.5px] text-muted-foreground">
                        {user.email}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                          isRootAdmin
                            ? "border-white/20 bg-white/10 text-foreground"
                            : isOwnerAnywhere
                              ? "border-positive/25 bg-positive/10 text-positive"
                              : "border-border bg-background/60 text-muted-foreground"
                        }`}
                      >
                        {roleLabel}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {memberships.length === 0 ? (
                        <span className="text-[12px] text-muted">
                          Sem vínculo em organizações
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {memberships.map((m) => (
                            <Link
                              key={m.orgId}
                              href={`/admin?org=${m.orgId}`}
                              className="inline-flex max-w-full flex-col gap-0.5 rounded-lg border border-border-subtle bg-background/70 px-2.5 py-1 text-[11.5px] transition hover:border-white/25"
                            >
                              <span className="font-medium text-foreground">
                                {m.orgName}
                                {m.isOrgProprietario || m.isCompanyAdmin ? (
                                  <span className="ml-1.5 font-normal text-positive">
                                    · {ORG_PROPRIETARIO_LABEL}
                                  </span>
                                ) : null}
                              </span>
                              {m.companyNames.length > 0 ? (
                                <span className="font-mono text-[10px] leading-snug text-muted-foreground">
                                  {m.companyNames.map((name, idx) => (
                                    <span key={`${m.orgId}-${name}`}>
                                      {idx > 0 ? " · " : ""}
                                      {name} ({m.companyRoleLabels[idx] ?? "Analista"})
                                    </span>
                                  ))}
                                </span>
                              ) : (
                                <span className="font-mono text-[10px] text-muted">
                                  Nenhuma empresa
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] ${
                          planActive
                            ? "border-positive/30 bg-positive/10 text-positive"
                            : "border-border bg-background/60 text-muted"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            planActive ? "bg-positive" : "bg-muted"
                          }`}
                        />
                        {planActive ? "Ativo" : "Gratuito"}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      {isRootAdmin ? (
                        <span className="font-mono text-[11px] text-muted">
                          Conta principal
                        </span>
                      ) : (
                        <RemoveUserButton
                          userId={user.id}
                          userName={user.name}
                          email={user.email}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
