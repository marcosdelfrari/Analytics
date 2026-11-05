"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { EventMixList } from "@/app/components/event-mix-list";
import {
  SortableTh,
  useColumnSort,
} from "@/app/components/sortable-table";
import { TrackingHistoryTableRow } from "@/app/components/tracking-history-dialog";
import type {
  AttributionBreakdownRow,
  ClientBreakdownRow,
  EventBreakdownRow,
  PathBreakdownRow,
  PathFlowRow,
} from "@/lib/tracking-analytics-shared";
import { formatNumber, formatPercent } from "@/lib/format";
import { mediaAttributionRowKey } from "@/lib/media-utm-display";
import type { TrackingWindow } from "@/lib/report-period";
import { sortByAccessor } from "@/lib/sort-table";
import { conversionRatePercent } from "@/lib/tracking-events";

function pathConversionRate(row: PathBreakdownRow) {
  return conversionRatePercent(row.pageviews, row.conversions ?? 0);
}

function attributionConversionRate(row: AttributionBreakdownRow) {
  return conversionRatePercent(row.pageviews, row.conversions ?? 0);
}

function BreakdownTable({
  title,
  hint,
  emptyMessage,
  hasRows,
  children,
}: {
  title: string;
  hint?: string;
  emptyMessage: string;
  hasRows: boolean;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-3.5 py-2.5">
        <h3 className="text-xs font-medium">{title}</h3>
        {hint ? (
          <p className="mt-0.5 text-[10px] text-muted">{hint}</p>
        ) : null}
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

function navigationFlowRows(rows: PathFlowRow[]) {
  return rows.filter((row) => row.fromPath.trim() !== "");
}

type PathSortKey = "path" | "landings" | "pageviews" | "events" | "rate";

function pathSortValue(row: PathBreakdownRow, key: PathSortKey) {
  switch (key) {
    case "path":
      return row.path;
    case "landings":
      return row.landings;
    case "pageviews":
      return row.pageviews;
    case "events":
      return row.events;
    case "rate":
      return pathConversionRate(row);
  }
}

type FlowSortKey = "fromPath" | "toPath" | "count";

function flowSortValue(row: PathFlowRow, key: FlowSortKey) {
  switch (key) {
    case "fromPath":
      return row.fromPath;
    case "toPath":
      return row.path;
    case "count":
      return row.count;
  }
}

type AttributionSortKey =
  | "source"
  | "medium"
  | "campaign"
  | "pageviews"
  | "events"
  | "rate";

function attributionSortValue(row: AttributionBreakdownRow, key: AttributionSortKey) {
  switch (key) {
    case "source":
      return row.source;
    case "medium":
      return row.medium;
    case "campaign":
      return row.campaign;
    case "pageviews":
      return row.pageviews;
    case "events":
      return row.events;
    case "rate":
      return attributionConversionRate(row);
  }
}

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Celular",
  tablet: "Tablet",
  unknown: "Desconhecido",
};

type ClientSortKey = "label" | "pageviews" | "share" | "events" | "rate";

function clientSortValue(row: ClientBreakdownRow, key: ClientSortKey) {
  switch (key) {
    case "label":
      return row.label;
    case "pageviews":
    case "share":
      return row.pageviews;
    case "events":
      return row.events;
    case "rate":
      return conversionRatePercent(row.pageviews, row.conversions);
  }
}

function ClientBreakdownTable({
  title,
  labelHeader,
  rows,
  formatLabel = (label) => label,
}: {
  title: string;
  labelHeader: string;
  rows: ClientBreakdownRow[];
  formatLabel?: (label: string) => string;
}) {
  const sort = useColumnSort<ClientSortKey>("pageviews", "desc");
  const totalPageviews = rows.reduce((sum, row) => sum + row.pageviews, 0);
  const sorted = useMemo(
    () =>
      sortByAccessor(
        rows,
        (row) => clientSortValue(row, sort.sortKey),
        sort.direction,
      ),
    [rows, sort.sortKey, sort.direction],
  );

  return (
    <BreakdownTable
      title={title}
      emptyMessage="Sem dados de dispositivo no período."
      hasRows={rows.length > 0}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-border-subtle text-muted">
              <SortableTh
                label={labelHeader}
                columnKey="label"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
              />
              <SortableTh
                label="Visitas"
                columnKey="pageviews"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
                align="right"
              />
              <SortableTh
                label="% visitas"
                columnKey="share"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
                align="right"
              />
              <SortableTh
                label="Eventos"
                columnKey="events"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
                align="right"
              />
              <SortableTh
                label="Taxa conv."
                columnKey="rate"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.label}
                className="border-b border-border-subtle last:border-b-0"
              >
                <td className="max-w-[12rem] truncate px-3.5 py-2">
                  {formatLabel(row.label)}
                </td>
                <td className="px-3.5 py-2 text-right font-mono">
                  {formatNumber(row.pageviews)}
                </td>
                <td className="px-3.5 py-2 text-right font-mono text-muted-foreground">
                  {formatPercent(
                    totalPageviews > 0
                      ? (row.pageviews / totalPageviews) * 100
                      : 0,
                    1,
                  )}
                </td>
                <td className="px-3.5 py-2 text-right font-mono">
                  {formatNumber(row.events)}
                </td>
                <td className="px-3.5 py-2 text-right font-mono text-muted-foreground">
                  {formatPercent(
                    conversionRatePercent(row.pageviews, row.conversions),
                    1,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BreakdownTable>
  );
}

export function TrackingBreakdownTables({
  eventsByName,
  byAttribution,
  byPath = [],
  byPathFlow = [],
  byDevice = [],
  byBrowser = [],
  showEvents = true,
  range,
}: {
  eventsByName: EventBreakdownRow[];
  byAttribution: AttributionBreakdownRow[];
  byPath?: PathBreakdownRow[];
  byPathFlow?: PathFlowRow[];
  byDevice?: ClientBreakdownRow[];
  byBrowser?: ClientBreakdownRow[];
  showEvents?: boolean;
  range?: TrackingWindow;
}) {
  const navigationFlow = navigationFlowRows(byPathFlow);

  const pathSort = useColumnSort<PathSortKey>("pageviews", "desc");
  const flowSort = useColumnSort<FlowSortKey>("count", "desc");
  const attributionSort = useColumnSort<AttributionSortKey>("pageviews", "desc");

  const sortedPaths = useMemo(
    () =>
      sortByAccessor(
        byPath,
        (row) => pathSortValue(row, pathSort.sortKey),
        pathSort.direction,
      ),
    [byPath, pathSort.sortKey, pathSort.direction],
  );

  const sortedFlow = useMemo(
    () =>
      sortByAccessor(
        navigationFlow,
        (row) => flowSortValue(row, flowSort.sortKey),
        flowSort.direction,
      ),
    [navigationFlow, flowSort.sortKey, flowSort.direction],
  );

  const sortedAttribution = useMemo(
    () =>
      sortByAccessor(
        byAttribution,
        (row) => attributionSortValue(row, attributionSort.sortKey),
        attributionSort.direction,
      ),
    [byAttribution, attributionSort.sortKey, attributionSort.direction],
  );

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <BreakdownTable
          title="Páginas"
          hint={
            range
              ? "Clique numa página para ver o histórico de acessos."
              : undefined
          }
          emptyMessage="Nenhuma página agregada no período."
          hasRows={byPath.length > 0}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-border-subtle text-muted">
                  <SortableTh
                    label="Página"
                    columnKey="path"
                    sortKey={pathSort.sortKey}
                    direction={pathSort.direction}
                    onSort={pathSort.toggleSort}
                  />
                  <SortableTh
                    label="Entradas"
                    columnKey="landings"
                    sortKey={pathSort.sortKey}
                    direction={pathSort.direction}
                    onSort={pathSort.toggleSort}
                    align="right"
                  />
                  <SortableTh
                    label="Visitas"
                    columnKey="pageviews"
                    sortKey={pathSort.sortKey}
                    direction={pathSort.direction}
                    onSort={pathSort.toggleSort}
                    align="right"
                  />
                  <SortableTh
                    label="Eventos"
                    columnKey="events"
                    sortKey={pathSort.sortKey}
                    direction={pathSort.direction}
                    onSort={pathSort.toggleSort}
                    align="right"
                  />
                  <SortableTh
                    label="Taxa conv."
                    columnKey="rate"
                    sortKey={pathSort.sortKey}
                    direction={pathSort.direction}
                    onSort={pathSort.toggleSort}
                    align="right"
                  />
                </tr>
              </thead>
              <tbody>
                {sortedPaths.map((row) => {
                  const cells = (
                    <>
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
                        {formatPercent(pathConversionRate(row), 1)}
                      </td>
                    </>
                  );

                  if (!range) {
                    return (
                      <tr
                        key={row.path}
                        className="border-b border-border-subtle last:border-b-0"
                      >
                        {cells}
                      </tr>
                    );
                  }

                  return (
                    <TrackingHistoryTableRow
                      key={row.path}
                      range={range}
                      target={{ type: "page", path: row.path }}
                      label={`Ver histórico de ${row.path}`}
                    >
                      {cells}
                    </TrackingHistoryTableRow>
                  );
                })}
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
                <tr className="border-b border-border-subtle text-muted">
                  <SortableTh
                    label="De"
                    columnKey="fromPath"
                    sortKey={flowSort.sortKey}
                    direction={flowSort.direction}
                    onSort={flowSort.toggleSort}
                  />
                  <SortableTh
                    label="Para"
                    columnKey="toPath"
                    sortKey={flowSort.sortKey}
                    direction={flowSort.direction}
                    onSort={flowSort.toggleSort}
                  />
                  <SortableTh
                    label="Vezes"
                    columnKey="count"
                    sortKey={flowSort.sortKey}
                    direction={flowSort.direction}
                    onSort={flowSort.toggleSort}
                    align="right"
                  />
                </tr>
              </thead>
              <tbody>
                {sortedFlow.map((row) => (
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

      <div className="grid gap-3 lg:grid-cols-2">
        <ClientBreakdownTable
          title="Dispositivos"
          labelHeader="Tipo"
          rows={byDevice}
          formatLabel={(label) => DEVICE_LABELS[label] ?? label}
        />
        <ClientBreakdownTable
          title="Navegadores"
          labelHeader="Navegador"
          rows={byBrowser}
        />
      </div>

      <BreakdownTable
        title="Origem e campanha (UTM)"
        emptyMessage="Nenhum hit com parâmetros UTM no período."
        hasRows={byAttribution.length > 0}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-[12px]">
            <thead>
              <tr className="border-b border-border-subtle text-muted">
                <SortableTh
                  label="Origem"
                  columnKey="source"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                />
                <SortableTh
                  label="Meio"
                  columnKey="medium"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                />
                <SortableTh
                  label="Campanha"
                  columnKey="campaign"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                />
                <SortableTh
                  label="Visitas"
                  columnKey="pageviews"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  align="right"
                />
                <SortableTh
                  label="Eventos"
                  columnKey="events"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  align="right"
                />
                <SortableTh
                  label="Taxa conv."
                  columnKey="rate"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  align="right"
                />
              </tr>
            </thead>
            <tbody>
              {sortedAttribution.map((row) => (
                <tr
                  key={mediaAttributionRowKey(row)}
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
                    {formatPercent(attributionConversionRate(row), 1)}
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
          hint={range ? "Clique num evento para ver o histórico." : undefined}
          emptyMessage="Nenhum evento customizado no período."
          hasRows={eventsByName.length > 0}
        >
          <EventMixList rows={eventsByName} range={range} />
        </BreakdownTable>
      )}
    </div>
  );
}
