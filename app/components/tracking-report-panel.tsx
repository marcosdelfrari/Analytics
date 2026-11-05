import Link from "next/link";
import { MetricCard } from "@/app/components/metric-card";
import { SiteTrafficChart } from "@/app/components/site-traffic-chart";
import { TrackingBreakdownTables } from "@/app/components/tracking-breakdown-tables";
import type { SiteTrackingAnalytics } from "@/lib/tracking-analytics-shared";
import { formatNumber, formatPercent } from "@/lib/format";

export function TrackingReportPanel({
  tracking,
  variant = "full",
  showSetupLink = true,
  showReportLink = true,
}: {
  tracking: SiteTrackingAnalytics;
  variant?: "full" | "overview" | "metrics";
  showSetupLink?: boolean;
  showReportLink?: boolean;
}) {
  if (!tracking.ready) {
    return (
      <section className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
        {showSetupLink ? (
          <>
            Configure o script em{" "}
            <Link href="/rastreamento" className="underline underline-offset-2">
              Rastreamento
            </Link>{" "}
            para começar a coletar visitas nesta conta.
          </>
        ) : (
          "A coleta do site aparece aqui quando o script da empresa estiver publicado."
        )}
      </section>
    );
  }

  const showBreakdown = variant === "full";
  const showChart = variant !== "metrics";
  const compactMetrics = variant === "overview" || variant === "metrics";
  const leaderHint = tracking.topEvent
    ? `${formatNumber(tracking.topEvent.count)} (${formatPercent(tracking.topEvent.share, 0)})`
    : undefined;

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-medium text-foreground">
            {variant === "full" ? "Coleta do site" : "Tráfego do site"}
          </h3>
          <span className="font-mono text-[11px] text-muted">
            {tracking.period}
          </span>
        </div>
        {(showSetupLink || showReportLink) && (
          <div className="flex flex-wrap items-center gap-3">
            {showSetupLink ? (
              <Link
                href="/rastreamento"
                className="text-[11px] text-muted-foreground transition hover:text-foreground"
              >
                Script e pixel
              </Link>
            ) : null}
            {showReportLink ? (
              <Link
                href="/relatorios"
                className="text-[11px] text-muted-foreground transition hover:text-foreground"
              >
                Ver UTMs e páginas →
              </Link>
            ) : null}
          </div>
        )}
      </header>

      <section
        className={`grid grid-cols-2 gap-2.5 ${
          compactMetrics
            ? "sm:grid-cols-3 lg:grid-cols-5"
            : "sm:grid-cols-3 lg:grid-cols-6"
        }`}
      >
        <MetricCard
          label="Visitantes"
          value={formatNumber(tracking.totals.visitors)}
        />
        <MetricCard
          label="Navegações"
          value={formatNumber(tracking.totals.pageviews)}
        />
        <MetricCard
          label="Eventos"
          value={formatNumber(tracking.totals.events)}
        />
        <MetricCard
          label="Conversões"
          value={formatNumber(tracking.totals.conversions)}
          tone="positive"
        />
        <MetricCard
          label="Taxa de conversão"
          value={formatPercent(tracking.totals.conversionRate, 1)}
          tone="positive"
        />
        {variant === "full" ? (
          <MetricCard
            label="Evento líder"
            value={tracking.topEvent?.name ?? "—"}
            hint={leaderHint}
          />
        ) : null}
      </section>

      {showChart ? <SiteTrafficChart points={tracking.points} /> : null}

      {showBreakdown && (
        <TrackingBreakdownTables
          eventsByName={tracking.eventsByName}
          byAttribution={tracking.byAttribution}
          byPath={tracking.byPath}
          byPathFlow={tracking.byPathFlow}
          byDevice={tracking.byDevice}
          byBrowser={tracking.byBrowser}
          range={tracking.range}
        />
      )}
    </div>
  );
}
