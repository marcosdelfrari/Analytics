import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { removeClient, removeReport, setClientPlan } from "@/app/(shell)/admin/actions";
import { CreateClientForm } from "@/app/(shell)/admin/create-client-form";
import { CreateOrganizationForm } from "@/app/(shell)/admin/org-forms";
import { OrganizationPanel } from "@/app/(shell)/admin/organization-panel";
import { PublishForm } from "@/app/(shell)/admin/publish-form";
import { UsersPanel } from "@/app/(shell)/admin/users-panel";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { formatCurrency, formatNumber } from "@/lib/format";
import { listOrganizations } from "@/lib/organizations-store";
import { listReports } from "@/lib/reports-store";
import { listAccounts } from "@/lib/users-store";
import { platformLabel } from "@/lib/types";

async function AdminPageContent({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; empresa?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (authEnabled && (!session || session.role !== "admin")) redirect("/login");

  const { org, empresa } = await searchParams;
  const organizations = await listOrganizations();
  const users = await listAccounts();
  const selectedOrgId = org ?? organizations[0]?.id ?? null;
  const activeOrg =
    organizations.find((item) => item.id === selectedOrgId) ??
    organizations[0] ??
    null;
  const selected =
    activeOrg?.companies.find((company) => company.id === empresa) ??
    activeOrg?.companies[0] ??
    null;
  const reports = selected ? await listReports(selected.id) : [];

  return (
    <AppShellMain
      title="Plataforma"
      subtitle="Usuários, planos e publicação de relatórios"
    >
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <UsersPanel users={users} />
          <CreateOrganizationForm />
          <CreateClientForm />
          <OrganizationPanel
            basePath="/admin"
            organizations={organizations}
            selectedOrgId={activeOrg?.id ?? null}
            selectedCompanyId={selected?.id ?? null}
            manageAccess
          />
        </div>

        <div className="space-y-4">
          {!selected ? (
            <section className="border border-border bg-surface px-6 py-10">
              <h2 className="text-lg font-medium tracking-tight">
                Operação da plataforma
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Você é o administrador: controla cadastros, ativa planos e
                publica relatórios. Proprietários de cada organização gerenciam
                empresas e convites em{" "}
                <span className="text-foreground">Organização</span> no menu deles.
              </p>
            </section>
          ) : (
            <>
              <section className="flex items-start justify-between gap-4 border border-border bg-surface px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">
                    Empresa selecionada
                  </p>
                  <h2 className="mt-1 text-sm font-medium">{selected.name}</h2>
                  <p className="text-[11px] text-muted">{selected.organizationName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={setClientPlan}>
                    <input type="hidden" name="id" value={selected.id} />
                    <input type="hidden" name="org" value={activeOrg?.id ?? ""} />
                    <input
                      type="hidden"
                      name="planActive"
                      value={selected.planActive ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className="border border-border px-2.5 py-1.5 text-[12px] hover:bg-surface-elevated"
                    >
                      {selected.planActive ? "Desativar plano" : "Ativar plano"}
                    </button>
                  </form>
                  <form action={removeClient}>
                    <input type="hidden" name="id" value={selected.id} />
                    <input type="hidden" name="org" value={activeOrg?.id ?? ""} />
                    <button
                      type="submit"
                      className="border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                    >
                      Remover empresa
                    </button>
                  </form>
                </div>
              </section>
              <PublishForm
                key={selected.id}
                clientId={selected.id}
                orgId={activeOrg?.id ?? ""}
              />
              <section className="border border-border bg-surface">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-medium">Períodos publicados</h2>
                </div>
                {reports.length === 0 ? (
                  <p className="px-4 py-6 text-[12px] text-muted">
                    Nada publicado para esta empresa.
                  </p>
                ) : (
                  <ul>
                    {reports.map((report) => (
                      <li
                        key={report.id}
                        className="flex flex-col gap-3 border-b border-border-subtle px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium">{report.period}</p>
                          <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                            <span
                              className={
                                report.platform === "google"
                                  ? "text-google"
                                  : "text-meta"
                              }
                            >
                              {platformLabel(report.platform)}
                            </span>
                            {" · "}
                            {formatCurrency(report.spend)}
                            {" · "}
                            {formatNumber(report.conversions)} conversões
                          </p>
                        </div>
                        <form action={removeReport}>
                          <input type="hidden" name="id" value={report.id} />
                          <input type="hidden" name="clientId" value={selected.id} />
                          <input type="hidden" name="org" value={activeOrg?.id ?? ""} />
                          <button
                            type="submit"
                            className="border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                          >
                            Remover
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
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
