import type { ReactNode } from "react";
import { EventMixList } from "@/app/components/event-mix-list";
import type {
  AttributionBreakdownRow,
  EventBreakdownRow,
  PathBreakdownRow,
  PathFlowRow,
} from "@/lib/tracking-analytics";
import { formatNumber, formatPercent } from "@/lib/format";

function eventRate(pageviews: number, events: number) {
  return pageviews > 0 ? (events / pageviews) * 100 : 0;
}

function BreakdownTable({
  title,
  emptyMessage,
  hasRows,
  children,
}: {
  title: string;
  emptyMessage: string;
  hasRows: boolean;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-3.5 py-2.5">
        <h3 className="text-xs font-medium">{title}</h3>
      </div>
      {hasRows ? (
        children
      ) : (
        <p className="px-3.5 py-4 text-[12px] text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}

/** Transições reais entre URLs (script envia a página anterior em `from`). */
function navigationFlowRows(rows: PathFlowRow[]) {
  return rows.filter((row) => row.fromPath.trim() !== "");
}

export function TrackingBreakdownTables({
  eventsByName,
  byAttribution,
  byPath = [],
  byPathFlow = [],
  showEvents = true,
}: {
  eventsByName: EventBreakdownRow[];
  byAttribution: AttributionBreakdownRow[];
  byPath?: PathBreakdownRow[];
  byPathFlow?: PathFlowRow[];
  showEvents?: boolean;
}) {
  const navigationFlow = navigationFlowRows(byPathFlow);

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <BreakdownTable
          title="Páginas"
          emptyMessage="Nenhuma página agregada no período."
          hasRows={byPath.length > 0}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-wider text-muted">
                  <th className="px-3.5 py-2 font-medium">Página</th>
                  <th className="px-3.5 py-2 text-right font-medium">Entradas</th>
                  <th className="px-3.5 py-2 text-right font-medium">Visitas</th>
                  <th className="px-3.5 py-2 text-right font-medium">Eventos</th>
                  <th className="px-3.5 py-2 text-right font-medium">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {byPath.map((row) => (
                  <tr
                    key={row.path}
                    className="border-b border-border-subtle last:border-b-0"
                  >
                    <td className="max-w-[12rem] truncate px-3.5 py-2 font-mono">
                      {row.path}
                    </td>
                    <td className="px-3.5 py-2 text-right font-mono">
                      {formatNumber(row.landings)}
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
        </BreakdownTable>

        <BreakdownTable
          title="Fluxo entre páginas"
          emptyMessage="Nenhuma transição entre páginas no período."
          hasRows={navigationFlow.length > 0}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-wider text-muted">
                  <th className="px-3.5 py-2 font-medium">De</th>
                  <th className="px-3.5 py-2 font-medium">Para</th>
                  <th className="px-3.5 py-2 text-right font-medium">Vezes</th>
                </tr>
              </thead>
              <tbody>
                {navigationFlow.map((row) => (
                  <tr
                    key={`${row.fromPath}->${row.path}`}
                    className="border-b border-border-subtle last:border-b-0"
                  >
                    <td className="max-w-[10rem] truncate px-3.5 py-2 font-mono">
                      {row.fromPath}
                    </td>
                    <td className="max-w-[10rem] truncate px-3.5 py-2 font-mono">
                      {row.path}
                    </td>
                    <td className="px-3.5 py-2 text-right font-mono">
                      {formatNumber(row.count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BreakdownTable>
      </div>

      <BreakdownTable
        title="Origem e campanha (UTM)"
        emptyMessage="Nenhum hit com parâmetros UTM no período."
        hasRows={byAttribution.length > 0}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-[12px]">
            <thead>
              <tr className="border-b border-border-subtle text-[10px] uppercase tracking-wider text-muted">
                <th className="px-3.5 py-2 font-medium">Origem</th>
                <th className="px-3.5 py-2 font-medium">Meio</th>
                <th className="px-3.5 py-2 font-medium">Campanha</th>
                <th className="px-3.5 py-2 text-right font-medium">Visitas</th>
                <th className="px-3.5 py-2 text-right font-medium">Eventos</th>
                <th className="px-3.5 py-2 text-right font-medium">Taxa</th>
              </tr>
            </thead>
            <tbody>
              {byAttribution.map((row) => (
                <tr
                  key={`${row.source}-${row.medium}-${row.campaign}`}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-3.5 py-2 font-mono">{row.source}</td>
                  <td className="px-3.5 py-2 font-mono">{row.medium}</td>
                  <td className="max-w-[10rem] truncate px-3.5 py-2 font-mono">
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
      </BreakdownTable>

      {showEvents && (
        <BreakdownTable
          title="Eventos por nome"
          emptyMessage="Nenhum evento customizado no período."
          hasRows={eventsByName.length > 0}
        >
          <EventMixList rows={eventsByName} />
        </BreakdownTable>
      )}
    </div>
  );
}
