"use client";

import { useMemo } from "react";
import {
  SortableThCampaign,
  useColumnSort,
} from "@/app/components/sortable-table";
import type { Campaign, CampaignStatus } from "@/lib/types";
import {
  formatCurrencyDetailed,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { sortByAccessor } from "@/lib/sort-table";

const statusStyles: Record<CampaignStatus, string> = {
  ativa: "text-positive border-positive/30",
  pausada: "text-muted border-border",
  aprendizado: "text-accent-muted border-border",
};

const statusLabel: Record<CampaignStatus, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  aprendizado: "Aprendizado",
};

type CampaignSortKey =
  | "name"
  | "platform"
  | "type"
  | "status"
  | "spend"
  | "conversions"
  | "ctr"
  | "cpc";

function campaignSortValue(row: Campaign, key: CampaignSortKey) {
  switch (key) {
    case "name":
      return row.name;
    case "platform":
      return row.platform;
    case "type":
      return row.type;
    case "status":
      return row.status;
    case "spend":
      return row.spend;
    case "conversions":
      return row.conversions;
    case "ctr":
      return row.ctr;
    case "cpc":
      return row.cpc;
  }
}

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  const sort = useColumnSort<CampaignSortKey>("spend", "desc");

  const sorted = useMemo(
    () =>
      sortByAccessor(
        campaigns,
        (row) => campaignSortValue(row, sort.sortKey),
        sort.direction,
      ),
    [campaigns, sort.sortKey, sort.direction],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-medium">Campanhas</h2>
        <p className="text-[12px] text-muted">
          Performance por campanha nas duas plataformas
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[12px]">
          <thead>
            <tr className="border-b border-border text-muted">
              <SortableThCampaign
                label="Campanha"
                columnKey="name"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
              />
              <SortableThCampaign
                label="Plataforma"
                columnKey="platform"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
              />
              <SortableThCampaign
                label="Tipo"
                columnKey="type"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
              />
              <SortableThCampaign
                label="Status"
                columnKey="status"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
              />
              <SortableThCampaign
                label="Gasto"
                columnKey="spend"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
                align="right"
              />
              <SortableThCampaign
                label="Conv."
                columnKey="conversions"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
                align="right"
              />
              <SortableThCampaign
                label="CTR"
                columnKey="ctr"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
                align="right"
              />
              <SortableThCampaign
                label="CPC"
                columnKey="cpc"
                sortKey={sort.sortKey}
                direction={sort.direction}
                onSort={sort.toggleSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-border-subtle transition-colors hover:bg-surface-elevated ${
                  i === sorted.length - 1 ? "border-b-0" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {row.name}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-mono text-[10px] uppercase ${
                      row.platform === "google" ? "text-google" : "text-meta"
                    }`}
                  >
                    {row.platform}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.type}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] ${statusStyles[row.status]}`}
                  >
                    {statusLabel[row.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatCurrencyDetailed(row.spend)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatNumber(row.conversions)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                  {formatPercent(row.ctr)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                  {formatCurrencyDetailed(row.cpc)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
