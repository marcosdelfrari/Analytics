import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { AppShell } from "@/app/components/app-shell";
import { MetricCard } from "@/app/components/metric-card";
import { PlatformCard } from "@/app/components/platform-card";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { getDashboard } from "@/lib/dashboard";
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { platformLabel } from "@/lib/types";
import { listClients } from "@/lib/users-store";

function Loading() {
  return (
    <AppShell mode="client" title="Dashboard" subtitle="Carregando período">
      <div className="border border-border bg-surface px-6 py-10 text-sm text-muted">
        Carregando dashboard
      </div>
    </AppShell>
  );
}

async function Overview() {
  await connection();
  const session = await getSession();
  if (authEnabled) {
    if (!session) redirect("/login");
    if (session.role === "admin") redirect("/admin");
  }

  const clientId =
    session?.role === "client"
      ? session.userId
      : (await listClients())[0]?.id;
  const dashboard = clientId
    ? await getDashboard(clientId)
    : {
        reports: [],
        summaries: [],
        period: "Nenhum período publicado",
        totals: {
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          costPerConversion: 0,
        },
      };
  const title = session?.role === "client" ? session.name : "Dashboard";

  return (
    <AppShell mode="client" title={title} subtitle={dashboard.period}>
      {dashboard.summaries.length === 0 ? (
        <section className="border border-border bg-surface px-6 py-10">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            Dashboard
          </p>
          <h2 className="mt-2 text-lg font-medium tracking-tight">
            Nenhum período publicado
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Quando a equipe publicar Google Ads ou Meta Ads, os números aparecem
            aqui.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Investimento total"
              value={formatCurrency(dashboard.totals.spend)}
              hint="Último envio de cada plataforma"
            />
            <MetricCard
              label="Conversões"
              value={formatNumber(dashboard.totals.conversions)}
            />
            <MetricCard
              label="CTR médio"
              value={formatPercent(dashboard.totals.ctr, 2)}
            />
            <MetricCard
              label="Custo por conversão"
              value={formatCurrencyDetailed(dashboard.totals.costPerConversion)}
            />
          </section>
          <section className="mt-6 grid gap-3 lg:grid-cols-2">
            {dashboard.summaries.map((summary) => (
              <PlatformCard key={summary.platform} summary={summary} />
            ))}
          </section>
          <section className="mt-6 border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium">Histórico</h2>
            </div>
            <ul>
              {dashboard.reports.map((report) => (
                <li
                  key={report.id}
                  className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0"
                >
                  <div>
                    <p className="text-sm">{report.period}</p>
                    <p className="font-mono text-[11px] uppercase text-muted">
                      {platformLabel(report.platform)}
                      {report.notes ? ` · ${report.notes}` : ""}
                    </p>
                  </div>
                  {report.storedFile && (
                    <Link
                      href={`/relatorios/arquivo/${report.id}`}
                      className="border border-border px-2.5 py-1.5 text-[12px] hover:bg-surface-elevated"
                    >
                      Baixar
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Overview />
    </Suspense>
  );
}
