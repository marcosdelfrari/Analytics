"use client";

import { useMemo } from "react";
import { EventMixList } from "@/app/components/event-mix-list";
import { MetricCard } from "@/app/components/metric-card";
import { PlatformLogoLabel } from "@/app/components/platform-logo";
import {
  SortableTh,
  useColumnSort,
} from "@/app/components/sortable-table";
import { formatNumber } from "@/lib/format";
import type { TrackingWindow } from "@/lib/report-period";
import { sortByAccessor } from "@/lib/sort-table";
import type {
  AttributionBreakdownRow,
  EventBreakdownRow,
} from "@/lib/tracking-analytics-shared";
import { isSiteConversionEvent } from "@/lib/tracking-events";
import {
  trackingMediaOriginLabel,
  type TrackingMediaOrigin,
} from "@/lib/utm-platform";

function conversionsTotal(eventsByName: EventBreakdownRow[]) {
  return eventsByName
    .filter((row) => isSiteConversionEvent(row.name))
    .reduce((acc, row) => acc + row.count, 0);
}

function totals(rows: AttributionBreakdownRow[]) {
  return rows.reduce(
    (acc, row) => ({
      pageviews: acc.pageviews + row.pageviews,
      events: acc.events + row.events,
      conversions: acc.conversions + (row.conversions ?? 0),
    }),
    { pageviews: 0, events: 0, conversions: 0 },
  );
}

function emptyMessage(origin: TrackingMediaOrigin) {
  if (origin === "other") {
    return "Sem visitas com UTM diferente de Google e Meta no período.";
  }
  if (origin === "none") {
    return "Sem visitas ou eventos sem UTM no período.";
  }
  return `Sem visitas com origem ${trackingMediaOriginLabel(origin)} no período.`;
}

function OriginTitle({ origin }: { origin: TrackingMediaOrigin }) {
  if (origin === "google" || origin === "meta") {
    return (
      <>
        <span>Coleta do site via UTM ·</span>
        <PlatformLogoLabel platform={origin} size={15} />
      </>
    );
  }
  if (origin === "other") {
    return <span>Coleta do site via UTM · Outras origens</span>;
  }
  return <span>Coleta do site · Sem UTM</span>;
}

type MediaAttributionSortKey =
  | "source"
  | "medium"
  | "campaign"
  | "term"
  | "content"
  | "pageviews"
  | "events"
  | "conversions";

function mediaAttributionSortValue(
  row: AttributionBreakdownRow,
  key: MediaAttributionSortKey,
) {
  switch (key) {
    case "source":
      return row.source;
    case "medium":
      return row.medium;
    case "campaign":
      return row.campaign;
    case "term":
      return row.term ?? "";
    case "content":
      return row.content ?? "";
    case "pageviews":
      return row.pageviews;
    case "events":
      return row.events;
    case "conversions":
      return row.conversions ?? 0;
  }
}

function utmCell(value: string | undefined) {
  const text = value?.trim() ? value : "—";
  return (
    <td
      className="max-w-[11rem] truncate px-3 py-2 font-mono text-[11px]"
      title={text === "—" ? undefined : text}
    >
      {text}
    </td>
  );
}

const MEDIA_COLUMN_HINTS: Record<MediaAttributionSortKey, string> = {
  source:
    "Origem do tráfego (utm_source): plataforma ou canal que enviou o visitante, ex. ig, google ou facebook.",
  medium:
    "Meio de marketing (utm_medium): tipo de mídia na URL, ex. paid_social ou cpc.",
  campaign:
    "Nome da campanha (utm_campaign): identificador que você define nos anúncios.",
  term:
    "Termo (utm_term): palavra-chave ou segmento associado ao clique, quando informado.",
  content:
    "Conteúdo (utm_content): criativo, anúncio ou variação usada no link.",
  pageviews: "Quantidade de pageviews atribuídos a esta linha de UTM no período.",
  events:
    "Total de eventos customizados (fractal.track) nesta combinação de UTM.",
  conversions:
    "Eventos de conversão do site (ex. lead ou contato) nesta combinação de UTM.",
};

