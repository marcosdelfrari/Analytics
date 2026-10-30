import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import {
  removeAccessGrant,
  toggleUserAllCompaniesAccess,
  toggleUserCompanyAccess,
} from "@/app/(shell)/organizacao/actions";
import {
  IncludeCompanyInlineForm,
  IncludeUserInlineForm,
} from "@/app/(shell)/organizacao/org-forms";
import { OrganizationFlowPanel } from "@/app/(shell)/organizacao/organization-flow-panel";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { canAccessOrganizationWorkspace } from "@/lib/organization-access";
import {
  ensureAdminLotusOrganization,
  listOrganizationsForOwner,
  type AccessGrantSummary,
  type CompanyAccount,
} from "@/lib/organizations-store";

function usersForCompany(
  company: CompanyAccount,
  grants: AccessGrantSummary[],
) {
  return grants.filter(
    (grant) =>
      grant.isOwner ||
      grant.allCompanies ||
      grant.companyIds.includes(company.id),
  );
}

async function OrganizacaoPageContent({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; empresa?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (authEnabled) {
    if (!session) redirect("/login");
    if (!canAccessOrganizationWorkspace(session)) {
      redirect("/dashboard");
    }
    if (session.role === "admin") {
      await ensureAdminLotusOrganization();
    }
  }

  const { org } = await searchParams;
  const organizations = session
    ? await listOrganizationsForOwner(session.email)
    : [];
  const selectedOrgId = org ?? organizations[0]?.id ?? null;
  const activeOrg =
    organizations.find((item) => item.id === selectedOrgId) ??
    organizations[0] ??
    null;

  const isAdmin = !authEnabled || session?.role === "admin";

  return (
    <AppShellMain
      title={
        activeOrg
          ? `Empresas e acessos · ${activeOrg.name}`
          : "Empresas e acessos"
      }
      subtitle="Fluxo de pertencimento, empresas cadastradas e usuários da organização"
    >
      {!activeOrg ? (
        <section className="rounded-2xl border border-border bg-surface px-6 py-10">
          <h2 className="text-lg font-medium tracking-tight">
            Nenhuma organização sob sua gestão
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Se você deveria ser proprietário, peça ao administrador da
            plataforma para confirmar seu e-mail como responsável pela
            organização.
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {organizations.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                Organização:
              </span>
              {organizations.map((item) => {
                const selected = item.id === activeOrg.id;
                return (
                  <Link
                    key={item.id}
                    href={`/organizacao?org=${item.id}`}
                    className={`rounded-xl border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                      selected
                        ? "border-foreground/40 bg-surface-elevated text-foreground"
                        : "border-border bg-surface text-muted-foreground hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}

          <OrganizationFlowPanel organization={activeOrg} />

          {/* Empresas — accordion */}
          <details className="group overflow-hidden rounded-2xl border border-border bg-surface">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-background/60 text-[11px] text-muted-foreground transition group-open:rotate-90"
                >
                  ›
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    Empresas de {activeOrg.name}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {activeOrg.companies.length === 1
                      ? "1 empresa registrada nesta organização"
                      : `${activeOrg.companies.length} empresas registradas nesta organização`}
                  </p>
                </div>
              </div>
            </summary>

            <div className="border-b border-border px-6 py-3">
              <IncludeCompanyInlineForm
                organizationId={activeOrg.id}
                basePath="/organizacao"
              />
            </div>

            {activeOrg.companies.length === 0 ? (
              <p className="px-6 py-8 text-[13px] text-muted">
                Nenhuma empresa incluída nesta organização ainda. Use o campo
                acima para incluir a primeira empresa.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border-subtle bg-background/40 font-mono text-[10.5px] uppercase tracking-wider text-muted">
                      <th className="px-6 py-3 font-medium">Empresa</th>
                      <th className="px-4 py-3 font-medium">Plano</th>
                      <th className="px-6 py-3 font-medium">
                        Usuários da organização com acesso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-[13px]">
                    {activeOrg.companies.map((company) => {
                      const companyUsers = usersForCompany(
                        company,
                        activeOrg.grants,
                      );
                      return (
                        <tr
                          key={company.id}
                          className="transition-colors hover:bg-background/25"
                        >
                          <td className="px-6 py-3.5 font-medium text-foreground">
                            {company.name}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] ${
                                company.planActive
                                  ? "border-positive/30 bg-positive/10 text-positive"
                                  : "border-border bg-background/60 text-muted"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  company.planActive
                                    ? "bg-positive"
                                    : "bg-muted"
                                }`}
                              />
                              {company.planActive ? "Plano ativo" : "Gratuito"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            {companyUsers.length === 0 ? (
                              <span className="text-[12px] text-muted">
                                Nenhum usuário vinculado
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {companyUsers.map((u) => (
                                  <span
                                    key={`${company.id}-${u.id}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-background/60 px-2.5 py-1 text-[11.5px]"
                                  >
                                    <span className="font-medium text-foreground">
                                      {u.userName}
                                    </span>
                                    <span className="font-mono text-[10.5px] text-muted-foreground">
                                      ({u.email})
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </details>

          {/* Usuários — accordion */}
          <details className="group overflow-hidden rounded-2xl border border-border bg-surface">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-background/60 text-[11px] text-muted-foreground transition group-open:rotate-90"
                >
                  ›
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    Usuários da organização
                  </h2>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Inclua usuários e defina quais empresas de {activeOrg.name}{" "}
                    cada um pode acessar.
                  </p>
                </div>
              </div>
              <span className="rounded-lg border border-border-subtle bg-background/60 px-3 py-1 font-mono text-[11.5px] text-muted-foreground">
                {activeOrg.grants.length}{" "}
                {activeOrg.grants.length === 1 ? "usuário" : "usuários"}
              </span>
            </summary>

            <IncludeUserInlineForm
              organization={activeOrg}
              basePath="/organizacao"
              allowOwnerRole={isAdmin}
            />

            {activeOrg.grants.length === 0 ? (
              <p className="px-6 py-8 text-[13px] text-muted">
                Nenhum usuário incluído nesta organização.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border-subtle bg-background/40 font-mono text-[10.5px] uppercase tracking-wider text-muted">
                      <th className="px-6 py-3 font-medium">Usuário</th>
                      <th className="px-4 py-3 font-medium">Papel</th>
                      <th className="px-4 py-3 font-medium">
                        Empresas com acesso (clique para incluir ou remover)
                      </th>
                      <th className="px-6 py-3 text-right font-medium">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-[13px]">
                    {activeOrg.grants.map((grant) => {
                      const canRemove = isAdmin || !grant.isOwner;
                      return (
                        <tr
                          key={grant.id}
                          className="transition-colors hover:bg-background/25"
                        >
                          <td className="px-6 py-3.5">
                            <p className="font-medium text-foreground">
                              {grant.userName}
                            </p>
                            <p className="mt-0.5 font-mono text-[11.5px] text-muted-foreground">
                              {grant.email}
                            </p>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex rounded-md border px-2.5 py-0.5 text-[11px] font-medium ${
                                grant.isOwner
                                  ? "border-positive/30 bg-positive/10 text-positive"
                                  : "border-border bg-background/60 text-muted-foreground"
                              }`}
                            >
                              {grant.isOwner ? "Proprietário" : "Usuário comum"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            {grant.isOwner ? (
                              <span className="text-[12px] text-muted-foreground">
                                Acesso total a todas as empresas da organização
                              </span>
                            ) : activeOrg.companies.length === 0 ? (
                              <span className="text-[12px] text-muted">
                                Nenhuma empresa cadastrada
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {activeOrg.companies.length > 1 && (
                                  <form action={toggleUserAllCompaniesAccess}>
                                    <input
                                      type="hidden"
                                      name="organizationId"
                                      value={activeOrg.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="grantId"
                                      value={grant.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="allCompanies"
                                      value={
                                        grant.allCompanies ? "false" : "true"
                                      }
                                    />
                                    <button
                                      type="submit"
                                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11.5px] font-medium transition ${
                                        grant.allCompanies
                                          ? "border-foreground/50 bg-surface-elevated text-foreground"
                                          : "border-border-subtle bg-background/50 text-muted-foreground hover:border-white/25 hover:text-foreground"
                                      }`}
                                    >
                                      {grant.allCompanies
                                        ? "✓ Todas as empresas"
                                        : "Todas as empresas"}
                                    </button>
                                  </form>
                                )}

                                {activeOrg.companies.map((company) => {
                                  const hasCompany =
                                    grant.allCompanies ||
                                    grant.companyIds.includes(company.id);
                                  return (
                                    <form
                                      key={`${grant.id}-${company.id}`}
                                      action={toggleUserCompanyAccess}
                                    >
                                      <input
                                        type="hidden"
                                        name="organizationId"
                                        value={activeOrg.id}
                                      />
                                      <input
                                        type="hidden"
                                        name="grantId"
                                        value={grant.id}
                                      />
                                      <input
                                        type="hidden"
                                        name="companyId"
                                        value={company.id}
                                      />
                                      <button
                                        type="submit"
                                        className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11.5px] transition ${
                                          hasCompany
                                            ? "border-positive/40 bg-positive/10 font-medium text-positive hover:bg-positive/20"
                                            : "border-dashed border-border bg-background/40 text-muted-foreground hover:border-white/25 hover:text-foreground"
                                        }`}
                                      >
                                        {hasCompany
                                          ? `✓ ${company.name}`
                                          : `+ ${company.name}`}
                                      </button>
                                    </form>
                                  );
                                })}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-3.5 text-right">
                            {canRemove ? (
                              <form
                                action={removeAccessGrant}
                                className="inline-block"
                              >
                                <input
                                  type="hidden"
                                  name="grantId"
                                  value={grant.id}
                                />
                                <input
                                  type="hidden"
                                  name="org"
                                  value={activeOrg.id}
                                />
                                <input
                                  type="hidden"
                                  name="basePath"
                                  value="/organizacao"
                                />
                                <button
                                  type="submit"
                                  className="cursor-pointer rounded-lg border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
                                >
                                  Remover
                                </button>
                              </form>
                            ) : (
                              <span className="font-mono text-[11px] text-muted">
                                Proprietário
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </details>
        </div>
      )}
    </AppShellMain>
  );
}

export default function OrganizacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; empresa?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <OrganizacaoPageContent searchParams={searchParams} />
    </Suspense>
  );
}
