import { TrackingHistoryTrigger } from "@/app/components/tracking-history-dialog";
import { formatNumber, formatPercent } from "@/lib/format";
import type { TrackingWindow } from "@/lib/report-period";
import { toEventShareRows } from "@/lib/tracking-analytics-shared";
import type { TrackingMediaOrigin } from "@/lib/utm-platform";

export function EventMixList({
  rows,
  emptyMessage = "Nenhum evento customizado no período.",
  range,
  mediaOrigin,
}: {
  rows: { name: string; count: number; share?: number }[];
  emptyMessage?: string;
  range?: TrackingWindow;
  /** Quando definido, o histórico do evento filtra só hits desta origem UTM. */
  mediaOrigin?: TrackingMediaOrigin;
}) {
  const ranked = rows.every((row) => row.share != null)
    ? rows.map((row) => ({
        name: row.name,
        count: row.count,
        share: row.share ?? 0,
      }))
    : toEventShareRows(rows);

  if (ranked.length === 0) {
    return (
      <p className="px-4 py-6 text-[12px] text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul>
      {ranked.map((row) => (
        <li
          key={row.name}
          className="border-b border-border-subtle last:border-b-0"
        >
          {range ? (
            <TrackingHistoryTrigger
              range={range}
              target={{
                type: "event",
                name: row.name,
                ...(mediaOrigin ? { origin: mediaOrigin } : {}),
              }}
              label={`Ver histórico de ${row.name}`}
              className="w-full px-4 py-2.5 text-left transition hover:bg-surface-elevated/60"
            >
              <EventMixRowContent row={row} />
            </TrackingHistoryTrigger>
          ) : (
            <div className="px-4 py-2.5">
              <EventMixRowContent row={row} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function EventMixRowContent({
  row,
}: {
  row: { name: string; count: number; share: number };
}) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate font-mono text-[12px]">
          {row.name}
        </span>
        <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
          {formatPercent(row.share, 1)} · {formatNumber(row.count)}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border-subtle">
        <div
          className="h-full rounded-full bg-positive"
          style={{ width: `${Math.max(row.share, row.share > 0 ? 1.5 : 0)}%` }}
        />
      </div>
    </>
  );
}
