import type { PlatformSummary } from "@/lib/types";
import { formatChange, formatCurrency, formatNumber } from "@/lib/format";

function PlatformMark({ platform }: { platform: "google" | "meta" }) {
  if (platform === "google") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-wide text-google">
        Google
      </span>
    );
  }
  return (
    <span className="font-mono text-[10px] uppercase tracking-wide text-meta">
      Meta
    </span>
  );
}

export function PlatformCard({ summary }: { summary: PlatformSummary }) {
  const positive = (summary.spendChange ?? 0) >= 0;
  const campaignLabel =
    summary.activeCampaigns !== null && summary.totalCampaigns !== null
      ? `${summary.activeCampaigns}/${summary.totalCampaigns} ativas`
      : summary.period;

  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <PlatformMark platform={summary.platform} />
          <p className="mt-1 text-sm font-medium">{summary.label}</p>
        </div>
        <span className="border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {campaignLabel}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] text-muted">Investimento</p>
          <p className="font-mono text-lg">{formatCurrency(summary.spend)}</p>
          {summary.spendChange !== null && (
            <p
              className={`font-mono text-[11px] ${positive ? "text-positive" : "text-negative"}`}
            >
              {formatChange(summary.spendChange)} vs. período anterior
            </p>
          )}
        </div>
        <div>
          <p className="text-[11px] text-muted">Conversões</p>
          <p className="font-mono text-lg">
            {formatNumber(summary.conversions)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted">Impressões</p>
          <p className="font-mono text-sm text-muted-foreground">
            {formatNumber(summary.impressions)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted">Cliques</p>
          <p className="font-mono text-sm text-muted-foreground">
            {formatNumber(summary.clicks)}
          </p>
        </div>
      </div>
    </div>
  );
}
