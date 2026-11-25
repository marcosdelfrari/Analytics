import Link from "next/link";
import { EvolutionChart } from "@/app/components/evolution-chart";
import { MetricCard } from "@/app/components/metric-card";
import { PlatformCard } from "@/app/components/platform-card";
import { TrackingReportPanel } from "@/app/components/tracking-report-panel";
import type { DashboardData } from "@/lib/analytics";
import type { SiteTrackingAnalytics } from "@/lib/tracking-analytics-shared";
import type { EvolutionPoint } from "@/lib/types";
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatNumber,
  formatPercent,
} from "@/lib/format";

export function DashboardHome({
  dashboard,
  evolution,
  siteTracking,
  showSetupLink = true,
}: {
  dashboard: DashboardData;
  evolution: EvolutionPoint[];
  siteTracking: SiteTrackingAnalytics | null;
  showSetupLink?: boolean;
}) {
  const hasPublishedMedia = dashboard.summaries.length > 0;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Mídia paga
            </h2>
            {hasPublishedMedia ? (
              <span className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {dashboard.period}
              </span>
            ) : (
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                Sem publicação
              </span>
            )}
          </div>
          <Link
            href="/relatorios"
            className="text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
          >
            Relatórios detalhados →
          </Link>
        </div>

        {hasPublishedMedia ? (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard
                compact
                label="Investimento"
                value={formatCurrency(dashboard.totals.spend)}
                icon="spend"
              />
              <MetricCard
                compact
                label="Conversões (ads)"
                value={formatNumber(dashboard.totals.conversions)}
                tone="positive"
                icon="conversion"
              />
              <MetricCard
                compact
                label="CTR médio"
                value={formatPercent(dashboard.totals.ctr, 2)}
                tone="accent"
                icon="ctr"
              />
              <MetricCard
                compact
                label="Custo / conv."
                value={formatCurrencyDetailed(dashboard.totals.costPerConversion)}
                icon="cost"
              />
            </div>

            <div className="space-y-4 pt-1">
              <div className="grid gap-3 lg:grid-cols-2">
                {dashboard.summaries.map((summary) => (
                  <PlatformCard key={summary.platform} summary={summary} />
                ))}
              </div>
              <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
                <EvolutionChart points={evolution} />
              </div>
            </div>
          </>
        ) : (
          <p className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-[12px] leading-relaxed text-muted-foreground">
            Investimento e CPA aparecem aqui quando houver relatório de Google ou
            Meta publicado no painel. Enquanto isso, acompanhe visitas e conversões
            do site abaixo.
          </p>
        )}
      </section>

      {siteTracking ? (
        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <TrackingReportPanel
            tracking={siteTracking}
            variant="overview"
            showSetupLink={showSetupLink}
          />
        </section>
      ) : null}
    </div>
  );
}