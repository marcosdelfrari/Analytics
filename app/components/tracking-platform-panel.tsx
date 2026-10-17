import type {
  AttributionBreakdownRow,
  EventBreakdownRow,
} from "@/lib/tracking-analytics";
import { PlatformLogoLabel } from "@/app/components/platform-logo";
import { formatNumber } from "@/lib/format";
import { platformLabel, type Platform } from "@/lib/types";

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
    <section className="space-y-4">
      <div>
        <p className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted">
          <span>Coleta do site ·</span>
          <PlatformLogoLabel platform={platform} size={16} className="normal-case" />
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Visitas e eventos com utm_source desta plataforma (script Lótus).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-border bg-surface px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            Visitas
          </p>
          <p className="mt-1 font-mono text-xl">{formatNumber(sum.pageviews)}</p>
        </div>
        <div className="border border-border bg-surface px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            Eventos
          </p>
          <p className="mt-1 font-mono text-xl">{formatNumber(sum.events)}</p>
        </div>
      </div>

      {attribution.length === 0 ? (
        <p className="border border-border bg-surface px-4 py-6 text-[12px] text-muted-foreground">
          Nenhuma visita ou evento com origem {platformLabel(platform)} no
          período. Use UTMs como utm_source=google ou utm_source=facebook na URL.
        </p>
      ) : (
        <div className="overflow-x-auto border border-border bg-surface">
          <table className="w-full min-w-[28rem] text-left text-[12px]">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] uppercase tracking-wider text-muted">
                <th className="px-4 py-2 font-medium">Meio</th>
                <th className="px-4 py-2 font-medium">Campanha</th>
                <th className="px-4 py-2 text-right font-medium">Visitas</th>
                <th className="px-4 py-2 text-right font-medium">Eventos</th>
              </tr>
            </thead>
            <tbody>
              {attribution.map((row) => (
                <tr
                  key={`${row.medium}-${row.campaign}`}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-4 py-2.5 font-mono">{row.medium}</td>
                  <td className="max-w-[12rem] truncate px-4 py-2.5 font-mono">
                    {row.campaign}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {formatNumber(row.pageviews)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {formatNumber(row.events)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {eventsByName.length > 0 && (
        <div className="border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-medium">Eventos customizados</h3>
          </div>
          <ul>
            {eventsByName.map((row) => (
              <li
                key={row.name}
                className="flex justify-between gap-3 border-b border-border-subtle px-4 py-2.5 last:border-b-0"
              >
                <span className="font-mono">{row.name}</span>
                <span className="font-mono text-muted-foreground">
                  {formatNumber(row.count)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
