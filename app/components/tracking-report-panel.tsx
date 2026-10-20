import Link from "next/link";
import { MetricCard } from "@/app/components/metric-card";
import { SiteTrafficChart } from "@/app/components/site-traffic-chart";
import { TrackingBreakdownTables } from "@/app/components/tracking-breakdown-tables";
import type { SiteTrackingAnalytics } from "@/lib/tracking-analytics";
import { formatNumber } from "@/lib/format";

export function TrackingReportPanel({
  tracking,
  variant = "full",
}: {
  tracking: SiteTrackingAnalytics;
  variant?: "full" | "overview";
}) {
  if (!tracking.ready) {
    return (
      <section className="border border-border bg-surface px-4 py-8 text-[13px] text-muted-foreground">
        Configure o script em{" "}
        <Link href="/rastreamento" className="underline underline-offset-2">
          Rastreamento
        </Link>{" "}
        para começar a coletar visitas nesta conta.
      </section>
    );
  }

  const showBreakdown = variant === "full";

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted">
            {variant === "overview"
              ? "Visão geral do site"
              : "Coleta do site"}
          </p>
          <h3 className="mt-1 text-base font-medium">{tracking.period}</h3>
          <p className="mt-1 max-w-2xl text-[12px] text-muted-foreground">
            {variant === "overview"
              ? "Totais de visitas e eventos de todas as origens no período."
              : "Dados gravados pela API Node e agregados pelo worker."}
          </p>
        </div>
        <Link
          href="/rastreamento"
          className="text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Script e testes
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Visitas (pageviews)"
          value={formatNumber(tracking.totals.pageviews)}
          hint="Período selecionado"
        />
        <MetricCard
          label="Eventos customizados"
          value={formatNumber(tracking.totals.events)}
          hint="fractal.track(...)"
        />
      </section>

      <SiteTrafficChart points={tracking.points} />

      {showBreakdown && (
        <TrackingBreakdownTables
          eventsByName={tracking.eventsByName}
          byAttribution={tracking.byAttribution}
        />
      )}
    </div>
  );
}
