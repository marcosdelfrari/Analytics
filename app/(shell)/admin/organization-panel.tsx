import Link from "next/link";
import { removeAccessGrant as removeAccessGrantAdmin } from "@/app/(shell)/admin/actions";
import { removeAccessGrant as removeAccessGrantOwner } from "@/app/(shell)/organizacao/actions";
import type { OrganizationSummary } from "@/lib/organizations-store";

type OrganizationPanelProps = {
  organizations: OrganizationSummary[];
  selectedCompanyId: string | null;
  selectedOrgId: string | null;
  basePath: "/admin" | "/organizacao";
  manageAccess?: boolean;
};

export function OrganizationPanel({
  organizations,
  selectedCompanyId,
  selectedOrgId,
  basePath,
  manageAccess = false,
}: OrganizationPanelProps) {
  const removeAccessGrant =
    basePath === "/organizacao" ? removeAccessGrantOwner : removeAccessGrantAdmin;
  const activeOrg =
    organizations.find((org) => org.id === selectedOrgId) ?? organizations[0] ?? null;

  if (!activeOrg) {
    return (
      <p className="border border-border bg-surface px-4 py-6 text-[12px] text-muted">
        Crie uma organização para agrupar empresas e acessos.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <section className="border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">{activeOrg.name}</h2>
          <p className="text-[12px] text-muted">Organização</p>
        </div>
        <div className="flex flex-wrap gap-1 border-b border-border px-2 py-2">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`${basePath}?org=${org.id}`}
              className={`px-2 py-1 text-[11px] ${
                org.id === activeOrg.id
                  ? "bg-surface-elevated font-medium"
                  : "text-muted-foreground hover:bg-surface-elevated"
              }`}
            >
              {org.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Empresas</h2>
          <p className="text-[12px] text-muted">
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
          <ul>
            {activeOrg.companies.map((company) => {
              const active = company.id === selectedCompanyId;
              return (
                <li
                  key={company.id}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <Link
                    href={`${basePath}?org=${activeOrg.id}&empresa=${company.id}`}
                    className={`block px-4 py-3 ${
                      active ? "bg-surface-elevated" : "hover:bg-surface-elevated"
                    }`}
                  >
                    <p className="text-sm font-medium">{company.name}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {company.planActive ? "Plano ativo" : "Gratuito"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Acessos por e-mail</h2>
          <p className="text-[12px] text-muted">
            Conta Google com visão da organização ou de empresas escolhidas
          </p>
        </div>
        {activeOrg.grants.length === 0 ? (
          <p className="px-4 py-4 text-[12px] text-muted">
            Nenhum e-mail cadastrado nesta organização.
          </p>
        ) : (
          <ul>
            {activeOrg.grants.map((grant) => (
              <li
                key={grant.id}
                className="flex items-start justify-between gap-2 border-b border-border-subtle px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px]">{grant.email}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {grant.isOwner
                      ? "Proprietário"
                      : grant.allCompanies
                        ? "Usuário · toda a organização"
                        : `Usuário · ${grant.companyIds.length} empresa(s)`}
                  </p>
                </div>
                {manageAccess &&
                  !(basePath === "/organizacao" && grant.isOwner) && (
                    <form action={removeAccessGrant}>
                      <input type="hidden" name="grantId" value={grant.id} />
                      <input type="hidden" name="org" value={activeOrg.id} />
                      <button
                        type="submit"
                        className="shrink-0 border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-elevated"
                      >
                        Remover
                      </button>
                    </form>
                  )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