export function TrackingPlatformPanel({
  origin,
  attribution,
  eventsByName,
  range,
}: {
  origin: TrackingMediaOrigin;
  attribution: AttributionBreakdownRow[];
  eventsByName: EventBreakdownRow[];
  range?: TrackingWindow;
}) {
  const sum = totals(attribution);
  const eventsTotal =
    sum.events > 0
      ? sum.events
      : eventsByName.reduce((acc, row) => acc + row.count, 0);
  const conversions =
    sum.conversions > 0 ? sum.conversions : conversionsTotal(eventsByName);
  const isEmpty = attribution.length === 0 && eventsByName.length === 0;

  const attributionSort = useColumnSort<MediaAttributionSortKey>(
    "pageviews",
    "desc",
  );

  const sortedAttribution = useMemo(
    () =>
      sortByAccessor(
        attribution,
        (row) => mediaAttributionSortValue(row, attributionSort.sortKey),
        attributionSort.direction,
      ),
    [attribution, attributionSort.sortKey, attributionSort.direction],
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
        <OriginTitle origin={origin} />
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:max-w-xl">
        <MetricCard label="Visitas" value={formatNumber(sum.pageviews)} />
        <MetricCard label="Eventos" value={formatNumber(eventsTotal)} />
        <MetricCard
          label="Conversões"
          value={formatNumber(conversions)}
          tone="positive"
        />
      </div>

      {isEmpty ? (
        <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
          {emptyMessage(origin)}
        </p>
      ) : null}

      {attribution.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[56rem] text-left text-[12px]">
            <thead>
              <tr className="border-b border-border-subtle text-muted">
                <SortableTh
                  label="Origem"
                  columnKey="source"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  hint={MEDIA_COLUMN_HINTS.source}
                />
                <SortableTh
                  label="Meio"
                  columnKey="medium"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  hint={MEDIA_COLUMN_HINTS.medium}
                />
                <SortableTh
                  label="Campanha"
                  columnKey="campaign"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  hint={MEDIA_COLUMN_HINTS.campaign}
                />
                <SortableTh
                  label="Termo"
                  columnKey="term"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  hint={MEDIA_COLUMN_HINTS.term}
                />
                <SortableTh
                  label="Conteúdo"
                  columnKey="content"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  hint={MEDIA_COLUMN_HINTS.content}
                />
                <SortableTh
                  label="Visitas"
                  columnKey="pageviews"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  align="right"
                  hint={MEDIA_COLUMN_HINTS.pageviews}
                />
                <SortableTh
                  label="Eventos"
                  columnKey="events"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  align="right"
                  hint={MEDIA_COLUMN_HINTS.events}
                />
                <SortableTh
                  label="Conversões"
                  columnKey="conversions"
                  sortKey={attributionSort.sortKey}
                  direction={attributionSort.direction}
                  onSort={attributionSort.toggleSort}
                  align="right"
                  hint={MEDIA_COLUMN_HINTS.conversions}
                />
              </tr>
            </thead>
            <tbody>
              {sortedAttribution.map((row) => {
                const rowKey = `${row.source}-${row.medium}-${row.campaign}-${row.term ?? ""}-${row.content ?? ""}`;
                return (
                  <tr
                    key={rowKey}
                    className="border-b border-border-subtle last:border-b-0"
                  >
                    {utmCell(row.source)}
                    {utmCell(row.medium)}
                    {utmCell(row.campaign)}
                    {utmCell(row.term)}
                    {utmCell(row.content)}
                    <td className="px-3 py-2 text-right font-mono">
                      {formatNumber(row.pageviews)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatNumber(row.events)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-positive">
                      {formatNumber(row.conversions ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {eventsByName.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-3.5 py-2.5">
            <h3 className="text-xs font-medium">
              {origin === "none" ? "Eventos sem UTM" : "Eventos nesta origem"}
            </h3>
            {range ? (
              <p className="mt-0.5 text-[10px] text-muted">
                Clique num evento para ver o histórico.
              </p>
            ) : null}
          </div>
          <EventMixList
            rows={eventsByName}
            range={range}
            mediaOrigin={origin}
          />
        </div>
      ) : null}
    </section>
  );
}
