import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { removeClient, setClientPlan } from "@/app/(shell)/admin/actions";
import { CreateClientForm } from "@/app/(shell)/admin/create-client-form";
import { CreateOrganizationForm } from "@/app/(shell)/admin/org-forms";
import { OrganizationPanel } from "@/app/(shell)/admin/organization-panel";
import {
  AddAccessGrantForm,
  AddCompanyForm,
} from "@/app/(shell)/organizacao/org-forms";
import { OrganizationFlowPanel } from "@/app/(shell)/organizacao/organization-flow-panel";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { listOrganizations } from "@/lib/organizations-store";
import { requireAdmin } from "@/lib/require-admin";
import { listAccountsForDirectory } from "@/lib/users-store";

async function AdminPageContent({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; empresa?: string }>;
}) {
  await connection();
  await requireAdmin();

  const { org, empresa } = await searchParams;
  const [organizations, users] = await Promise.all([
    listOrganizations(),
    listAccountsForDirectory(),
  ]);
  const selectedOrgId = org ?? organizations[0]?.id ?? null;
  const activeOrg =
    organizations.find((item) => item.id === selectedOrgId) ??
    organizations[0] ??
    null;
  const selected =
    activeOrg?.companies.find((company) => company.id === empresa) ??
    activeOrg?.companies[0] ??
    null;

  const totalCompanies = organizations.reduce(
    (sum, item) => sum + item.companies.length,
    0,
  );
  const activePlanCompanies = organizations.reduce(
    (sum, item) => sum + item.companies.filter((c) => c.planActive).length,
    0,
  );

  return (
    <AppShellMain
      title="Plataforma"
      subtitle="Organizações e empresas"
    >
      <div className="space-y-6">
        {/* Resumo da Plataforma + Atalhos para as Páginas Dedicadas */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              Organizações e empresas
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {organizations.length}
              <span className="text-sm font-normal text-muted">
                {" "}
                · {totalCompanies}{" "}
                {totalCompanies === 1 ? "empresa" : "empresas"}
              </span>
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Estruturas ativas na plataforma
            </p>
          </div>

          <Link
            href="/admin/usuarios"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 transition hover:border-white/25"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                Usuários cadastrados
              </p>
              <span className="text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground">
                Diretório →
              </span>
            </div>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {users.length}
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Contas, papéis e pertencimento
            </p>
          </Link>

          <Link
            href={
              activeOrg
                ? `/admin/relatorios?org=${activeOrg.id}${selected ? `&empresa=${selected.id}` : ""}`
                : "/admin/relatorios"
            }
            className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 transition hover:border-white/25"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                Publicações de mídia
              </p>
              <span className="text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground">
                Publicar →
              </span>
            </div>
            <p className="mt-1.5 truncate text-base font-semibold text-foreground">
              {selected ? selected.name : "Selecionar empresa"}
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Enviar relatórios Google Ads e Meta Ads
            </p>
          </Link>

          <Link
            href="/admin/planos"
            className="group flex flex-col justify-between rounded-2xl border border-positive/25 bg-surface bg-gradient-to-br from-positive/10 via-transparent to-transparent p-4 transition hover:border-positive/45"
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-positive">
                Controle de planos
              </p>
              <span className="text-xs text-positive transition-transform group-hover:translate-x-0.5">
                Licenças →
              </span>
            </div>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {activePlanCompanies}
              <span className="text-sm font-normal text-muted">
                {" "}
                / {totalCompanies}
              </span>
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Empresas com plano ativo
            </p>
          </Link>
        </section>

        {/* Listagem de Organizações + Fluxo BPMN + Ações da Empresa Selecionada */}
        <section className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
          <div className="space-y-3">
            <OrganizationPanel
              basePath="/admin"
              organizations={organizations}
              selectedOrgId={activeOrg?.id ?? null}
              selectedCompanyId={selected?.id ?? null}
              manageAccess
            />
            <CreateOrganizationForm />
            <CreateClientForm />
            {activeOrg && (
              <>
                <AddCompanyForm
                  organizationId={activeOrg.id}
                  basePath="/admin"
                />
                <AddAccessGrantForm
                  organization={activeOrg}
                  basePath="/admin"
                  allowOwnerRole
                />
              </>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            {activeOrg ? (
              <OrganizationFlowPanel
                organization={activeOrg}
                allOrganizations={organizations}
                defaultShowAll={!org}
                allowOwnerRole
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface px-6 py-10">
                <h2 className="text-lg font-medium tracking-tight">
                  Nenhuma organização cadastrada
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                  Crie a primeira organização ao lado para visualizar o fluxo
                  BPMN de empresas e usuários.
                </p>
              </div>
            )}

            {selected && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selected.planActive ? "bg-positive" : "bg-muted"
                      }`}
                    />
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                      Empresa ativa na seleção · {selected.organizationName}
                    </p>
                  </div>
                  <h2 className="mt-1 text-sm font-semibold text-foreground">
                    {selected.name}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/relatorios?org=${activeOrg?.id ?? ""}&empresa=${selected.id}`}
                    className="rounded-xl border border-white/15 bg-surface-elevated px-3.5 py-1.5 text-[12px] font-medium text-foreground transition hover:border-white/30"
                  >
                    Publicar relatório →
                  </Link>
                  <form action={setClientPlan}>
                    <input type="hidden" name="id" value={selected.id} />
                    <input
                      type="hidden"
                      name="org"
                      value={activeOrg?.id ?? ""}
                    />
                    <input
                      type="hidden"
                      name="planActive"
                      value={selected.planActive ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`cursor-pointer rounded-xl border px-3.5 py-1.5 text-[12px] font-medium transition ${
                        selected.planActive
                          ? "border-border text-foreground hover:bg-surface-elevated"
                          : "border-positive/35 bg-positive/10 text-positive hover:bg-positive/20"
                      }`}
                    >
                      {selected.planActive ? "Desativar plano" : "Ativar plano"}
                    </button>
                  </form>
                  <form action={removeClient}>
                    <input type="hidden" name="id" value={selected.id} />
                    <input
                      type="hidden"
                      name="org"
                      value={activeOrg?.id ?? ""}
                    />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-xl border border-border px-3.5 py-1.5 text-[12px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
                    >
                      Remover empresa
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShellMain>
  );
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; empresa?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminPageContent searchParams={searchParams} />
    </Suspense>
  );
}
