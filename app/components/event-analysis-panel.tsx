import Link from "next/link";
import { EventMixList } from "@/app/components/event-mix-list";
import { EventTrendChart } from "@/app/components/event-trend-chart";
import type {
  EventPlatformMixRow,
  SiteTrackingAnalytics,
} from "@/lib/tracking-analytics";
import { formatNumber, formatPercent } from "@/lib/format";

function formatRatio(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function EventPlatformMix({ rows }: { rows: EventPlatformMixRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="px-3.5 py-4 text-[12px] text-muted-foreground">
        Sem origem de mídia associada aos eventos no período.
      </p>
    );
  }

  return (
    <ul>
      {rows.map((row) => {
        const total = row.google + row.meta + row.other || 1;
        const googleShare = (row.google / total) * 100;
        const metaShare = (row.meta / total) * 100;
        const otherShare = (row.other / total) * 100;

        return (
          <li
            key={row.name}
            className="border-b border-border-subtle px-3.5 py-2 last:border-b-0"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate font-mono text-[12px]">
                {row.name}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                {formatNumber(row.google)} G · {formatNumber(row.meta)} M ·{" "}
                {formatNumber(row.other)} outros
              </span>
            </div>
            <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-border-subtle">
              <div
                className="h-full bg-google"
                style={{ width: `${googleShare}%` }}
              />
              <div
                className="h-full bg-meta"
                style={{ width: `${metaShare}%` }}
              />
              <div
                className="h-full bg-muted"
                style={{ width: `${otherShare}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function TrackingSummaryBar({
  tracking,
  showSetupLink = true,
}: {
  tracking: SiteTrackingAnalytics;
  showSetupLink?: boolean;
}) {
  if (!tracking.ready) {
    return (
      <section className="rounded-xl border border-border bg-surface px-3.5 py-3 text-[12px] text-muted-foreground">
        {showSetupLink ? (
          <>
            Configure o script em{" "}
            <Link href="/rastreamento" className="underline underline-offset-2">
              Rastreamento
            </Link>{" "}
            para começar a coletar visitas e eventos nesta conta.
          </>
        ) : (
          "A coleta do site aparece aqui quando o script da empresa estiver publicado."
        )}
      </section>
    );
  }

  const leaderHint = tracking.topEvent
    ? `${formatNumber(tracking.topEvent.count)} (${formatPercent(tracking.topEvent.share, 0)})`
    : "Sem eventos";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px]">
        <div>
          <span className="text-muted">Período: </span>
          <span className="font-medium text-foreground">{tracking.period}</span>
        </div>
        <div>
          <span className="text-muted">Visitantes: </span>
          <span className="font-mono font-medium text-foreground">
            {formatNumber(tracking.totals.visitors)}
          </span>
        </div>
        <div>
          <span className="text-muted">Pageviews: </span>
          <span className="font-mono font-medium text-foreground">
            {formatNumber(tracking.totals.pageviews)}
          </span>
        </div>
        <div>
          <span className="text-muted">Eventos: </span>
          <span className="font-mono font-medium text-positive">
            {formatNumber(tracking.totals.events)}
          </span>
        </div>
        <div>
          <span className="text-muted">Taxa: </span>
          <span className="font-mono text-foreground">
            {formatPercent(tracking.totals.eventRate, 1)} ({formatRatio(tracking.totals.eventsPerVisit)}/visita)
          </span>
        </div>
        <div>
          <span className="text-muted">Líder: </span>
          <span className="font-mono text-foreground">
            {tracking.topEvent?.name ?? "—"}
          </span>{" "}
          <span className="font-mono text-[10px] text-muted">
            · {leaderHint}
          </span>
        </div>
      </div>
      {showSetupLink ? (
        <Link
          href="/rastreamento"
          className="text-[11px] text-muted-foreground transition hover:text-foreground"
        >
          Script e testes →
        </Link>
      ) : null}
    </div>
  );
}

export function EventAnalysisPanel({
  tracking,
}: {
  tracking: SiteTrackingAnalytics;
}) {
  if (!tracking.ready) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-3.5 py-2.5">
            <h3 className="text-xs font-medium">Mix de eventos</h3>
          </div>
          <EventMixList rows={tracking.eventShare} />
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
            <h3 className="text-xs font-medium">Origem por evento</h3>
            <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-2.5 rounded-full bg-google" />
                Google
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-2.5 rounded-full bg-meta" />
                Meta
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-2.5 rounded-full bg-muted" />
                Outros
              </span>
            </div>
          </div>
          <EventPlatformMix rows={tracking.eventPlatformMix} />
        </div>
      </div>

      <EventTrendChart trend={tracking.eventTrend} />
    </div>
  );
}
