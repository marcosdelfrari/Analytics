import { EvolutionChart } from "@/app/components/evolution-chart";
import { MetricCard } from "@/app/components/metric-card";
import { PlatformCard } from "@/app/components/platform-card";
import { TrackingReportPanel } from "@/app/components/tracking-report-panel";
import type { DashboardData } from "@/lib/analytics";
import type { SiteTrackingAnalytics } from "@/lib/tracking-analytics";
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
}: {
  dashboard: DashboardData;
  evolution: EvolutionPoint[];
  siteTracking: SiteTrackingAnalytics | null;
}) {
  if (dashboard.summaries.length === 0) {
    return (
      <div className="space-y-6">
        <section className="border border-border bg-surface px-6 py-10">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            Dashboard
          </p>
          <h2 className="mt-2 text-lg font-medium tracking-tight">
            Nenhum período publicado
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Quando a equipe publicar Google Ads ou Meta Ads, os números de mídia
            aparecem aqui. O tráfego do site vem da coleta Node abaixo.
          </p>
        </section>
        {siteTracking && <TrackingReportPanel tracking={siteTracking} />}
      </div>
    );
  }

  return (
    <>
      {siteTracking && (
        <section className="mb-6">
          <TrackingReportPanel tracking={siteTracking} />
        </section>
      )}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Investimento total"
          value={formatCurrency(dashboard.totals.spend)}
          hint="Consolidado do período"
        />
        <MetricCard
          label="Conversões"
          value={formatNumber(dashboard.totals.conversions)}
          tone="positive"
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
      <section className="mt-6">
        <EvolutionChart points={evolution} />
      </section>
      <section className="mt-6 grid gap-3 lg:grid-cols-2">
        {dashboard.summaries.map((summary) => (
          <PlatformCard key={summary.platform} summary={summary} />
        ))}
      </section>
    </>
  );
}
