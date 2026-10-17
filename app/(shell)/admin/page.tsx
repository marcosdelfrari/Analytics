import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { removeClient, removeReport, setClientPlan } from "@/app/(shell)/admin/actions";
import { CreateClientForm } from "@/app/(shell)/admin/create-client-form";
import { PublishForm } from "@/app/(shell)/admin/publish-form";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { formatCurrency, formatNumber } from "@/lib/format";
import { listReports } from "@/lib/reports-store";
import { platformLabel } from "@/lib/types";
import { listClients } from "@/lib/users-store";

async function AdminPageContent({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (authEnabled && (!session || session.role !== "admin")) redirect("/login");

  const { cliente } = await searchParams;
  const clients = await listClients();
  const selected = clients.find((client) => client.id === cliente) ?? null;
  const reports = selected ? await listReports(selected.id) : [];

  return (
    <AppShellMain
      title={session?.name ?? "Agência"}
      subtitle="Controle dos dashboards"
    >
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <CreateClientForm />
          <section className="border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium">Clientes</h2>
              <p className="text-[12px] text-muted">
                {clients.length === 1 ? "1 acesso" : `${clients.length} acessos`}
              </p>
            </div>
            {clients.length === 0 ? (
              <p className="px-4 py-6 text-[12px] text-muted">
                Crie o primeiro cliente para publicar um dashboard.
              </p>
            ) : (
              <ul>
                {clients.map((client) => {
                  const active = client.id === selected?.id;
                  return (
                    <li
                      key={client.id}
                      className="border-b border-border-subtle last:border-b-0"
                    >
                      <Link
                        href={`/admin?cliente=${client.id}`}
                        className={`block px-4 py-3 ${
                          active ? "bg-surface-elevated" : "hover:bg-surface-elevated"
                        }`}
                      >
                        <p className="text-sm font-medium">{client.name}</p>
                        <p className="font-mono text-[11px] text-muted">
                          {client.email}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {client.planActive ? "Plano ativo" : "Gratuito"}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          {!selected ? (
            <section className="border border-border bg-surface px-6 py-10">
              <h2 className="text-lg font-medium tracking-tight">
                Selecione um cliente
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                O dashboard de cada conta mostra o último período publicado de
                Google Ads e de Meta Ads.
              </p>
            </section>
          ) : (
            <>
              <section className="flex items-start justify-between gap-4 border border-border bg-surface px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">
                    Dashboard de
                  </p>
                  <h2 className="mt-1 text-sm font-medium">{selected.name}</h2>
                  <p className="font-mono text-[11px] text-muted">{selected.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={setClientPlan}>
                    <input type="hidden" name="id" value={selected.id} />
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
                    <button
                      type="submit"
                      className="border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                    >
                      Remover acesso
                    </button>
                  </form>
                </div>
              </section>
              <PublishForm key={selected.id} clientId={selected.id} />
              <section className="border border-border bg-surface">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-medium">Períodos publicados</h2>
                </div>
                {reports.length === 0 ? (
                  <p className="px-4 py-6 text-[12px] text-muted">
                    Nada publicado para este cliente.
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
  searchParams: Promise<{ cliente?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminPageContent searchParams={searchParams} />
    </Suspense>
  );
}
