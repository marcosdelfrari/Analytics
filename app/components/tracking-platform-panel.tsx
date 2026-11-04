import { EventMixList } from "@/app/components/event-mix-list";
import { MetricCard } from "@/app/components/metric-card";
import { PlatformLogoLabel } from "@/app/components/platform-logo";
import { formatNumber, formatPercent } from "@/lib/format";
import type {
  AttributionBreakdownRow,
  EventBreakdownRow,
} from "@/lib/tracking-analytics";
import { platformLabel, type Platform } from "@/lib/types";

function eventRate(pageviews: number, events: number) {
  return pageviews > 0 ? (events / pageviews) * 100 : 0;
}

function totals(rows: AttributionBreakdownRow[]) {
  return rows.reduce(
    (acc, row) => ({
      pageviews: acc.pageviews + row.pageviews,
      events: acc.events + row.events,
    }),
    { pageviews: 0, events: 0 },
  );
}

export function TrackingPlatformPanel({
  platform,
  attribution,
  eventsByName,
}: {
  platform: Platform;
  attribution: AttributionBreakdownRow[];
  eventsByName: EventBreakdownRow[];
}) {
  const sum = totals(attribution);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
        <span>Coleta do site via UTM ·</span>
        <PlatformLogoLabel platform={platform} size={15} />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:max-w-md">
        <MetricCard label="Visitas" value={formatNumber(sum.pageviews)} />
        <MetricCard
          label="Eventos"
          value={formatNumber(sum.events)}
          tone="positive"
        />
      </div>

      {attribution.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
          Sem visitas com origem {platformLabel(platform)} no período.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[28rem] text-left text-[12px]">
            <thead>
              <tr className="border-b border-border-subtle text-[10px] uppercase tracking-wider text-muted">
                <th className="px-3.5 py-2 font-medium">Meio</th>
                <th className="px-3.5 py-2 font-medium">Campanha</th>
                <th className="px-3.5 py-2 text-right font-medium">Visitas</th>
                <th className="px-3.5 py-2 text-right font-medium">Eventos</th>
                <th className="px-3.5 py-2 text-right font-medium">Taxa</th>
              </tr>
            </thead>
            <tbody>
              {attribution.map((row) => (
                <tr
                  key={`${row.medium}-${row.campaign}`}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-3.5 py-2 font-mono">{row.medium}</td>
                  <td className="max-w-[12rem] truncate px-3.5 py-2 font-mono">
                    {row.campaign}
                  </td>
                  <td className="px-3.5 py-2 text-right font-mono">
                    {formatNumber(row.pageviews)}
                  </td>
                  <td className="px-3.5 py-2 text-right font-mono">
                    {formatNumber(row.events)}
                  </td>
                  <td className="px-3.5 py-2 text-right font-mono text-muted-foreground">
                    {formatPercent(eventRate(row.pageviews, row.events), 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {eventsByName.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-3.5 py-2.5">
            <h3 className="text-xs font-medium">Eventos nesta origem</h3>
          </div>
          <EventMixList rows={eventsByName} />
        </div>
      )}
    </section>
  );
}
