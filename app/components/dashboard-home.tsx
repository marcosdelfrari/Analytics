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
    <div className="space-y-5">
      <section className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-medium text-foreground">
              Mídia paga
            </h2>
            {hasPublishedMedia ? (
              <span className="font-mono text-[11px] text-muted">
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
            className="text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            Relatórios detalhados →
          </Link>
        </div>

        {hasPublishedMedia ? (
          <>
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <MetricCard
                label="Investimento"
                value={formatCurrency(dashboard.totals.spend)}
              />
              <MetricCard
                label="Conversões (ads)"
                value={formatNumber(dashboard.totals.conversions)}
                tone="positive"
              />
              <MetricCard
                label="CTR médio"
                value={formatPercent(dashboard.totals.ctr, 2)}
              />
              <MetricCard
                label="Custo / conv."
                value={formatCurrencyDetailed(dashboard.totals.costPerConversion)}
              />
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid gap-2.5 lg:grid-cols-2">
                {dashboard.summaries.map((summary) => (
                  <PlatformCard key={summary.platform} summary={summary} />
                ))}
              </div>
              <EvolutionChart points={evolution} />
            </div>
          </>
        ) : (
          <p className="rounded-xl border border-border bg-surface px-3.5 py-3 text-[12px] text-muted-foreground">
            Investimento e CPA aparecem aqui quando houver relatório de Google ou
            Meta publicado no painel. Enquanto isso, acompanhe visitas e conversões
            do site abaixo.
          </p>
        )}
      </section>

      {siteTracking && (
        <section className="border-t border-border-subtle pt-4">
          <TrackingReportPanel
            tracking={siteTracking}
            variant="overview"
            showSetupLink={showSetupLink}
          />
        </section>
      )}
    </div>
  );
}
