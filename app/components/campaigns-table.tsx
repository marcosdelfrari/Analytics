import type { Campaign, CampaignStatus } from "@/lib/types";
import {
  formatCurrencyDetailed,
  formatNumber,
  formatPercent,
} from "@/lib/format";

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

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Campanhas</h2>
        <p className="text-[12px] text-muted">
          Performance por campanha nas duas plataformas
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[12px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted">
              <th className="px-4 py-2.5 font-medium">Campanha</th>
              <th className="px-4 py-2.5 font-medium">Plataforma</th>
              <th className="px-4 py-2.5 font-medium">Tipo</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium text-right">Gasto</th>
              <th className="px-4 py-2.5 font-medium text-right">Conv.</th>
              <th className="px-4 py-2.5 font-medium text-right">CTR</th>
              <th className="px-4 py-2.5 font-medium text-right">CPC</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-border-subtle transition-colors hover:bg-surface-elevated ${
                  i === campaigns.length - 1 ? "border-b-0" : ""
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
                    className={`inline-block border px-1.5 py-0.5 text-[10px] ${statusStyles[row.status]}`}
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
