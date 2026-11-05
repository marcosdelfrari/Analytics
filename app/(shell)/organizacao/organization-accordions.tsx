"use client";

import { useState } from "react";
import {
  removeAccessGrant,
  toggleUserAllCompaniesAccess,
  toggleUserCompanyAccess,
} from "@/app/(shell)/organizacao/actions";
import {
  AssociateUserToCompanyPanel,
  CompanyAccessRoleSelect,
} from "@/app/(shell)/organizacao/grant-access-actions";
import {
  IncludeCompanyInlineForm,
  IncludeUserInlineForm,
} from "@/app/(shell)/organizacao/org-forms";
import { UserConfigModal } from "@/app/(shell)/organizacao/user-config-modal";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import {
  ORG_OWNER_SCOPE_LABEL,
  ORG_PROPRIETARIO_LABEL,
} from "@/lib/access-roles";
import { hasProprietarioAccess, COMPANY_ACCESS_ROLE_LABELS } from "@/lib/company-access-role";
import type {
  AccessGrantSummary,
  CompanyAccount,
  OrganizationSummary,
} from "@/lib/organizations-store";

function usersForCompany(
  company: CompanyAccount,
  grants: AccessGrantSummary[],
) {
  return grants.filter(
    (grant) =>
      grant.isOrgProprietario ||
      grant.allCompanies ||
      grant.companyIds.includes(company.id),
  );
}

function roleLabelForUserAtCompany(
  grant: AccessGrantSummary,
  companyId: string,
): string {
  if (grant.isOrgProprietario) return ORG_PROPRIETARIO_LABEL;
  if (grant.allCompanies) return COMPANY_ACCESS_ROLE_LABELS.analista;
  return (
    COMPANY_ACCESS_ROLE_LABELS[grant.companyRoles[companyId] ?? "analista"] ??
    COMPANY_ACCESS_ROLE_LABELS.analista
  );
}

function scopeLabelForGrant(grant: AccessGrantSummary, companiesCount: number) {
  if (grant.isOrgProprietario) return ORG_OWNER_SCOPE_LABEL;
  if (hasProprietarioAccess(grant)) {
    return ORG_PROPRIETARIO_LABEL;
  }
  if (grant.allCompanies) return "Todas as empresas";
  return `Por empresa (${grant.companyIds.length}/${companiesCount})`;
}

