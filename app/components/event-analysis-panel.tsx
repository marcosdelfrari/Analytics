import Link from "next/link";
import { EventMixList } from "@/app/components/event-mix-list";
import { EventTrendChart } from "@/app/components/event-trend-chart";
import { TrackingHistoryTrigger } from "@/app/components/tracking-history-dialog";
import type {
  EventPlatformMixRow,
  SiteTrackingAnalytics,
} from "@/lib/tracking-analytics-shared";
import { formatNumber, formatPercent } from "@/lib/format";
import type { TrackingWindow } from "@/lib/report-period";

function EventPlatformMix({
  rows,
  range,
}: {
  rows: EventPlatformMixRow[];
  range: TrackingWindow;
}) {
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
            className="border-b border-border-subtle last:border-b-0"
          >
            <TrackingHistoryTrigger
              range={range}
              target={{ type: "event", name: row.name }}
              label={`Ver histórico de ${row.name}`}
              className="w-full px-3.5 py-2 text-left transition hover:bg-surface-elevated/60"
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
            </TrackingHistoryTrigger>
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
      <p className="text-[11px] text-muted-foreground sm:text-right">
        {showSetupLink ? (
          <>
            Configure o script em{" "}
            <Link href="/rastreamento" className="underline underline-offset-2">
              Rastreamento
            </Link>
            .
          </>
        ) : (
          "Aguardando a coleta do site nesta empresa."
        )}
      </p>
    );
  }

  const leaderHint = tracking.topEvent
    ? `${formatNumber(tracking.topEvent.count)} (${formatPercent(tracking.topEvent.share, 0)})`
    : "Sem eventos";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
      <span>
        Visitantes{" "}
        <strong className="font-mono font-medium text-foreground">
          {formatNumber(tracking.totals.visitors)}
        </strong>
      </span>
      <span>
        Pageviews{" "}
        <strong className="font-mono font-medium text-foreground">
          {formatNumber(tracking.totals.pageviews)}
        </strong>
      </span>
      <span>
        Eventos{" "}
        <strong className="font-mono font-medium text-positive">
          {formatNumber(tracking.totals.events)}
        </strong>
      </span>
      <span>
        Taxa conv.{" "}
        <strong className="font-mono font-normal text-positive">
          {formatPercent(tracking.totals.conversionRate, 1)}
        </strong>
      </span>
      <span>
        Líder{" "}
        <strong className="font-mono font-normal text-foreground">
          {tracking.topEvent?.name ?? "—"}
        </strong>{" "}
        <span className="font-mono text-[10px]">· {leaderHint}</span>
      </span>
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
            <p className="mt-0.5 text-[10px] text-muted">
              Clique num evento para ver o histórico.
            </p>
          </div>
          <EventMixList rows={tracking.eventShare} range={tracking.range} />
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
            <div>
              <h3 className="text-xs font-medium">Origem por evento</h3>
              <p className="mt-0.5 text-[10px] text-muted">
                Clique num evento para ver o histórico.
              </p>
            </div>
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
          <EventPlatformMix
            rows={tracking.eventPlatformMix}
            range={tracking.range}
          />
        </div>
      </div>

      <EventTrendChart trend={tracking.eventTrend} />
    </div>
  );
}
