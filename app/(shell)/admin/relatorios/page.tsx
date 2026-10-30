import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { removeReport, setClientPlan } from "@/app/(shell)/admin/actions";
import { PublishForm } from "@/app/(shell)/admin/publish-form";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { formatCurrency, formatNumber } from "@/lib/format";
import { listOrganizations } from "@/lib/organizations-store";
import { requireAdmin } from "@/lib/require-admin";
import { listReports } from "@/lib/reports-store";
import { platformLabel } from "@/lib/types";

async function AdminReportsContent({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; empresa?: string }>;
}) {
  await connection();
  await requireAdmin();

  const { org, empresa } = await searchParams;
  const organizations = await listOrganizations();
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
      title="Publicações de relatórios"
      subtitle="Envio de períodos de mídia paga e histórico publicado por empresa"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Operação de dados
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Publicar resultados no dashboard do cliente
            </h2>
          </div>

          <Link
            href={
              activeOrg
                ? `/admin?org=${activeOrg.id}${selected ? `&empresa=${selected.id}` : ""}`
                : "/admin"
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-muted-foreground transition hover:border-white/25 hover:text-foreground"
          >
            <span aria-hidden>←</span>
            <span>Voltar para Plataforma</span>
          </Link>
        </div>

        {/* Seletor de Organização e Empresa */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              1. Escolha a organização
            </p>
            {organizations.length === 0 ? (
              <p className="mt-2 text-[12px] text-muted">
                Nenhuma organização cadastrada.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {organizations.map((item) => {
                  const isActive = item.id === activeOrg?.id;
                  return (
                    <Link
                      key={item.id}
                      href={`/admin/relatorios?org=${item.id}`}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px] transition ${
                        isActive
                          ? "border-white/20 bg-surface-elevated font-medium text-foreground"
                          : "border-border-subtle bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="font-mono text-[10.5px] text-muted">
                        ({item.companies.length})
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              2. Escolha a empresa
            </p>
            {!activeOrg || activeOrg.companies.length === 0 ? (
              <p className="mt-2 text-[12px] text-muted">
                Nenhuma empresa nesta organização.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeOrg.companies.map((company) => {
                  const isActive = company.id === selected?.id;
                  return (
                    <Link
                      key={company.id}
                      href={`/admin/relatorios?org=${activeOrg.id}&empresa=${company.id}`}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[12.5px] transition ${
                        isActive
                          ? "border-white/20 bg-surface-elevated font-medium text-foreground"
                          : "border-border-subtle bg-background/60 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          company.planActive ? "bg-positive" : "bg-muted/60"
                        }`}
                      />
                      <span>{company.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {!selected ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-10">
            <h3 className="text-base font-medium text-foreground">
              Selecione ou cadastre uma empresa
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre uma organização e empresa na tela{" "}
              <Link href="/admin" className="text-foreground underline">
                Plataforma
              </Link>{" "}
              para publicar relatórios.
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selected.planActive ? "bg-positive" : "bg-muted"
                    }`}
                  />
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                    {selected.organizationName} ·{" "}
                    {selected.planActive ? "Plano ativo" : "Plano gratuito"}
                  </p>
                </div>
                <h3 className="mt-1 text-base font-semibold text-foreground">
                  Empresa selecionada: {selected.name}
                </h3>
              </div>

              <form action={setClientPlan}>
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="org" value={activeOrg?.id ?? ""} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/admin/relatorios?org=${activeOrg?.id ?? ""}&empresa=${selected.id}`}
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
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <PublishForm
                key={selected.id}
                clientId={selected.id}
                orgId={activeOrg?.id ?? ""}
              />

              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-sm font-medium">
                    Períodos publicados ({selected.name})
                  </h3>
                  <p className="text-[12px] text-muted">
                    Histórico de relatórios enviados para o dashboard desta
                    empresa
                  </p>
                </div>
                {reports.length === 0 ? (
                  <p className="px-6 py-6 text-[12px] text-muted">
                    Nada publicado para esta empresa.
                  </p>
                ) : (
                  <ul>
                    {reports.map((report) => (
                      <li
                        key={report.id}
                        className="flex flex-col gap-3 border-b border-border-subtle px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
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
                          <input
                            type="hidden"
                            name="clientId"
                            value={selected.id}
                          />
                          <input
                            type="hidden"
                            name="org"
                            value={activeOrg?.id ?? ""}
                          />
                          <button
                            type="submit"
                            className="cursor-pointer rounded-xl border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
                          >
                            Remover
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShellMain>
  );
}

export default function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; empresa?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminReportsContent searchParams={searchParams} />
    </Suspense>
  );
}
