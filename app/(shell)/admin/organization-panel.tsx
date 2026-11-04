import Link from "next/link";
import {
  AssociateUserToCompanyPanel,
  GrantAccessActions,
} from "@/app/(shell)/organizacao/grant-access-actions";
import { hasElevatedCompanyAccess } from "@/lib/company-access-role";
import type { OrganizationSummary } from "@/lib/organizations-store";

type OrganizationPanelProps = {
  organizations: OrganizationSummary[];
  selectedCompanyId: string | null;
  selectedOrgId: string | null;
  basePath: "/admin" | "/organizacao";
  manageAccess?: boolean;
};

function companyNamesForGrant(
  grant: OrganizationSummary["grants"][number],
  companies: OrganizationSummary["companies"],
) {
  if (grant.isOwner || grant.allCompanies) {
    return companies.map((c) => c.name);
  }
  return grant.companyIds
    .map((id) => companies.find((c) => c.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

export function OrganizationPanel({
  organizations,
  selectedCompanyId,
  selectedOrgId,
  basePath,
  manageAccess = false,
}: OrganizationPanelProps) {
  const activeOrg =
    organizations.find((org) => org.id === selectedOrgId) ??
    organizations[0] ??
    null;

  if (!activeOrg) {
    return (
      <p className="rounded-2xl border border-border bg-surface px-4 py-6 text-[12px] text-muted">
        Crie uma organização para agrupar empresas e acessos.
      </p>
    );
  }

  const selectedCompany =
    activeOrg.companies.find((c) => c.id === selectedCompanyId) ?? null;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <div>
            <h2 className="text-sm font-medium">Organizações</h2>
            <p className="text-[11.5px] text-muted">
              {organizations.length === 1
                ? "1 organização cadastrada"
                : `${organizations.length} organizações cadastradas`}
            </p>
          </div>
        </div>
        <ul className="space-y-1 p-2">
          {organizations.map((org) => {
            const isSelected = org.id === activeOrg.id;
            const activePlans = org.companies.filter((c) => c.planActive).length;
            return (
              <li key={org.id}>
                <Link
                  href={`${basePath}?org=${org.id}`}
                  className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 transition ${
                    isSelected
                      ? "bg-surface-elevated font-medium text-foreground ring-1 ring-white/10"
                      : "text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {org.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[10.5px] text-muted">
                      {org.companies.length}{" "}
                      {org.companies.length === 1 ? "empresa" : "empresas"} ·{" "}
                      {org.grants.length}{" "}
                      {org.grants.length === 1 ? "usuário" : "usuários"}
                    </p>
                  </div>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      activePlans > 0 ? "bg-positive" : "bg-muted/50"
                    }`}
                    title={
                      activePlans > 0
                        ? `${activePlans} empresa(s) com plano ativo`
                        : "Sem plano ativo"
                    }
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3.5">
          <h2 className="text-sm font-medium">Empresas de {activeOrg.name}</h2>
          <p className="text-[11.5px] text-muted">
            {activeOrg.companies.length === 1
              ? "1 empresa"
              : `${activeOrg.companies.length} empresas`}
          </p>
        </div>
        {activeOrg.companies.length === 0 ? (
          <p className="px-4 py-4 text-[12px] text-muted">
            Adicione a primeira empresa desta organização.
          </p>
        ) : (
          <ul className="space-y-1 p-2">
            {activeOrg.companies.map((company) => {
              const active = company.id === selectedCompanyId;
              return (
                <li key={company.id}>
                  <Link
                    href={`${basePath}?org=${activeOrg.id}&empresa=${company.id}`}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 transition ${
                      active
                        ? "bg-surface-elevated ring-1 ring-white/10"
                        : "hover:bg-surface-elevated/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">
                        {company.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {company.planActive ? "Plano ativo" : "Gratuito"}
                      </p>
                    </div>
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        company.planActive ? "bg-positive" : "bg-muted/50"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {manageAccess && selectedCompany && (
        <AssociateUserToCompanyPanel
          organization={activeOrg}
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
          basePath={basePath}
        />
      )}

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3.5">
          <h2 className="text-sm font-medium">Usuários de {activeOrg.name}</h2>
          <p className="text-[11.5px] text-muted">
            {activeOrg.grants.length === 1
              ? "1 usuário incluído"
              : `${activeOrg.grants.length} usuários incluídos`}
          </p>
        </div>
        {activeOrg.grants.length === 0 ? (
          <p className="px-4 py-4 text-[12px] text-muted">
            Nenhum usuário incluído nesta organização.
          </p>
        ) : (
          <ul>
            {activeOrg.grants.map((grant) => {
              const linkedNames = companyNamesForGrant(
                grant,
                activeOrg.companies,
              );
              return (
                <li
                  key={grant.id}
                  className="flex flex-col gap-2 border-b border-border-subtle px-4 py-3 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-foreground">
                        {grant.userName}
                      </p>
                      <p className="truncate font-mono text-[11px] text-muted-foreground">
                        {grant.email}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {hasElevatedCompanyAccess(grant)
                          ? grant.isOwner
                            ? "Proprietário"
                            : "Proprietário · administrador de empresa"
                          : grant.allCompanies
                            ? "Usuário comum · toda a organização"
                            : `Usuário comum · ${grant.companyIds.length} empresa(s)`}
                      </p>
                      {linkedNames.length > 0 && !grant.allCompanies && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {linkedNames.map((name) => (
                            <span
                              key={`${grant.id}-${name}`}
                              className="rounded-md border border-border-subtle bg-background/70 px-2 py-0.5 text-[10.5px] text-muted-foreground"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <GrantAccessActions
                      grant={grant}
                      organization={activeOrg}
                      basePath={basePath}
                      selectedCompanyId={selectedCompanyId}
                      manageAccess={manageAccess}
                      blockRemoveOnOrganizacaoOwner={
                        basePath === "/organizacao"
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
