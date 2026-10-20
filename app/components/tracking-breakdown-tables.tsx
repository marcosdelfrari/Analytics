import type { ReactNode } from "react";
import type {
  AttributionBreakdownRow,
  EventBreakdownRow,
} from "@/lib/tracking-analytics";
import { formatNumber } from "@/lib/format";

function BreakdownTable({
  title,
  description,
  emptyMessage,
  hasRows,
  children,
}: {
  title: string;
  description: string;
  emptyMessage: string;
  hasRows: boolean;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-[12px] text-muted-foreground">{description}</p>
      </div>
      {hasRows ? (
        children
      ) : (
        <p className="px-4 py-6 text-[12px] text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

export function TrackingBreakdownTables({
  eventsByName,
  byAttribution,
}: {
  eventsByName: EventBreakdownRow[];
  byAttribution: AttributionBreakdownRow[];
}) {
  return (
    <div className="grid gap-4">
      <BreakdownTable
        title="Origem e campanha (UTM)"
        description="utm_source, utm_medium e utm_campaign de cada visita ou evento"
        emptyMessage="Nenhum hit com parâmetros UTM no período."
        hasRows={byAttribution.length > 0}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-[12px]">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] uppercase tracking-wider text-muted">
                <th className="px-4 py-2 font-medium">Origem</th>
                <th className="px-4 py-2 font-medium">Meio</th>
                <th className="px-4 py-2 font-medium">Campanha</th>
                <th className="px-4 py-2 text-right font-medium">Visitas</th>
                <th className="px-4 py-2 text-right font-medium">Eventos</th>
              </tr>
            </thead>
            <tbody>
              {byAttribution.map((row) => (
                <tr
                  key={`${row.source}-${row.medium}-${row.campaign}`}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-4 py-2.5 font-mono">{row.source}</td>
                  <td className="px-4 py-2.5 font-mono">{row.medium}</td>
                  <td className="max-w-[10rem] truncate px-4 py-2.5 font-mono">
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
      </BreakdownTable>

      <BreakdownTable
        title="Eventos por nome"
        description="Soma de fractal.track(...) no período (ex. ver_obra)"
        emptyMessage="Nenhum evento customizado no período."
        hasRows={eventsByName.length > 0}
      >
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-border-subtle text-[11px] uppercase tracking-wider text-muted">
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {eventsByName.map((row) => (
              <tr
                key={row.name}
                className="border-b border-border-subtle last:border-b-0"
              >
                <td className="px-4 py-2.5 font-mono">{row.name}</td>
                <td className="px-4 py-2.5 text-right font-mono">
                  {formatNumber(row.count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </BreakdownTable>
    </div>
  );
}