function getInitials(name: string, email: string): string {
  const source = (name || email).trim();
  return (
    source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function OrganizationAccordions({
  organization,
  isAdmin,
}: {
  organization: OrganizationSummary;
  isAdmin: boolean;
}) {
  const canManageAllCompanies =
    isAdmin || organization.viewerIsOrgProprietario !== false;
  const [userSearch, setUserSearch] = useState("");
  const [editingGrantId, setEditingGrantId] = useState<string | null>(null);
  const [editingGrantInitialTab, setEditingGrantInitialTab] = useState<
    "access" | "password"
  >("access");
  const [removingGrantId, setRemovingGrantId] = useState<string | null>(null);

  const activeEditingGrant = editingGrantId
    ? (organization.grants.find((g) => g.id === editingGrantId) ?? null)
    : null;
  const removingGrant = removingGrantId
    ? (organization.grants.find((g) => g.id === removingGrantId) ?? null)
    : null;

  const filteredGrants = organization.grants.filter((grant) => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      grant.userName.toLowerCase().includes(query) ||
      grant.email.toLowerCase().includes(query)
    );
  });

  const activePlanCount = organization.companies.filter(
    (c) => c.planActive,
  ).length;
  const ownersCount = organization.grants.filter((g) => g.isOrgProprietario).length;
  const withPasswordCount = organization.grants.filter(
    (g) => g.hasPassword,
  ).length;

  const openConfigForGrant = (
    grant: AccessGrantSummary,
    tab: "access" | "password" = "access",
  ) => {
    setEditingGrantInitialTab(tab);
    setEditingGrantId(grant.id);
  };

  return (
    <>
      {/* Empresas — accordion */}
      <details className="group overflow-hidden rounded-2xl border border-border bg-surface">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4 transition hover:bg-surface-elevated/40 marker:content-none [&::-webkit-details-marker]:hidden">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden
              className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-background/60 text-[11px] text-muted-foreground transition group-open:rotate-90"
            >
              ›
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Empresas de {organization.name}
              </h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {organization.companies.length === 1
                  ? "1 empresa registrada nesta organização"
                  : `${organization.companies.length} empresas registradas nesta organização`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-positive/30 bg-positive/10 px-2.5 py-1 font-mono text-[11px] text-positive">
              {activePlanCount}/{organization.companies.length} com plano ativo
            </span>
            <span className="rounded-lg border border-border-subtle bg-background/60 px-3 py-1 font-mono text-[11.5px] text-muted-foreground">
              {organization.companies.length}{" "}
              {organization.companies.length === 1 ? "empresa" : "empresas"}
            </span>
          </div>
        </summary>

        {canManageAllCompanies && (
          <div className="border-b border-border bg-background/35 px-6 py-3.5">
            <IncludeCompanyInlineForm
              organizationId={organization.id}
              basePath="/organizacao"
            />
          </div>
        )}

        {organization.companies.length === 0 ? (
          <p className="px-6 py-8 text-[13px] text-muted">
            Nenhuma empresa incluída nesta organização ainda. Use o campo acima
            para incluir a primeira empresa.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-background/40 font-mono text-[10.5px] uppercase tracking-wider text-muted">
                  <th className="px-6 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Plano</th>
                  <th className="px-6 py-3 font-medium">
                    Usuários com acesso (clique no usuário para editar)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-[13px]">
                {organization.companies.map((company) => {
                  const companyUsers = usersForCompany(
                    company,
                    organization.grants,
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
                              company.planActive ? "bg-positive" : "bg-muted"
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
                              <button
                                key={`${company.id}-${u.id}`}
                                type="button"
                                onClick={() => openConfigForGrant(u, "access")}
                                title="Clique para configurar acessos e senha deste usuário"
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle bg-background/60 px-2.5 py-1 text-[11.5px] transition hover:border-white/25 hover:bg-surface-elevated"
                              >
                                <span className="font-medium text-foreground">
                                  {u.userName}
                                </span>
                                <span className="font-mono text-[10.5px] text-muted-foreground">
                                  {u.email}
                                </span>
                                <span className="rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[9.5px] text-muted-foreground">
                                  {roleLabelForUserAtCompany(u, company.id)}
                                </span>
                              </button>
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

        {organization.companies.some((company) =>
          organization.grants.some(
            (g) =>
              !g.isOrgProprietario &&
              !g.allCompanies &&
              !g.companyIds.includes(company.id),
          ),
        ) && (
          <div className="space-y-2.5 border-t border-border bg-background/20 px-6 py-4">
            {organization.companies.map((company) => (
              <AssociateUserToCompanyPanel
                key={`assoc-${company.id}`}
                organization={organization}
                companyId={company.id}
                companyName={company.name}
                basePath="/organizacao"
              />
            ))}
          </div>
        )}
      </details>

      {/* Usuários da organização — accordion melhorado */}
      <details
        open
        className="group overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 transition hover:bg-surface-elevated/40 marker:content-none [&::-webkit-details-marker]:hidden">
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
                Inclua usuários, defina empresas e papéis ou dê duplo clique na
                linha para redefinir senha e permissões.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-border-subtle bg-background/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              {ownersCount}{" "}
              {ownersCount === 1 ? "proprietário" : "proprietários"}
            </span>
            <span className="rounded-lg border border-border-subtle bg-background/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              {withPasswordCount}/{organization.grants.length} com senha
            </span>
            <span className="rounded-lg border border-white/15 bg-surface-elevated px-3 py-1 font-mono text-[11.5px] font-medium text-foreground">
              {organization.grants.length}{" "}
              {organization.grants.length === 1 ? "usuário" : "usuários"}
            </span>
          </div>
        </summary>

        <IncludeUserInlineForm
          organization={organization}
          basePath="/organizacao"
          allowOwnerRole={isAdmin}
          allowAllCompanies={canManageAllCompanies}
        />

        {organization.grants.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-background/25 px-6 py-3">
            <div className="relative w-full sm:w-72">
              <input
                type="search"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Filtrar por nome ou e-mail..."
                className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-1.5 text-[12.5px] text-foreground outline-none transition focus:border-white/25"
              />
            </div>
            <p className="text-[11.5px] text-muted">
              Dica: dê <strong>duplo clique</strong> em qualquer usuário ou use
              o botão <strong>Configurar</strong> para editar empresas, papel e
              redefinir senha.
            </p>
          </div>
        )}

        {organization.grants.length === 0 ? (
          <p className="px-6 py-8 text-[13px] text-muted">
            Nenhum usuário incluído nesta organização.
          </p>
        ) : filteredGrants.length === 0 ? (
          <p className="px-6 py-8 text-[13px] text-muted">
            Nenhum usuário corresponde ao filtro &ldquo;{userSearch}&rdquo;.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-background/40 font-mono text-[10.5px] uppercase tracking-wider text-muted">
                  <th className="px-6 py-3 font-medium">Usuário e Credencial</th>
                  <th className="px-4 py-3 font-medium">Escopo / Papel</th>
                  <th className="px-4 py-3 font-medium">
                    Empresas com acesso e papel
                  </th>
                  <th className="px-6 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-[13px]">
                {filteredGrants.map((grant) => {
                  const canRemove = isAdmin || !grant.isOrgProprietario;
                  const initials = getInitials(grant.userName, grant.email);

                  return (
                    <tr
                      key={grant.id}
                      onDoubleClick={() => openConfigForGrant(grant, "access")}
                      title="Duplo clique para abrir configurações completas e redefinir senha"
                      className="group/row transition-colors hover:bg-background/30"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-surface-elevated font-mono text-xs font-semibold text-foreground">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-foreground">
                                {grant.userName}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  openConfigForGrant(grant, "password")
                                }
                                className={`cursor-pointer rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] transition ${
                                  grant.hasPassword
                                    ? "border-positive/30 bg-positive/10 text-positive hover:bg-positive/20"
                                    : "border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                                }`}
                                title="Clique para definir ou alterar a senha deste usuário"
                              >
                                {grant.hasPassword
                                  ? "Senha ativa"
                                  : "Definir senha"}
                              </button>
                            </div>
                            <p className="mt-0.5 font-mono text-[11.5px] text-muted-foreground">
                              {grant.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                            hasProprietarioAccess(grant)
                              ? "border-positive/30 bg-positive/10 text-positive"
                              : grant.allCompanies
                                ? "border-foreground/25 bg-surface-elevated text-foreground"
                                : "border-border-subtle bg-background/60 text-muted-foreground"
                          }`}
                        >
                          {scopeLabelForGrant(
                            grant,
                            organization.companies.length,
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {grant.isOrgProprietario ? (
                          <span className="text-[12px] text-muted-foreground">
                            Acesso total de administrador em todas as empresas
                          </span>
                        ) : organization.companies.length === 0 ? (
                          <span className="text-[12px] text-muted">
                            Nenhuma empresa cadastrada
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {organization.companies.length > 1 && (
                              <form action={toggleUserAllCompaniesAccess}>
                                <input
                                  type="hidden"
                                  name="organizationId"
                                  value={organization.id}
                                />
                                <input
                                  type="hidden"
                                  name="grantId"
                                  value={grant.id}
                                />
                                <input
                                  type="hidden"
                                  name="allCompanies"
                                  value={grant.allCompanies ? "false" : "true"}
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

                            {organization.companies.map((company) => {
                              const hasCompany =
                                grant.allCompanies ||
                                grant.companyIds.includes(company.id);
                              const linkedRole =
                                grant.companyRoles[company.id] ?? "analyst";
                              return (
                                <div
                                  key={`${grant.id}-${company.id}`}
                                  className={`inline-flex flex-wrap items-center gap-1 rounded-xl border p-0.5 transition ${
                                    hasCompany
                                      ? "border-positive/35 bg-positive/10"
                                      : "border-dashed border-border bg-background/40"
                                  }`}
                                >
                                  <form action={toggleUserCompanyAccess}>
                                    <input
                                      type="hidden"
                                      name="organizationId"
                                      value={organization.id}
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
                                      className={`cursor-pointer rounded-lg px-2 py-0.5 text-[11.5px] transition ${
                                        hasCompany
                                          ? "font-medium text-positive hover:bg-positive/15"
                                          : "text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      {hasCompany
                                        ? `✓ ${company.name}`
                                        : `+ ${company.name}`}
                                    </button>
                                  </form>
                                  {hasCompany &&
                                    !grant.isOrgProprietario &&
                                    !grant.allCompanies && (
                                      <CompanyAccessRoleSelect
                                        organizationId={organization.id}
                                        grantId={grant.id}
                                        companyId={company.id}
                                        value={linkedRole}
                                      />
                                    )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openConfigForGrant(grant, "access")}
                            className="cursor-pointer rounded-lg border border-white/15 bg-surface-elevated px-2.5 py-1 text-[11.5px] font-medium text-foreground transition hover:border-white/30"
                          >
                            Configurar
                          </button>

                          {canRemove ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setRemovingGrantId(grant.id)}
                                className="cursor-pointer rounded-lg border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition hover:border-negative/40 hover:bg-negative/10 hover:text-negative"
                              >
                                Remover
                              </button>
                              <form
                                id={`remove-grant-${grant.id}`}
                                action={removeAccessGrant}
                                className="hidden"
                              >
                                <input
                                  type="hidden"
                                  name="grantId"
                                  value={grant.id}
                                />
                                <input
                                  type="hidden"
                                  name="org"
                                  value={organization.id}
                                />
                                <input
                                  type="hidden"
                                  name="basePath"
                                  value="/organizacao"
                                />
                              </form>
                            </>
                          ) : (
                            <span className="px-1.5 font-mono text-[10.5px] text-muted">
                              {ORG_PROPRIETARIO_LABEL}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </details>

      {activeEditingGrant && (
        <UserConfigModalWithInitialTab
          grant={activeEditingGrant}
          organization={organization}
          allowOwnerRole={isAdmin}
          initialTab={editingGrantInitialTab}
          onClose={() => setEditingGrantId(null)}
        />
      )}

      {removingGrant && (
        <ConfirmDialog
          open
          tone="danger"
          title={`Remover ${removingGrant.userName}?`}
          description={`Isso remove o acesso de ${removingGrant.email} em ${organization.name}. A conta na plataforma não é apagada por esta ação.`}
          confirmLabel="Sim, remover"
          cancelLabel="Cancelar"
          onCancel={() => setRemovingGrantId(null)}
          onConfirm={() => {
            const form = document.getElementById(
              `remove-grant-${removingGrant.id}`,
            ) as HTMLFormElement | null;
            setRemovingGrantId(null);
            form?.requestSubmit();
          }}
        />
      )}
    </>
  );
}

function UserConfigModalWithInitialTab({
  grant,
  organization,
  allowOwnerRole,
  initialTab,
  onClose,
}: {
  grant: AccessGrantSummary;
  organization: OrganizationSummary;
  allowOwnerRole: boolean;
  initialTab: "access" | "password";
  onClose: () => void;
}) {
  return (
    <UserConfigModal
      grant={grant}
      organization={organization}
      allowOwnerRole={allowOwnerRole}
      initialTab={initialTab}
      onClose={onClose}
    />
  );
}
